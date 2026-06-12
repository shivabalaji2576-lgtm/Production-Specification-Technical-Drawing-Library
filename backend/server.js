const express = require('express');
const cors = require('cors');
const { db, dbRun, dbAll, dbGet, initDatabase } = require('./database');
const { processSpecification } = require('./rulesEngine');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Global error handler for malformed JSON request bodies
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: "Malformed JSON payload: " + err.message,
      code: 400
    });
  }
  next();
});

// Sanitization middleware / helper
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  // Strip HTML tags and dangerous characters
  return str.replace(/<[^>]*>/g, '').trim();
}

function sanitizeObject(obj) {
  const sanitized = {};
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      sanitized[key] = sanitizeString(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }
  return sanitized;
}

// 1. Health check route
app.get('/api/health', (req, res) => {
  try {
    res.status(200).json({
      status: "ok",
      project: "product-specification-&-techni"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server health check failed: " + error.message,
      code: 500
    });
  }
});

// Auth: Register (Create Account)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role = 'System Operator' } = sanitizeObject(req.body);

    if (!username || !username.trim()) {
      return res.status(400).json({
        success: false,
        message: "Username is required.",
        code: 400
      });
    }

    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: "A valid email address is required.",
        code: 400
      });
    }

    if (!password || password.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 4 characters long.",
        code: 400
      });
    }

    // Check duplicate username
    const existingUser = await dbGet('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `Username '${username}' is already taken.`,
        code: 400
      });
    }

    // Check duplicate email
    const existingEmail = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `Email '${email}' is already registered.`,
        code: 400
      });
    }

    // Insert user with email
    await dbRun(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username.trim(), email.trim(), password, role]
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully. You can now log in."
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database error during registration: " + error.message,
      code: 500
    });
  }
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    const identifier = sanitizeString(username || email);
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Username/email and password are required.",
        code: 400
      });
    }

    const user = await dbGet('SELECT * FROM users WHERE username = ? OR email = ?', [identifier, identifier]);
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid username/email or password.",
        code: 401
      });
    }

    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      user: {
        id: user.id,
        name: user.username,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Authentication failed: " + error.message,
      code: 500
    });
  }
});

// Auth: Update Profile (change username/password)
app.put('/api/auth/update-profile', async (req, res) => {
  try {
    const { userId, username, password } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
        code: 400
      });
    }

    const cleanUsername = sanitizeString(username);
    if (!cleanUsername || cleanUsername.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Username must be at least 3 characters long.",
        code: 400
      });
    }

    if (!password || password.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 4 characters long.",
        code: 400
      });
    }

    // Check duplicate username for other users
    const duplicateUser = await dbGet('SELECT id FROM users WHERE username = ? AND id != ?', [cleanUsername.trim(), userId]);
    if (duplicateUser) {
      return res.status(400).json({
        success: false,
        message: `Username '${cleanUsername}' is already taken.`,
        code: 400
      });
    }

    await dbRun(
      'UPDATE users SET username = ?, password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [cleanUsername.trim(), password, userId]
    );

    res.status(200).json({
      success: true,
      message: "Credentials updated successfully. Please log in with your new credentials."
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile: " + error.message,
      code: 500
    });
  }
});


// 2. Rules engine endpoint (to dry-run validate specs in frontend before submitting)
app.post('/api/engine/validate', (req, res) => {
  try {
    const data = sanitizeObject(req.body);
    const analysis = processSpecification(data);
    res.status(200).json({
      success: true,
      analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Validation engine failed: " + error.message,
      code: 500
    });
  }
});

