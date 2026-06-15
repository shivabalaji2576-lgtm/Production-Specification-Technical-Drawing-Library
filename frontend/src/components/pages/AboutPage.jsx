import React from 'react';
import { Award, Shield, CheckCircle } from 'lucide-react';

function AboutPage() {
  return (
    <section className="section-about fade-in">
      <h2 className="section-title">Corporate Overview</h2>
      <div className="about-grid">
        <div className="about-text glass-panel">
          <h3>Our Story</h3>
          <p>
            Founded and operated out of the industrial zones of Rajkot, Gujarat, <strong>SV Closures Private Limited (S V Industries)</strong> has established itself as a pioneer in plastic packaging closures, lids, and seals. We cater to demanding packaging demands across the beverage, pharmaceutical, dairy, and chemical product manufacturing sectors.
          </p>
          <p>
            As an essential vendor in the packaging supply chain, we recognize that a closure is not just a cap—it represents carbonation containment, product freshness, leak prevention, and child safety compliance. That is why we bridge raw polymer processing with digital verification engines, ensuring that every batch meets the exact tolerances our customers specify.
          </p>

          <h3 style={{ marginTop: '24px' }}>Our Core Pillars</h3>
          <ul className="pillars-list">
            <li><strong>Zero Defect Philosophy</strong>: 100% optical sorting systems monitor dimensions in real-time.</li>
            <li><strong>Continuous Traceability</strong>: Production runs mapped to exact raw material batch and CAD drawing revision logs.</li>
            <li><strong>Compliance Confidence</strong>: Full certification support for regulatory filings in EU/FDA zones.</li>
          </ul>
        </div>

        <div className="about-sidebar">
          <div className="certifications-box glass-panel">
            <h3>Compliance &amp; Standards</h3>
            <div className="cert-item">
              <Award className="cert-icon" size={24} />
              <div>
                <h4>ISO 9001:2015</h4>
                <p>Certified Quality Management Systems monitoring manufacturing lines.</p>
              </div>
            </div>
            <div className="cert-item">
              <Shield className="cert-icon text-teal" size={24} />
              <div>
                <h4>FDA Food-Grade Approved</h4>
                <p>All materials processed for food and dairy applications hold active FDA material compliance registries.</p>
              </div>
            </div>
            <div className="cert-item">
              <CheckCircle className="cert-icon text-indigo" size={24} />
              <div>
                <h4>USP Class VI Certified</h4>
                <p>Elastomeric and plastic vial closures manufactured in cleanroom units conform to United States Pharmacopeia standards.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutPage;
