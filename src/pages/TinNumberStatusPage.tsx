import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, BookOpen, Clock3, CreditCard, Home, LogOut, Search } from 'lucide-react';
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

const normalizeNic = (value: string): string => value.trim().toUpperCase();

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
  nic: normalizeNic(asString(raw.nic)),
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

const statusLabel = (status: TinLookupStatus): string => {
  if (status === 'assigned') {
    return 'ASSIGNED';
  }

  if (status === 'in_progress') {
    return 'IN PROGRESS';
  }

  return 'NOT FOUND';
};

const statusSummary = (status: TinLookupStatus): string => {
  if (status === 'assigned') {
    return 'You are a registered tax payer.';
  }

  if (status === 'in_progress') {
    return 'Your TIN registration is currently under review.';
  }

  return 'No active TIN record found for your NIC.';
};

const TinNumberStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [nic, setNic] = useState(normalizeNic(user?.nic || ''));
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [snack, setSnack] = useState('');
  const [result, setResult] = useState<TinStatusDto | null>(null);
  const autoLookupDoneRef = useRef(false);

  const showSnack = (message: string) => {
    setSnack(message);
    window.setTimeout(() => setSnack(''), 2800);
  };

  const verifiedNic = useMemo(() => normalizeNic(user?.nic || ''), [user?.nic]);
  const typedNic = useMemo(() => normalizeNic(nic), [nic]);
  const canCheck = useMemo(() => typedNic.length > 0, [typedNic]);

  const runLookup = (targetNic: string, token: string, silent = false) => {
    setChecking(true);
    setError('');

    api.m2TinStatus(token, targetNic)
      .then(res => {
        const next = toTinStatus(res.tinStatus || {});
        const safeResult: TinStatusDto = {
          ...next,
          nic: next.nic || targetNic,
        };

        setResult(safeResult);

        if (silent) {
          return;
        }

        if (safeResult.status === 'assigned') {
          showSnack('TIN found for your account.');
          return;
        }

        if (safeResult.status === 'in_progress') {
          showSnack('Your TIN registration is still in progress.');
          return;
        }

        showSnack('No active TIN found. You can register now.');
      })
      .catch(err => {
        setError(err?.message || 'Unable to fetch TIN status.');
      })
      .finally(() => setChecking(false));
  };

  useEffect(() => {
    if (!user) {
      navigate('/verify', { replace: true });
      return;
    }

    setNic(verifiedNic);

    const token = sessionStorage.getItem(USER_TOKEN_KEY);
    if (!token || !verifiedNic || autoLookupDoneRef.current) {
      return;
    }

    autoLookupDoneRef.current = true;
    runLookup(verifiedNic, token, true);
  }, [navigate, user, verifiedNic]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const checkStatus = () => {
    if (!canCheck) {
      showSnack('Please enter your NIC number.');
      return;
    }

    const enteredNic = normalizeNic(nic);

    if (verifiedNic && enteredNic !== verifiedNic) {
      setError(`Only your verified NIC can be checked (${verifiedNic}).`);
      showSnack('Use your verified NIC to check status.');
      return;
    }

    const token = sessionStorage.getItem(USER_TOKEN_KEY);
    if (!token) {
      setError('Session expired. Please login again.');
      return;
    }

    setNic(enteredNic);
    runLookup(verifiedNic || enteredNic, token);
  };

  const primaryAction = () => {
    if (!result) {
      return;
    }

    if (result.status === 'assigned') {
      navigate('/dashboard/modules');
      return;
    }

    navigate('/dashboard/m7');
  };

  const primaryActionLabel =
    result?.status === 'assigned'
      ? 'Back to Modules'
      : result?.status === 'in_progress'
        ? 'Continue TIN Application (M7)'
        : 'Register as Tax Payer (M7)';

  const guidanceMessage =
    result?.status === 'assigned'
      ? 'Your TIN is active. You can proceed with other tax services from your dashboard.'
      : result?.status === 'in_progress'
        ? 'Your request is already submitted. Open M7 if you need to review details.'
        : 'Start tax payer registration through M7 to receive your TIN number.';

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="m1-header-copy">
          <p className="m1-eyebrow">M2 TIN NUMBER STATUS</p>
          <h1>
            <Search size={22} /> Check TIN Assignment Status
          </h1>
          <p>
            View your TIN assignment status using the NIC linked to your verified user account.
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
                  readOnly={Boolean(verifiedNic)}
                  placeholder="Enter NIC number"
                />
              </div>
              <p className="admin-empty" style={{ marginTop: '8px' }}>
                {verifiedNic
                  ? `Lookup is restricted to your verified NIC: ${verifiedNic}`
                  : 'Enter the NIC linked to your verified account.'}
              </p>
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
            <p className="admin-empty">
              No status record loaded yet. Click Check Status to refresh your latest TIN details.
            </p>
          ) : (
            <div className="admin-stack">
              <div className="m1-status-row">
                <span className={statusClass(result.status)}>{statusLabel(result.status)}</span>
              </div>

              <div className="admin-detail-tile">
                <span>Tax Payer Verification</span>
                <strong>{statusSummary(result.status)}</strong>
                <p style={{ marginTop: '8px', color: 'rgba(184,184,184,0.74)', fontSize: '12px', lineHeight: 1.6 }}>
                  {guidanceMessage}
                </p>
              </div>

              <div className="admin-detail-grid">
                <div className="admin-detail-tile">
                  <span>NIC Number</span>
                  <strong>{result.nic || verifiedNic || '-'}</strong>
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
                      ? result.message || 'Your TIN registration is currently in progress.'
                      : result.message || 'No TIN registration found for your NIC.'}
                </strong>
              </div>

              <div className="m1-nav-row">
                <button type="button" className="btn-primary" onClick={primaryAction}>
                  {result.status === 'assigned'
                    ? <Home size={14} style={{ marginRight: 6 }} />
                    : <ArrowRight size={14} style={{ marginRight: 6 }} />}
                  {primaryActionLabel}
                </button>
                <button type="button" className="btn-outline" onClick={() => navigate('/guide')}>
                  <BookOpen size={14} style={{ marginRight: 6 }} /> Open User Guide
                </button>
                <button type="button" className="btn-outline" onClick={handleLogout}>
                  <LogOut size={14} style={{ marginRight: 6 }} /> Logout
                </button>
              </div>

              {result.status === 'assigned' && (
                <p className="admin-empty" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <BadgeCheck size={14} /> Your TIN is active and linked to your account.
                </p>
              )}

              {result.status === 'in_progress' && (
                <p className="admin-empty" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Clock3 size={14} /> Your registration request is in progress.
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
