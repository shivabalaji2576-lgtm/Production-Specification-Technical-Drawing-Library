import React from 'react';
import { MessageSquare } from 'lucide-react';

function ProductsPage({ products, productsLoading, triggerProductInquiry }) {
  return (
    <section className="section-products fade-in">
      <div className="products-intro">
        <h2 className="section-title">B2B Product Specifications Catalog</h2>
        <p className="section-subtitle">Browse our verified active closures catalog, direct from our production library. Click any product to request a batch quote.</p>
      </div>

      {productsLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading specifications catalog...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state glass-panel">
          <h3>No Active Products Listed</h3>
          <p>Please contact our sales desk for custom cap design requirements.</p>
        </div>
      ) : (
        <div className="products-catalog-grid">
          {products.map(product => (
            <div key={product.id} className="public-product-card glass-panel">
              <div className="card-header-badge">
                <span className="product-code">{product.Maintains}</span>
                <span className="drawing-ref">{product.database}</span>
              </div>

              <div className="card-body">
                <h3>{product.closure}</h3>
                <p className="product-desc-title">{product.product}</p>

                <div className="specs-details">
                  <h4>Technical Specifications:</h4>
                  <p className="specs-content-text">{product.specifications}</p>
                </div>

                <div className="compliance-row">
                  <span className="compliance-label">Audit Engine Status:</span>
                  <span className={`status-badge-inline compliance-${product.compliance?.complianceStatus.toLowerCase() || 'passed'}`}>
                    {product.compliance?.complianceStatus || 'Passed'}
                  </span>
                </div>
              </div>

              <div className="card-footer">
                <button
                  className="btn btn-sm btn-primary w-full"
                  onClick={() => triggerProductInquiry(product.Maintains)}
                >
                  <MessageSquare size={14} style={{ marginRight: '6px' }} />
                  Inquire &amp; Get Quote
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ProductsPage;
