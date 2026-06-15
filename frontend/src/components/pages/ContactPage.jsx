import React from 'react';
import { Mail, Phone, MapPin, CheckCircle, MessageSquare } from 'lucide-react';

function ContactPage({
  inquiryForm,
  formErrors,
  submitSuccess,
  submitLoading,
  handleInquiryChange,
  handleInquirySubmit,
  setSubmitSuccess
}) {
  return (
    <section className="section-contact fade-in">
      <h2 className="section-title">Get in Touch / Request Quote</h2>
      <p className="section-subtitle text-center">Have a packaging inquiry? Fill out our B2B form or reach out directly via WhatsApp.</p>

      <div className="contact-grid">
        <div className="contact-info-column">
          <div className="contact-card glass-panel">
            <h3>Direct Contact Info</h3>
            <div className="info-item">
              <MapPin className="text-accent" size={20} />
              <p><strong>Factory Address:</strong><br />Rajkot Industrial Area, Rajkot, Gujarat - 360024, India</p>
            </div>
            <div className="info-item">
              <Phone className="text-accent" size={20} />
              <p><strong>Sales Helpline:</strong><br /><a href="tel:+919876543210">+91 98765 43210</a></p>
            </div>
            <div className="info-item">
              <Mail className="text-accent" size={20} />
              <p><strong>Inquiry Email:</strong><br /><a href="mailto:ANIRUDDHP1977@gmail.com">ANIRUDDHP1977@gmail.com</a></p>
            </div>

            <hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '20px 0' }} />

            {/* WhatsApp Quick Link */}
            <a
              href="https://wa.me/919876543210?text=Hi%20SV%20Closures%20team,%20we%20have%20a%20B2B%20inquiry%20regarding%20caps/seals."
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-btn-large"
            >
              <MessageSquare size={18} />
              <span>Quick Query via WhatsApp</span>
            </a>
          </div>

          {/* Google Maps embed */}
          <div className="map-embed-card glass-panel">
            <iframe
              title="SV Closures Factory Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d118134.76171542457!2d70.7420993077759!3d22.298418042456488!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3959c98ac71cdf77%3A0x8849af588da6fa98!2sRajkot%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1718430000000!5m2!1sen!2sin"
              width="100%"
              height="200"
              style={{ border: 0, borderRadius: '8px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        {/* Inquiry Form */}
        <div className="inquiry-form-card glass-panel">
          <h3>B2B Inquiry Intake Form</h3>

          {submitSuccess ? (
            <div className="success-intake-box">
              <CheckCircle size={48} className="text-success" />
              <h4>Thank You!</h4>
              <p>Your product requirement has been logged in our system. Our Sales Representative will review your specs and email a catalog quote shortly.</p>
              <button className="btn btn-secondary btn-sm" onClick={() => setSubmitSuccess(false)}>
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleInquirySubmit} className="inquiry-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="company_name">Company Name *</label>
                  <input
                    type="text"
                    id="company_name"
                    name="company_name"
                    value={inquiryForm.company_name}
                    onChange={handleInquiryChange}
                    className={formErrors.company_name ? 'input-error' : ''}
                    placeholder="e.g. Gujarat Packaging Ltd"
                  />
                  {formErrors.company_name && <span className="error-text">{formErrors.company_name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="contact_person">Contact Person *</label>
                  <input
                    type="text"
                    id="contact_person"
                    name="contact_person"
                    value={inquiryForm.contact_person}
                    onChange={handleInquiryChange}
                    className={formErrors.contact_person ? 'input-error' : ''}
                    placeholder="Full Name"
                  />
                  {formErrors.contact_person && <span className="error-text">{formErrors.contact_person}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Work Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={inquiryForm.email}
                    onChange={handleInquiryChange}
                    className={formErrors.email ? 'input-error' : ''}
                    placeholder="name@company.com"
                  />
                  {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone / Mobile *</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={inquiryForm.phone}
                    onChange={handleInquiryChange}
                    className={formErrors.phone ? 'input-error' : ''}
                    placeholder="Country Code + Phone"
                  />
                  {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="requirement">What Closure Type / Product Code do you require? *</label>
                <input
                  type="text"
                  id="requirement"
                  name="requirement"
                  value={inquiryForm.requirement}
                  onChange={handleInquiryChange}
                  className={formErrors.requirement ? 'input-error' : ''}
                  placeholder="e.g. 28mm CSD Caps, 20mm Pharma Seals, etc."
                />
                {formErrors.requirement && <span className="error-text">{formErrors.requirement}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="message">Estimated Volume &amp; Custom Requirement Details *</label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  value={inquiryForm.message}
                  onChange={handleInquiryChange}
                  className={formErrors.message ? 'input-error' : ''}
                  placeholder="Detail your size, lining requirements, quantity, and timeline..."
                ></textarea>
                {formErrors.message && <span className="error-text">{formErrors.message}</span>}
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={submitLoading}>
                {submitLoading ? 'Submitting...' : 'Submit B2B Inquiry'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default ContactPage;
