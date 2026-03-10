import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Building2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Footer: React.FC = () => {
  const { s } = useLanguage();

  return (
    <footer className="footer">
      <div className="footer__grid">
        {/* Brand column */}
        <div className="footer__brand">
          <img
            src="/images/logo.png"
            alt="MyTax Logo"
            className="footer__logo"
            onError={e => ((e.target as HTMLImageElement).style.visibility = 'hidden')}
          />
          <div className="footer__brand-name">
            MyTax<sup>™</sup>
          </div>
          <p className="footer__tagline">{s['footerTagline']}</p>
          <p style={{ fontSize: '12px', color: 'rgba(184,184,184,0.4)', marginTop: '4px' }}>
            {s['companyName']}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <div className="footer__col-title">{s['quickLinks']}</div>
          <Link to="/" className="footer__link">{s['home']}</Link>
          <Link to="/about" className="footer__link">{s['about'] ?? 'About'}</Link>
          <Link to="/services" className="footer__link">{s['services']}</Link>
          <Link to="/guide" className="footer__link">{s['guide']}</Link>
          <Link to="/group" className="footer__link">{s['groupCompanies'] ?? 'Group Companies'}</Link>
          <Link to="/careers" className="footer__link">{s['careers'] ?? 'Careers'}</Link>
        </div>

        {/* Legal */}
        <div>
          <div className="footer__col-title">{s['legal']}</div>
          <Link to="/legal" className="footer__link">{s['privacyPolicy']}</Link>
          <Link to="/legal" className="footer__link">{s['termsOfService']}</Link>
          <Link to="/investor" className="footer__link">{s['investorRelations'] ?? 'Investor Relations'}</Link>
          <Link to="/legal" className="footer__link">{s['legalPrivacy'] ?? 'Legal & Privacy'}</Link>
        </div>

        {/* Contact */}
        <div>
          <div className="footer__col-title">{s['contact']}</div>
          <Link to="/contact" className="footer__link"><Mail size={13} style={{ marginRight: 6, verticalAlign: 'middle' }} />info@matrixinvestments.lk</Link>
          <Link to="/contact" className="footer__link"><Phone size={13} style={{ marginRight: 6, verticalAlign: 'middle' }} />+94 11 000 0000</Link>
          <Link to="/contact" className="footer__link"><Building2 size={13} style={{ marginRight: 6, verticalAlign: 'middle' }} />{s['companyName']}</Link>
          <span className="footer__link" style={{ cursor: 'default' }}>Sri Lanka</span>
        </div>
      </div>

      <div className="footer__bottom">
        <span className="footer__copyright">{s['copyright']}</span>
        <span className="footer__copyright" style={{ opacity: 0.6 }}>
          MyTax™ — All rights reserved
        </span>
      </div>
    </footer>
  );
};

export default Footer;
