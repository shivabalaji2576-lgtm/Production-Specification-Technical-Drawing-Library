import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProductsPage from './pages/ProductsPage';
import CapabilitiesPage from './pages/CapabilitiesPage';
import GalleryPage from './pages/GalleryPage';
import ContactPage from './pages/ContactPage';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://sv-closures-backend.onrender.com/api';

const navigationItems = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'products', label: 'Products & Specs' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'contact', label: 'Contact Us' }
];

const getTabFromPath = () => {
  const basePath = import.meta.env.BASE_URL || '/';
  let path = window.location.pathname;
  if (path.startsWith(basePath)) {
    path = path.slice(basePath.length);
  }
  path = path.replace(/^\/|\/$/g, '');
  const tabExists = navigationItems.some(item => item.id === path);
  return tabExists ? path : 'home';
};

function Website() {
  const [activeTab, setActiveTabState] = useState(getTabFromPath);

  const setActiveTab = (tabId) => {
    const basePath = import.meta.env.BASE_URL || '/';
    const cleanTab = tabId === 'home' ? '' : tabId;
    const newPath = `${basePath}${cleanTab}`;
    window.history.pushState(null, '', newPath);
    setActiveTabState(tabId);
  };

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Contact Form State
  const [inquiryForm, setInquiryForm] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    requirement: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchActiveProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/product_specification_technical_dra?status=Active&limit=100`);
      const data = await res.json();
      if (data.success) setProducts(data.records);
    } catch (err) {
      console.error('Error fetching public products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch products and update title when tab changes
  useEffect(() => {
    if (activeTab === 'products') {
      setTimeout(() => {
        fetchActiveProducts();
      }, 0);
    }
    const matchedItem = navigationItems.find(item => item.id === activeTab);
    if (matchedItem) {
      document.title = `${matchedItem.label} | SV Closures`;
    } else {
      document.title = 'SV Closures';
    }
  }, [activeTab]);

  // Handle popstate (browser back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(getTabFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleInquiryChange = (e) => {
    const { name, value } = e.target;
    setInquiryForm(prev => ({ ...prev, [name]: value }));
  };

  const validateInquiry = () => {
    const errors = {};
    if (!inquiryForm.company_name.trim()) errors.company_name = 'Company name is required';
    if (!inquiryForm.contact_person.trim()) errors.contact_person = 'Contact person is required';
    if (!inquiryForm.email.trim() || !inquiryForm.email.includes('@')) errors.email = 'Valid email is required';
    if (!inquiryForm.phone.trim()) errors.phone = 'Phone number is required';
    if (!inquiryForm.requirement.trim()) errors.requirement = 'Requirement description or product code is required';
    if (!inquiryForm.message.trim()) errors.message = 'Message content is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!validateInquiry()) return;
    setSubmitLoading(true);
    try {
      const res = await fetch(`${API_BASE}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiryForm)
      });
      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        setInquiryForm({ company_name: '', contact_person: '', email: '', phone: '', requirement: '', message: '' });
      } else {
        alert(data.message || 'Submission failed. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      alert('Error submitting inquiry. Ensure the server is online.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const triggerProductInquiry = (productCode) => {
    setInquiryForm(prev => ({
      ...prev,
      requirement: `Request quote / sample for product: ${productCode}`,
      message: `Dear SV Closures team,\n\nWe are interested in your product ${productCode}. Please provide specifications, lead time, and pricing for B2B orders.`
    }));
    setActiveTab('contact');
  };

  return (
    <div className="public-site-wrapper">
      {/* Navigation Header */}
      <header className="public-header glass-header">
        <div className="header-container">
          <div className="public-logo" onClick={() => setActiveTab('home')}>
            <span className="logo-icon-accent">SV</span>
            <div>
              <span className="logo-title">SV Closures</span>
              <span className="logo-subtitle">S V Industries</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            {navigationItems.map(item => (
              <button
                key={item.id}
                className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Icon */}
          <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer glass-panel">
            {navigationItems.map(item => (
              <button
                key={item.id}
                className={`mobile-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Page Router */}
      <main className="public-content-container">
        {activeTab === 'home'         && <HomePage setActiveTab={setActiveTab} />}
        {activeTab === 'about'        && <AboutPage />}
        {activeTab === 'products'     && (
          <ProductsPage 
            products={products} 
            productsLoading={productsLoading} 
            triggerProductInquiry={triggerProductInquiry} 
            apiBase={API_BASE}
            onRefresh={fetchActiveProducts}
          />
        )}
        {activeTab === 'capabilities' && <CapabilitiesPage />}
        {activeTab === 'gallery'      && <GalleryPage />}
        {activeTab === 'contact'      && (
          <ContactPage
            inquiryForm={inquiryForm}
            formErrors={formErrors}
            submitSuccess={submitSuccess}
            submitLoading={submitLoading}
            handleInquiryChange={handleInquiryChange}
            handleInquirySubmit={handleInquirySubmit}
            setSubmitSuccess={setSubmitSuccess}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="public-footer">
        <div className="footer-container">
          <p>&copy; {new Date().getFullYear()} SV Closures. All rights reserved. Rajkot, Gujarat, India.</p>
          <div className="footer-links">
            <button className="footer-link-btn" onClick={() => setActiveTab('home')}>Home</button>
            <button className="footer-link-btn" onClick={() => setActiveTab('products')}>Products</button>
            <button className="footer-link-btn" onClick={() => setActiveTab('capabilities')}>Capabilities</button>
            <button className="footer-link-btn" onClick={() => setActiveTab('contact')}>Contact</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Website;
