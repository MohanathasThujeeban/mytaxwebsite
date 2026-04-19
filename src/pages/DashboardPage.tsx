import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FileCheck2, LogOut, Sparkles, UserRound } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { formatIncomeLabel, getLatestM1SubmissionByNic } from '../utils/taxSubmission';

const formatDate = (iso: string | null | undefined): string => {
  if (!iso) {
    return '-';
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString();
};

const DashboardPage: React.FC = () => {
  const { s } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const latestSubmission = useMemo(
    () => (user?.nic ? getLatestM1SubmissionByNic(user.nic) : null),
    [user?.nic]
  );

  useEffect(() => {
    if (!user) {
      navigate('/verify', { replace: true });
      return;
    }

    if (!latestSubmission || latestSubmission.status !== 'submitted') {
      navigate('/dashboard/modules', { replace: true });
    }
  }, [latestSubmission, navigate, user]);

  if (!user || !latestSubmission || latestSubmission.status !== 'submitted') {
    return null;
  }

  const firstName = user.fullName?.split(' ')[0] || 'User';

  const clientRows = [
    { label: s['clientName'] || 'Client Name', value: user.fullName || '-' },
    { label: 'NIC', value: user.nic || '-' },
    { label: s['contactNo'], value: user.contactNo || '-' },
    { label: s['mailAddress'], value: user.mailAddress || '-' },
    { label: s['district'] || 'District', value: user.district || '-' },
    { label: s['postalAddress'] || 'Address', value: user.addressLine1 || '-' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <p
          style={{
            fontSize: '15px',
            fontWeight: 700,
            fontStyle: 'italic',
            color: 'var(--silver)',
            letterSpacing: '0.4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Sparkles size={16} /> {s['welcomeMyTax']}
        </p>
        <img
          src="/images/logo.png"
          alt="Logo"
          style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid rgba(184,184,184,0.2)', objectFit: 'contain' }}
          onError={e => ((e.target as HTMLImageElement).style.visibility = 'hidden')}
        />
      </div>

      <div className="dashboard-inner animate-in">
        <div style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '24px',
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
              color: 'rgba(184,184,184,0.6)',
              marginTop: '4px',
              lineHeight: '1.6',
            }}
          >
            Your M1 return is submitted. You can review and update it any time before the filing cutoff.
          </p>
        </div>

        <div className="m1-status-row">
          <div className="m1-status-chip success">
            <FileCheck2 size={14} /> M1 Submitted
          </div>
          <div className="m1-status-chip">Year: {latestSubmission.taxYear}</div>
          <div className="m1-status-chip">Progress: {latestSubmission.progress}%</div>
        </div>

        <div className="m1-dashboard-grid">
          <div className="client-card" style={{ marginBottom: 0 }}>
            <div className="client-card__title">Account Information</div>
            {clientRows.map(row => (
              <div key={row.label} className="client-info-row">
                <span className="client-info-label">{row.label}</span>
                <span className="client-info-value">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="client-card" style={{ marginBottom: 0 }}>
            <div className="client-card__title">Latest M1 Filing Snapshot</div>
            <div className="client-info-row">
              <span className="client-info-label">Submitted At</span>
              <span className="client-info-value">{formatDate(latestSubmission.submittedAt)}</span>
            </div>
            <div className="client-info-row">
              <span className="client-info-label">Income Types</span>
              <span className="client-info-value">{formatIncomeLabel(latestSubmission.form)}</span>
            </div>
            <div className="client-info-row">
              <span className="client-info-label">Residence</span>
              <span className="client-info-value">{latestSubmission.form.residenceType || '-'}</span>
            </div>
            <div className="client-info-row">
              <span className="client-info-label">Assets Declared</span>
              <span className="client-info-value">{latestSubmission.form.assets.declareAssets || '-'}</span>
            </div>
            <div className="client-info-row">
              <span className="client-info-label">Loans Declared</span>
              <span className="client-info-value">{latestSubmission.form.liabilities.hasLoans || '-'}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
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
            <button className="dashboard-action-btn" onClick={() => navigate('/dashboard/m1')}>
              <span className="btn-icon"><FileCheck2 size={18} /></span>
              <span className="btn-label">Open M1 Form</span>
            </button>
            <button className="dashboard-action-btn" onClick={() => navigate('/guide')}>
              <span className="btn-icon"><BookOpen size={18} /></span>
              <span className="btn-label">User Guide</span>
            </button>
            <button className="dashboard-action-btn" onClick={handleLogout}>
              <span className="btn-icon"><LogOut size={18} /></span>
              <span className="btn-label">Logout</span>
            </button>
            <button className="dashboard-action-btn" onClick={() => navigate('/services')}>
              <span className="btn-icon"><UserRound size={18} /></span>
              <span className="btn-label">More Services</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
