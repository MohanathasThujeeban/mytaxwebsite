import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Globe, LogIn, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Language } from '../utils/strings';

const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: 'ENGLISH', label: 'EN', native: 'English' },
  { code: 'SINHALA', label: 'සිං', native: 'සිංහල' },
  { code: 'TAMIL',   label: 'தமி', native: 'தமிழ்' },
];

const Header: React.FC = () => {
  const { language, setLanguage, s } = useLanguage();
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
  }, [location.pathname]);

  const handleSignIn = () => {
    if (isLoggedIn) {
      navigate('/dashboard/modules');
    } else {
      navigate('/verify');
    }
  };

  const dashboardPath = '/dashboard/modules';

  const currentLang = LANGUAGES.find(l => l.code === language)!;

  const navLinks = [
    { label: s['home'] ?? 'Home', href: '/' },
    { label: s['about'] ?? 'About', href: '/about' },
    { label: s['services'] ?? 'Services', href: '/services' },
    { label: s['guide'] ?? 'Guide', href: '/guide' },
    { label: s['careers'] ?? 'Careers', href: '/careers' },
    { label: s['contactComplaints'] ?? 'Contact', href: '/contact' },
  ];

  const moreLinks = [
    { label: s['groupCompanies'] ?? 'Group Companies', href: '/group' },
    { label: s['investorRelations'] ?? 'Investor Relations', href: '/investor' },
    { label: s['legalPrivacy'] ?? 'Legal & Privacy', href: '/legal' },
  ];

  return (
    <header className={`header${scrolled ? ' scrolled' : ''}`}>
      {/* ── Brand ── */}
      <Link to="/" className="header__brand">
        <img
          src="/images/logo.png"
          alt="MyTax Logo"
          className="header__logo"
          onError={e => ((e.target as HTMLImageElement).style.visibility = 'hidden')}
        />
        <span className="header__brand-name">
          MyTax<sup>™</sup>
        </span>
      </Link>

      {/* ── Desktop Nav ── */}
      <nav className="header__nav">
        {navLinks.map(link => (
          <Link key={link.href} to={link.href} className="header__nav-link">
            {link.label}
          </Link>
        ))}
        {/* More dropdown */}
        <div className="header__nav-more" ref={moreRef}>
          <button
            className="header__nav-link header__nav-more-btn"
            onClick={() => setMoreOpen(o => !o)}
          >
            {s['more'] ?? 'More'} <ChevronDown size={12} style={{ transition: 'transform 0.2s', transform: moreOpen ? 'rotate(180deg)' : undefined }} />
          </button>
          {moreOpen && (
            <div className="header__more-dropdown">
              {moreLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="header__more-link"
                  onClick={() => setMoreOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ── Controls ── */}
      <div className="header__controls">
        {/* Language Switcher */}
        <div className="lang-sw" ref={langRef}>
          <button
            className="lang-sw__btn"
            onClick={() => setLangOpen(o => !o)}
            aria-label="Change language"
          >
            <Globe size={15} />
            <span>{currentLang.label}</span>
            <ChevronDown size={12} style={{ transition: 'transform 0.2s', transform: langOpen ? 'rotate(180deg)' : undefined }} />
          </button>
          {langOpen && (
            <div className="lang-sw__dropdown">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  className={`lang-sw__option${language === lang.code ? ' active' : ''}`}
                  onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                >
                  <span>{lang.native}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sign In / Dashboard / Logout */}
        {isLoggedIn ? (
          <>
            <button className="btn-outline" style={{ padding: '8px 18px', fontSize: '13px' }} onClick={() => navigate(dashboardPath)}>
              Dashboard
            </button>
            <button className="btn-outline" style={{ padding: '8px 18px', fontSize: '13px' }} onClick={logout}>
              {s['logout'] ?? 'Logout'}
            </button>
          </>
        ) : (
          <button className="header-signin-btn" onClick={handleSignIn}>
            <LogIn size={15} />
            {s['signIn'] ?? 'Sign In'}
          </button>
        )}

        {/* Hamburger */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* ── Mobile Menu ── */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {navLinks.map(link => (
          <Link
            key={link.href}
            to={link.href}
            className="header__nav-link"
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        {moreLinks.map(link => (
          <Link
            key={link.href}
            to={link.href}
            className="header__nav-link"
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}

        {/* Mobile language chips */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => { setLanguage(lang.code); setMenuOpen(false); }}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                background: language === lang.code ? 'rgba(234,234,234,0.12)' : 'transparent',
                border: `1px solid ${language === lang.code ? 'rgba(184,184,184,0.45)' : 'rgba(184,184,184,0.18)'}`,
                color: language === lang.code ? 'var(--silver)' : 'rgba(234,234,234,0.5)',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <button
          className="btn-primary"
          style={{ width: '100%', marginTop: '12px' }}
          onClick={() => { handleSignIn(); setMenuOpen(false); }}
        >
          🔐 {s['signIn'] ?? 'Sign In'}
        </button>
      </div>
    </header>
  );
};

export default Header;
