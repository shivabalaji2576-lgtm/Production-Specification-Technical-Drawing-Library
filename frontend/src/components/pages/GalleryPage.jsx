function GalleryPage() {
  return (
    <section className="section-gallery fade-in">
      <h2 className="section-title">Facility &amp; Showcase Gallery</h2>
      <p className="section-subtitle">A visual walkthrough of our technology, cleanroom facilities, and finished packaging closures.</p>

      <div className="gallery-grid">
        <div className="gallery-card glass-panel">
          <div className="gallery-image-box">
            <img src={`${import.meta.env.BASE_URL}factory_floor.png`} alt="Cap Production Line" />
          </div>
          <div className="gallery-card-body">
            <h4>Cap Compression Production</h4>
            <p>Fully automated compression line feeding beverage caps for global packaging brands.</p>
          </div>
        </div>

        <div className="gallery-card glass-panel">
          <div className="gallery-image-box">
            <img src={`${import.meta.env.BASE_URL}product_showcase.png`} alt="SV Closures Product Portfolio" />
          </div>
          <div className="gallery-card-body">
            <h4>Product Assembly Portfolio</h4>
            <p>Our primary range of dairy caps, vaccine vial closures, and chemical safety spouts.</p>
          </div>
        </div>

        <div className="gallery-card glass-panel">
          <div className="gallery-image-box">
            <img src={`${import.meta.env.BASE_URL}quality_lab.png`} alt="Quality Inspection Center" />
          </div>
          <div className="gallery-card-body">
            <h4>Dimension &amp; Calibration Lab</h4>
            <p>Sterile QA chamber where specs tolerances are benchmarked against CAD metrics.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default GalleryPage;
