import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Clock3, CreditCard, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

type TinLookupStatus = 'assigned' | 'in_progress' | 'not_found';

interface TinStatusDto {
  nic: string;
  status: TinLookupStatus;
  tinNumber: string | null;
  message: string;
  applicationId: string | null;
  updatedAt: string | null;
}

const USER_TOKEN_KEY = 'mytax_user_token';

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');

const normalizeLookupStatus = (value: unknown): TinLookupStatus => {
  const status = asString(value).toLowerCase();
  if (status === 'assigned') {
    return 'assigned';
  }

  if (status === 'not_found') {
    return 'not_found';
  }

  return 'in_progress';
};

const toTinStatus = (raw: Record<string, unknown>): TinStatusDto => ({
  nic: asString(raw.nic),
  status: normalizeLookupStatus(raw.status),
  tinNumber: asString(raw.tinNumber) || null,
  message: asString(raw.message),
  applicationId: asString(raw.applicationId) || null,
  updatedAt: asString(raw.updatedAt) || null,
});

const formatDate = (value: string | null): string => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString();
};

const statusClass = (status: TinLookupStatus): string => {
  if (status === 'assigned') {
    return 'm1-status-chip success';
  }

  if (status === 'in_progress') {
    return 'm1-status-chip warning';
  }

  return 'm1-status-chip';
};

const TinNumberStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [nic, setNic] = useState(user?.nic || '');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [snack, setSnack] = useState('');
  const [result, setResult] = useState<TinStatusDto | null>(null);

  const showSnack = (message: string) => {
    setSnack(message);
    window.setTimeout(() => setSnack(''), 2800);
  };

  useEffect(() => {
    if (!user) {
      navigate('/verify', { replace: true });
      return;
    }

    setNic(user.nic);
  }, [navigate, user]);

  const canCheck = useMemo(() => nic.trim().length > 0, [nic]);

  if (!user) {
    return null;
  }

  const checkStatus = () => {
    if (!canCheck) {
      showSnack('Please enter your NIC number.');
      return;
    }

    const token = sessionStorage.getItem(USER_TOKEN_KEY);
    if (!token) {
      setError('Session expired. Please login again.');
      return;
    }

    setChecking(true);
    setError('');

    api.m2TinStatus(token, nic.trim())
      .then(res => {
        const next = toTinStatus(res.tinStatus);
        setResult(next);

        if (next.status === 'assigned') {
          showSnack('TIN number found.');
          return;
        }

        if (next.status === 'in_progress') {
          showSnack('Your application in progress.');
          return;
        }

        showSnack('No TIN application found for this NIC.');
      })
      .catch(err => {
        setError(err?.message || 'Unable to fetch TIN status.');
      })
      .finally(() => setChecking(false));
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="m1-header-copy">
          <p className="m1-eyebrow">M2 TIN NUMBER STATUS</p>
          <h1>
            <Search size={22} /> Check TIN Assignment Status
          </h1>
          <p>
            Enter your NIC number to view whether your TIN number is assigned or still in progress.
          </p>
        </div>
        <img
          src="/images/logo.png"
          alt="MyTax"
          className="m1-header-logo"
          onError={e => ((e.target as HTMLImageElement).style.visibility = 'hidden')}
        />
      </div>

      <div className="dashboard-inner animate-in">
        {error && <div className="admin-alert error" style={{ marginBottom: '12px' }}>{error}</div>}

        <section className="admin-panel m1-section">
          <div className="admin-panel__title">Find By NIC Number</div>

          <div className="m1-form-grid" style={{ gridTemplateColumns: '1fr auto' }}>
            <div>
              <label>NIC Number</label>
              <div className="input-wrapper">
                <CreditCard size={14} className="input-icon" />
                <input
                  value={nic}
                  onChange={e => setNic(e.target.value)}
                  placeholder="Enter NIC number"
                />
              </div>
            </div>
            <div style={{ alignSelf: 'end' }}>
              <button type="button" className="btn-primary" onClick={checkStatus} disabled={checking || !canCheck}>
                {checking ? <span className="spinner" /> : <Search size={14} style={{ marginRight: 6 }} />} Check Status
              </button>
            </div>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel__title">Status Result</div>

          {!result ? (
            <p className="admin-empty">No lookup yet. Enter NIC and click Check Status.</p>
          ) : (
            <div className="admin-stack">
              <div className="m1-status-row">
                <span className={statusClass(result.status)}>{result.status.replace('_', ' ').toUpperCase()}</span>
              </div>

              <div className="admin-detail-grid">
                <div className="admin-detail-tile">
                  <span>NIC Number</span>
                  <strong>{result.nic || '-'}</strong>
                </div>
                <div className="admin-detail-tile">
                  <span>TIN Number</span>
                  <strong>{result.tinNumber || '-'}</strong>
                </div>
                <div className="admin-detail-tile">
                  <span>Application ID</span>
                  <strong>{result.applicationId || '-'}</strong>
                </div>
                <div className="admin-detail-tile">
                  <span>Last Updated</span>
                  <strong>{formatDate(result.updatedAt)}</strong>
                </div>
              </div>

              <div className="admin-detail-tile">
                <span>Message</span>
                <strong>
                  {result.status === 'assigned'
                    ? result.message || 'TIN number has been assigned.'
                    : result.status === 'in_progress'
                      ? result.message || 'Your application in progress.'
                      : result.message || 'No TIN application found for this NIC.'}
                </strong>
              </div>

              {result.status !== 'assigned' && (
                <div>
                  <button type="button" className="btn-outline" onClick={() => navigate('/dashboard/m7')}>
                    <ArrowRight size={14} style={{ marginRight: 6 }} /> Open TIN Application (M7)
                  </button>
                </div>
              )}

              {result.status === 'assigned' && (
                <p className="admin-empty" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <BadgeCheck size={14} /> Your TIN is active and linked to this NIC.
                </p>
              )}

              {result.status === 'in_progress' && (
                <p className="admin-empty" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Clock3 size={14} /> Your application in progress.
                </p>
              )}
            </div>
          )}
        </section>
      </div>

      {snack && <div className="snackbar">{snack}</div>}
    </div>
  );
};

export default TinNumberStatusPage;
