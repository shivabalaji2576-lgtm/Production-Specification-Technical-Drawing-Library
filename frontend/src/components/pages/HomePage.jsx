import { Cpu, Layers, Shield, Award, ArrowRight } from 'lucide-react';

function HomePage({ setActiveTab }) {
  return (
    <section className="section-home fade-in">
      <div className="hero-banner glass-panel">
        <div className="hero-text-content">
          <span className="badge-featured">Rajkot, Gujarat, India</span>
          <h1>Precision-Engineered Closures &amp; Seals</h1>
          <p className="hero-subtext">
            SV Closures Private Limited delivers high-performance packaging components, bottle caps, and rubber seals manufactured under sterile conditions for food, pharma, and industrial enterprises globally.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => setActiveTab('products')}>
              <span>Explore Catalog</span>
              <ArrowRight size={16} />
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveTab('contact')}>
              Request Quote
            </button>
          </div>
        </div>
        <div className="hero-image-box">
          <img src={`${import.meta.env.BASE_URL}factory_floor.png`} alt="SV Closures Factory Floor" className="hero-image" />
          <div className="glass-stats-overlay">
            <div className="stat-item">
              <span className="stat-number">50M+</span>
              <span className="stat-label">Units / Month</span>
            </div>
            <div className="stat-item border-left">
              <span className="stat-number">±0.02mm</span>
              <span className="stat-label">Precision Tolerance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Strengths */}
      <div className="strengths-section">
        <h2 className="section-title text-center">Why Partner with SV Closures?</h2>
        <p className="section-subtitle text-center">Our commitment to speed, precision, and B2B compliance is what sets us apart.</p>

        <div className="strengths-grid">
          <div className="strength-card glass-panel">
            <div className="strength-icon-box"><Cpu size={24} className="icon-pulse" /></div>
            <h3>High-Speed Operations</h3>
            <p>Equipped with state-of-the-art fully electric injection and compression moulding machineries ensuring high volume runs.</p>
          </div>

          <div className="strength-card glass-panel">
            <div className="strength-icon-box"><Layers size={24} /></div>
            <h3>Strict Tolerances</h3>
            <p>Rigorous quality controls with digital checking parameters keeping dimensional tolerance deviations under &plusmn;0.05mm.</p>
          </div>

          <div className="strength-card glass-panel">
            <div className="strength-icon-box"><Shield size={24} /></div>
            <h3>Certified Packaging</h3>
            <p>Our pharma seals and beverage caps conform to strict FDA food grade and USP Class VI compliance criteria.</p>
          </div>

          <div className="strength-card glass-panel">
            <div className="strength-icon-box"><Award size={24} /></div>
            <h3>Engineering Blueprints</h3>
            <p>Every product holds index drawing links with technical parameters logged in our verified rules system.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomePage;
