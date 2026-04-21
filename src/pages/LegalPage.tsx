import React from 'react';
import { Lock, ClipboardList, Scale, Shield, CheckCircle2, CalendarDays, Users, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LegalPage: React.FC = () => {
  const { s } = useLanguage();
  const [expanded, setExpanded] = React.useState<number | null>(0);

  const LEGAL_SECTIONS = [
    {
      icon: <Lock size={22} />,
      titleKey: 'pdpaTitle',
      content: [s['legalPdpa1'], s['legalPdpa2'], s['legalPdpa3'], s['legalPdpa4']],
    },
    {
      icon: <ClipboardList size={22} />,
      titleKey: 'privacyPolicyFull',
      content: [s['legalPriv1'], s['legalPriv2'], s['legalPriv3'], s['legalPriv4']],
    },
    {
      icon: <Scale size={22} />,
      titleKey: 'termsOfServiceFull',
      content: [s['legalTerms1'], s['legalTerms2'], s['legalTerms3'], s['legalTerms4']],
    },
    {
      icon: <Shield size={22} />,
      titleKey: 'dataProtection',
      content: [s['legalData1'], s['legalData2'], s['legalData3'], s['legalData4']],
    },
    {
      icon: <CheckCircle2 size={22} />,
      titleKey: 'consentFramework',
      content: [s['legalConsent1'], s['legalConsent2'], s['legalConsent3'], s['legalConsent4']],
    },
    {
      icon: <CalendarDays size={22} />,
      titleKey: 'dataRetention',
      content: [s['legalRet1'], s['legalRet2'], s['legalRet3'], s['legalRet4']],
    },
    {
      icon: <Users size={22} />,
      titleKey: 'yourRights',
      content: [s['legalRight1'], s['legalRight2'], s['legalRight3'], s['legalRight4'], s['legalRight5']],
    },
  ];

  return (
    <main className="sub-page">
      <div className="sub-page__hero">
        <h1 className="sub-page__title">{s['legalPageTitle']}</h1>
        <div className="silver-divider" style={{ marginTop: '16px' }} />
        <p className="sub-page__subtitle">{s['legalPageDesc']}</p>
      </div>

      <div className="container">
        {/* PDPA badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '20px 24px',
            background: 'rgba(70,180,100,0.05)',
            border: '1px solid rgba(70,180,100,0.2)',
            borderRadius: '14px',
            marginBottom: '40px',
          }}
        >
          <span style={{ fontSize: '36px' }}></span>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: '15px',
                color: 'rgba(234,234,234,0.9)',
                marginBottom: '4px',
              }}
            >
              {s['pdpaBadgeTitle']}
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(234,234,234,0.55)', lineHeight: 1.6 }}>
              {s['pdpaBadgeDesc']}
            </p>
          </div>
        </div>

        {/* Accordion sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {LEGAL_SECTIONS.map((section, idx) => (
            <div key={section.titleKey} className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
              <button
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '18px 24px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'var(--silver)',
                }}
                onClick={() => setExpanded(expanded === idx ? null : idx)}
              >
                <span style={{ fontSize: '20px' }}>{section.icon}</span>
                <span
                  style={{
                    flex: 1,
                    fontSize: '14px',
                    fontWeight: 600,
                    letterSpacing: '0.4px',
                    color: 'rgba(234,234,234,0.9)',
                  }}
                >
                  {s[section.titleKey]}
                </span>
                <span
                  style={{
                    color: 'rgba(184,184,184,0.5)',
                    fontSize: '18px',
                    transition: 'transform 0.2s',
                    transform: expanded === idx ? 'rotate(90deg)' : 'none',
                  }}
                >
                  ›
                </span>
              </button>

              {expanded === idx && (
                <div
                  style={{
                    padding: '0 24px 20px',
                    borderTop: '1px solid rgba(184,184,184,0.08)',
                  }}
                >
                  <ul style={{ listStyle: 'none', padding: 0, marginTop: '14px' }}>
                    {section.content.map((item, i) => (
                      <li
                        key={i}
                        style={{
                          display: 'flex',
                          gap: '10px',
                          fontSize: '13px',
                          color: 'rgba(234,234,234,0.65)',
                          lineHeight: 1.7,
                          padding: '6px 0',
                          borderBottom: i < section.content.length - 1 ? '1px solid rgba(184,184,184,0.06)' : 'none',
                        }}
                      >
                        <span style={{ color: 'rgba(184,184,184,0.35)', flexShrink: 0, marginTop: '2px' }}>▸</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Last updated */}
        <div
          style={{
            marginTop: '48px',
            textAlign: 'center',
            color: 'rgba(184,184,184,0.35)',
            fontSize: '12px',
            letterSpacing: '0.3px',
          }}
        >
          {s['legalLastUpdated']} &nbsp;·&nbsp; For queries: privacy@matrixinvestments.lk
        </div>
      </div>
    </main>
  );
};

export default LegalPage;