// 3. POST /api/product_specification_technical_dra (Create spec)
app.post('/api/product_specification_technical_dra', async (req, res) => {
  try {
    const data = sanitizeObject(req.body);
    
    // Process through rules engine
    const analysis = processSpecification(data);
    if (!analysis.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed: " + analysis.errors.join(", "),
        errors: analysis.errors,
        code: 400
      });
    }

    const { Maintains, database, closure, product, specifications, status = 'Active' } = data;

    // Check duplicate Product Code
    const duplicate = await dbGet('SELECT id FROM product_specification_technical_dra WHERE Maintains = ?', [Maintains]);
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: `Product Code (Maintains) '${Maintains}' already exists.`,
        code: 400
      });
    }

    // Insert to DB
    const result = await dbRun(
      `INSERT INTO product_specification_technical_dra (Maintains, database, closure, product, specifications, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [Maintains, database, closure, product, specifications, status]
    );

    const insertedId = result.lastID;



    res.status(201).json({
      success: true,
      id: insertedId,
      message: "Product specification created successfully.",
      analysis
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database error during spec creation: " + error.message,
      code: 500
    });
  }
});

// 4. GET /api/product_specification_technical_dra (Query specs with filter & pagination)
app.get('/api/product_specification_technical_dra', async (req, res) => {
  try {
    const statusFilter = sanitizeString(req.query.status);
    const searchQuery = sanitizeString(req.query.search);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM product_specification_technical_dra WHERE 1=1';
    const params = [];

    if (statusFilter && statusFilter !== 'All') {
      sql += ' AND status = ?';
      params.push(statusFilter);
    }

    if (searchQuery) {
      sql += ' AND (Maintains LIKE ? OR product LIKE ? OR database LIKE ?)';
      params.push(`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`);
    }

    // Get total count
    let countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as count');
    const totalCountResult = await dbGet(countSql, params);
    const totalCount = totalCountResult ? totalCountResult.count : 0;

    // Add sort and limit
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = await dbAll(sql, params);

    // Apply rule validations to rows in-memory for live alerts
    const records = rows.map(row => {
      const analysis = processSpecification(row);
      return {
        ...row,
        compliance: analysis.metrics
      };
    });

    res.status(200).json({
      success: true,
      records,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database query failed: " + error.message,
      code: 500
    });
  }
});

// 5. GET /api/product_specification_technical_dra/:id/detail (Retrieves spec + joined inventory & audit logs)
app.get('/api/product_specification_technical_dra/:id/detail', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID specification format.",
        code: 400
      });
    }

    // Fetch primary specification
    const spec = await dbGet('SELECT * FROM product_specification_technical_dra WHERE id = ?', [id]);
    if (!spec) {
      return res.status(404).json({
        success: false,
        message: "Product specification not found.",
        code: 404
      });
    }

    // Run business logic engine analysis
    const analysis = processSpecification(spec);

    res.status(200).json({
      success: true,
      specification: {
        ...spec,
        analysis
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database query failed for detail view: " + error.message,
      code: 500
    });
  }
});

// 6. PUT /api/product_specification_technical_dra/:id (Update spec)
app.put('/api/product_specification_technical_dra/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid specification ID.",
        code: 400
      });
    }

    const data = sanitizeObject(req.body);
    const analysis = processSpecification(data);
    if (!analysis.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed: " + analysis.errors.join(", "),
        errors: analysis.errors,
        code: 400
      });
    }

    // Check if the record exists
    const currentSpec = await dbGet('SELECT * FROM product_specification_technical_dra WHERE id = ?', [id]);
    if (!currentSpec) {
      return res.status(404).json({
        success: false,
        message: "Specification not found.",
        code: 404
      });
    }

    const { Maintains, database, closure, product, specifications, status } = data;

    // Check duplicate maintains if Maintains is changing
    if (Maintains !== currentSpec.Maintains) {
      const duplicate = await dbGet('SELECT id FROM product_specification_technical_dra WHERE Maintains = ? AND id != ?', [Maintains, id]);
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Product Code (Maintains) '${Maintains}' already exists.`,
          code: 400
        });
      }
    }

    // Update
    await dbRun(
      `UPDATE product_specification_technical_dra 
       SET Maintains = ?, database = ?, closure = ?, product = ?, specifications = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [Maintains, database, closure, product, specifications, status, id]
    );



    res.status(200).json({
      success: true,
      message: "Specification updated successfully.",
      analysis
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database error during update: " + error.message,
      code: 500
    });
  }
});

// 7. PATCH /api/product_specification_technical_dra/:id/status (Status only change)
app.patch('/api/product_specification_technical_dra/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const status = sanitizeString(req.body.status);

    if (!['Active', 'Completed', 'Archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value. Allowed: Active, Completed, Archived",
        code: 400
      });
    }

    const currentSpec = await dbGet('SELECT * FROM product_specification_technical_dra WHERE id = ?', [id]);
    if (!currentSpec) {
      return res.status(404).json({
        success: false,
        message: "Specification not found.",
        code: 404
      });
    }

    await dbRun(
      `UPDATE product_specification_technical_dra SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, id]
    );



    res.status(200).json({
      success: true,
      message: "Status updated successfully.",
      currentStatus: status
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database error during status update: " + error.message,
      code: 500
    });
  }
});

// 8. GET /api/dashboard/summary (Dashboard counts and status distribution)
app.get('/api/dashboard/summary', async (req, res) => {
  try {
    // Counts
    const totals = await dbGet(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'Archived' THEN 1 ELSE 0 END) as archived
      FROM product_specification_technical_dra
    `);

    // Rules evaluation stats (in memory evaluation to get active alerts)
    const allSpecs = await dbAll('SELECT * FROM product_specification_technical_dra');
    let warningCount = 0;
    let failedCount = 0;

    allSpecs.forEach(spec => {
      const result = processSpecification(spec);
      if (result.metrics.complianceStatus === 'Warning') warningCount++;
      if (result.metrics.complianceStatus === 'Failed') failedCount++;
    });

    res.status(200).json({
      success: true,
      summary: {
        total: totals.total || 0,
        active: totals.active || 0,
        completed: totals.completed || 0,
        archived: totals.archived || 0,
        warnings: warningCount,
        failed: failedCount
      },
      recentLogs: []
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard summary: " + error.message,
      code: 500
    });
  }
});

// 9. GET /api/reports/summary (Aggregates reports and lists specifications)
app.get('/api/reports/summary', async (req, res) => {
  try {
    const specs = await dbAll('SELECT * FROM product_specification_technical_dra ORDER BY Maintains ASC');

    const formattedSpecs = specs.map(spec => {
      const analysis = processSpecification(spec);
      return {
        id: spec.id,
        ProductCode: spec.Maintains,
        DrawingRef: spec.database,
        ClosureType: spec.closure,
        ProductName: spec.product,
        Status: spec.status,
        Tolerance: analysis.metrics.parsedTolerance,
        Compliance: analysis.metrics.complianceStatus,
        CreatedAt: spec.created_at
      };
    });

    res.status(200).json({
      success: true,
      specifications: formattedSpecs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate report summary: " + error.message,
      code: 500
    });
  }
});

// Start listening and initialize database
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initDatabase();
});
