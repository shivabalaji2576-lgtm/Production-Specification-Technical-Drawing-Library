import { Cpu, Layers, Eye } from 'lucide-react';

function CapabilitiesPage() {
  return (
    <section className="section-capabilities fade-in">
      <h2 className="section-title">Manufacturing Infrastructure</h2>
      <p className="section-subtitle text-center">Precision engineering and rapid throughput capacity out of Rajkot, Gujarat, India.</p>

      <div className="capabilities-grid">
        <div className="capability-card glass-panel">
          <div className="cap-icon-box"><Cpu size={24} /></div>
          <h3>Advanced Injection Moulding</h3>
          <p>Our lines operate hydraulic and electric machines from Arburg and Sumitomo, enabling high cavity runs (up to 48 cavities) with cycle times below 5 seconds. This guarantees optimal dimensional stability on huge volumes.</p>
        </div>

        <div className="capability-card glass-panel">
          <div className="cap-icon-box"><Layers size={24} /></div>
          <h3>Continuous Compression Systems</h3>
          <p>For high-volume beverage closures, we deploy high-speed rotary compression systems. Compression moulding offers lower heating requirements, leading to zero shrinkage variance across cap threading.</p>
        </div>

        <div className="capability-card glass-panel">
          <div className="cap-icon-box"><Eye size={24} /></div>
          <h3>Optical Quality Assurance</h3>
          <p>Every cap passes through high-resolution overhead vision cameras capable of inspecting 1,500 caps per minute. Automated air-jets eject any cap presenting sealing liner defects, flashing, or thread inconsistencies.</p>
        </div>
      </div>

      <div className="infrastructure-showcase glass-panel">
        <div className="infra-text">
          <h3>Our Production Capacity</h3>
          <p>
            With four high-output production lines running 24/7 in our Rajkot facility, we maintain a monthly capacity exceeding 50 million units. This high capacity allows us to offer flexible B2B blanket-order contracts with rapid lead times.
          </p>
          <div className="progress-meters">
            <div className="meter-item">
              <span className="meter-label">Beverage Caps Capacity (Monthly)</span>
              <div className="meter-track"><div className="meter-fill" style={{ width: '85%' }}></div></div>
              <span className="meter-value">35 Million Units</span>
            </div>
            <div className="meter-item">
              <span className="meter-label">Pharma Rubber &amp; Aluminium Seals (Monthly)</span>
              <div className="meter-track"><div className="meter-fill" style={{ width: '90%' }}></div></div>
              <span className="meter-value">12 Million Units</span>
            </div>
            <div className="meter-item">
              <span className="meter-label">Industrial Lids &amp; Caps (Monthly)</span>
              <div className="meter-track"><div className="meter-fill" style={{ width: '70%' }}></div></div>
              <span className="meter-value">5 Million Units</span>
            </div>
          </div>
        </div>
        <div className="infra-image-container">
          <img src={`${import.meta.env.BASE_URL}quality_lab.png`} alt="SV Closures Quality Testing Lab" className="infra-image" />
        </div>
      </div>
    </section>
  );
}

export default CapabilitiesPage;
