import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, BookOpen, FileText, Search, Calculator, LogOut } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const DashboardPage: React.FC = () => {
  const { s } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/verify');
    return null;
  }

  const firstName = user.fullName?.split(' ')[0] || 'User';

  const clientRows = [
    { label: s['clientName'] || 'Client Name', value: user.fullName || '—' },
    { label: 'NIC:', value: user.nic || '—' },
    { label: s['contactNo'], value: user.contactNo || '—' },
    { label: s['mailAddress'], value: user.mailAddress || '—' },
    { label: s['district'] || 'District', value: user.district || '—' },
    { label: s['postalAddress'] || 'Address', value: user.addressLine1 || '—' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard">
      {/* Top bar */}
      <div className="dashboard-header">
        <p
          style={{
            fontSize: '15px',
            fontWeight: 700,
            fontStyle: 'italic',
            color: 'var(--silver)',
            letterSpacing: '0.4px',
          }}
        >
          {s['welcomeMyTax']}
        </p>
        <img
          src="/images/logo.png"
          alt="Logo"
          style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid rgba(184,184,184,0.2)', objectFit: 'contain' }}
          onError={e => ((e.target as HTMLImageElement).style.visibility = 'hidden')}
        />
      </div>

      <div className="dashboard-inner animate-in">
        {/* Greeting */}
        <div style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--silver)',
              letterSpacing: '0.4px',
            }}
          >
            Hi {firstName},
          </h2>
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(184,184,184,0.55)',
              marginTop: '4px',
              lineHeight: '1.6',
            }}
          >
            {s['happySupport']}
          </p>
        </div>

        {/* Status badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 16px',
            background: 'rgba(70, 180, 100, 0.07)',
            border: '1px solid rgba(70, 180, 100, 0.2)',
            borderRadius: '20px',
            marginBottom: '24px',
            fontSize: '12px',
            color: '#8fd8a8',
          }}
        >
          <span>✓</span> {s['registeredClient']}
        </div>

        {/* Client info card */}
        <div className="client-card">
          <div className="client-card__title">Account Information</div>
          {clientRows.map(row => (
            <div key={row.label} className="client-info-row">
              <span className="client-info-label">{row.label}</span>
              <span className="client-info-value">{row.value}</span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ marginBottom: '16px' }}>
          <p
            style={{
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'rgba(184,184,184,0.45)',
              marginBottom: '14px',
            }}
          >
            Quick Access
          </p>
          <div className="dashboard-actions">
            <button
              className="dashboard-action-btn"
              onClick={() => navigate('/#services')}
            >
              <span className="btn-icon"><ClipboardList size={18} /></span>
              <span className="btn-label">{s['myTaxServices']}</span>
            </button>
            <button
              className="dashboard-action-btn"
              onClick={() => navigate('/#guide')}
            >
              <span className="btn-icon"><BookOpen size={18} /></span>
              <span className="btn-label">{s['guide']}</span>
            </button>
          </div>
        </div>

        {/* Service tiles */}
        <div
          style={{
            marginBottom: '28px',
            background: '#080808',
            border: '1px solid rgba(184,184,184,0.1)',
            borderRadius: '16px',
            padding: '20px',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'rgba(184,184,184,0.45)',
              marginBottom: '16px',
            }}
          >
            {s['taxServicesTitle']}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { code: 'M1', key: 'm1', paid: false, icon: <FileText size={16} /> },
              { code: 'M2', key: 'm2', paid: false, icon: <Search size={16} /> },
              { code: 'M3', key: 'm3', paid: false, icon: <Calculator size={16} /> },
            ].map(svc => (
              <button
                key={svc.code}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(184,184,184,0.08)',
                  borderRadius: '10px',
                  color: 'rgba(234,234,234,0.75)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                  width: '100%',
                }}
                onMouseEnter={e =>
                  ((e.currentTarget).style.background = 'rgba(255,255,255,0.05)')
                }
                onMouseLeave={e =>
                  ((e.currentTarget).style.background = 'rgba(255,255,255,0.02)')
                }
              >
                <span>{svc.icon}</span>
                <span style={{ flex: 1 }}>{s[svc.key]}</span>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    background: 'rgba(60, 180, 100, 0.1)',
                    border: '1px solid rgba(60, 180, 100, 0.25)',
                    color: '#8fd8a8',
                  }}
                >
                  Free
                </span>
                <span style={{ opacity: 0.3 }}>›</span>
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          className="btn-outline btn-full"
          onClick={handleLogout}
          style={{ padding: '14px' }}
        >
          <LogOut size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />{s['logout']}
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
