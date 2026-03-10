import React from 'react';
import { Lock, ClipboardList, Scale, Shield, CheckCircle2, CalendarDays, Users, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LEGAL_SECTIONS: { icon: React.ReactNode; titleKey: string; content: string[] }[] = [
  {
    icon: <Lock size={22} />,
    titleKey: 'pdpaTitle',
    content: [
      'We are fully compliant with the Personal Data Protection Act No. 9 of 2022 (Sri Lanka).',
      'Your data is collected only with your explicit consent and used solely for the purposes you have agreed to.',
      'We implement technical and organizational measures to protect your data against unauthorized access, loss, or alteration.',
      'You may withdraw your consent at any time by contacting us at privacy@matrixinvestments.lk.',
    ],
  },
  {
    icon: <ClipboardList size={22} />,
    titleKey: 'privacyPolicyFull',
    content: [
      'We collect: NIC number, mobile number, email address, full name, location data, and tax-related financial information.',
      'We do NOT sell, rent, or share your personal data with third parties without your consent, except where required by law.',
      'Data is stored on encrypted servers with regular backups. Access is role-based and audit-logged.',
      'Cookies are used only for session management and do not track personal activity outside our platform.',
    ],
  },
  {
    icon: <Scale size={22} />,
    titleKey: 'termsOfServiceFull',
    content: [
      'By using MyTax, you agree to provide accurate and truthful information for tax filing purposes.',
      'Matrix Investments PLC is not liable for tax penalties arising from inaccurate information provided by users.',
      'Unauthorized use, reverse engineering, or misuse of the platform will result in account termination.',
      'Services marked as "Paid" are subject to applicable fees as published on the platform.',
    ],
  },
  {
    icon: <Shield size={22} />,
    titleKey: 'dataProtection',
    content: [
      'All data transmissions are encrypted using TLS 1.2+.',
      'Passwords are hashed using industry-standard algorithms and never stored in plain text.',
      'Two-factor authentication (OTP) is required for all account access.',
      'Regular security audits are performed by our compliance team.',
    ],
  },
  {
    icon: <CheckCircle2 size={22} />,
    titleKey: 'consentFramework',
    content: [
      'On registration, users provide explicit consent for data collection and processing.',
      'Consent is recorded with timestamp, user identity, and scope of permission.',
      'Users can view, update, or revoke their consent at any time via Account Settings.',
      'All consent records are maintained in our non-editable audit log as required by PDPA.',
    ],
  },
  {
    icon: <CalendarDays size={22} />,
    titleKey: 'dataRetention',
    content: [
      'Active account data is retained for the duration of the client relationship.',
      'Tax filing records are retained for a minimum of 5 years as required by IRD regulations.',
      'Deleted account data is purged from production systems within 30 days.',
      'Backup copies are deleted within 90 days of the production purge.',
    ],
  },
  {
    icon: <Users size={22} />,
    titleKey: 'yourRights',
    content: [
      'Right to Access: Request a copy of all data we hold about you.',
      'Right to Rectification: Correct any inaccurate information in your profile.',
      'Right to Erasure: Request deletion of your account and associated data.',
      'Right to Data Portability: Export your data in a machine-readable format.',
      'Lodge complaints with the Data Protection Authority of Sri Lanka.',
    ],
  },
];

const LegalPage: React.FC = () => {
  const { s } = useLanguage();
  const [expanded, setExpanded] = React.useState<number | null>(0);

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
              PDPA Compliant — Personal Data Protection Act No. 9 of 2022
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(234,234,234,0.55)', lineHeight: 1.6 }}>
              Matrix Investments PLC is committed to full compliance with Sri Lanka's Personal Data Protection Act. Your privacy is our legal obligation.
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
          Last updated: January 2026 &nbsp;·&nbsp; For queries: privacy@matrixinvestments.lk
        </div>
      </div>
    </main>
  );
};

export default LegalPage;
