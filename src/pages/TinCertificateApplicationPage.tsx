import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, CreditCard, Mail, Phone, Save, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

type TinApplicationStatus = 'draft' | 'submitted' | 'assigned';

interface TinApplicationDto {
  id: string;
  nic: string;
  status: TinApplicationStatus;
  fullName: string;
  mobileNo: string;
  emailAddress: string;
  assignedTin: string | null;
  paymentStatus: 'pending' | 'completed';
  paymentReference: string | null;
  requestedAt: string | null;
  assignedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TinFormState {
  nic: string;
  fullName: string;
  mobileNo: string;
  emailAddress: string;
}

type TinSubmitPayload = {
  nic: string;
  fullName: string;
  mobileNo: string;
  emailAddress: string;
};

const USER_TOKEN_KEY = 'mytax_user_token';

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');

const normalizeStatus = (value: unknown): TinApplicationStatus => {
  const status = asString(value).toLowerCase();
  if (status === 'submitted') {
    return 'submitted';
  }

  if (status === 'assigned') {
    return 'assigned';
  }

  return 'draft';
};

const toTinApplication = (raw: Record<string, unknown>): TinApplicationDto => ({
  id: asString(raw.id),
  nic: asString(raw.nic),
  status: normalizeStatus(raw.status),
  fullName: asString(raw.fullName),
  mobileNo: asString(raw.mobileNo),
  emailAddress: asString(raw.emailAddress),
  assignedTin: asString(raw.assignedTin) || null,
  paymentStatus: asString(raw.paymentStatus).toLowerCase() === 'completed' ? 'completed' : 'pending',
  paymentReference: asString(raw.paymentReference) || null,
  requestedAt: asString(raw.requestedAt) || null,
  assignedAt: asString(raw.assignedAt) || null,
  createdAt: asString(raw.createdAt),
  updatedAt: asString(raw.updatedAt),
});

const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

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

const statusClass = (status: TinApplicationStatus): string => {
  if (status === 'assigned') {
    return 'm1-status-chip success';
  }

  if (status === 'submitted') {
    return 'm1-status-chip warning';
  }

  return 'm1-status-chip';
};

const paymentClass = (status: 'pending' | 'completed'): string =>
  status === 'completed' ? 'm1-status-chip success' : 'm1-status-chip warning';

type TinModuleCode = 'M6' | 'M7';

interface TinCertificateApplicationPageProps {
  moduleCode?: TinModuleCode;
}

const TinCertificateApplicationPage: React.FC<TinCertificateApplicationPageProps> = ({ moduleCode = 'M7' }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [snack, setSnack] = useState('');
  const [application, setApplication] = useState<TinApplicationDto | null>(null);
  const [form, setForm] = useState<TinFormState>({
    nic: user?.nic || '',
    fullName: user?.fullName || '',
    mobileNo: user?.contactNo || '',
    emailAddress: user?.mailAddress || '',
  });

  const showSnack = (message: string) => {
    setSnack(message);
    window.setTimeout(() => setSnack(''), 3200);
  };

  const moduleRouteBase = moduleCode === 'M6' ? '/dashboard/m6' : '/dashboard/m7';
  const moduleEyebrow = moduleCode === 'M6' ? 'M6 TIN CERTIFICATE REQUEST' : 'M7 TIN CERTIFICATE APPLICATION';
  const moduleHeading = moduleCode === 'M6' ? 'Request Your TIN Certificate' : 'Request Your TIN Number';
  const moduleIntro =
    moduleCode === 'M6'
      ? 'Your NIC is already linked to this account. Confirm the required fields and continue to payment for your certificate request.'
      : 'Your NIC is already linked to this account. Confirm the 4 required fields and continue to payment.';
  const moduleDraftSavedMessage =
    moduleCode === 'M6' ? 'TIN certificate request draft saved.' : 'TIN application draft saved.';
  const modulePreparePaymentMessage =
    moduleCode === 'M6'
      ? 'Draft saved. Continue to payment to submit your certificate request.'
      : 'Draft saved. Continue to payment to submit your TIN request.';
  const modulePreparePaymentError =
    moduleCode === 'M6'
      ? 'Unable to prepare payment for certificate request.'
      : 'Unable to prepare payment for TIN request.';

  useEffect(() => {
    if (!user) {
      navigate('/verify', { replace: true });
      return;
    }

    setForm(prev => ({
      nic: user.nic,
      fullName: prev.fullName || user.fullName || '',
      mobileNo: prev.mobileNo || user.contactNo || '',
      emailAddress: prev.emailAddress || user.mailAddress || '',
    }));

    const token = sessionStorage.getItem(USER_TOKEN_KEY);
    if (!token) {
      setLoading(false);
      setError('Session expired. Please login again.');
      return;
    }

    const loadLatest = moduleCode === 'M6' ? api.m6Latest : api.m7Latest;
    loadLatest(token)
      .then(res => {
        if (!res.application) {
          return;
        }

        const next = toTinApplication(res.application);
        setApplication(next);
        setForm({
          nic: next.nic || user.nic,
          fullName: next.fullName || user.fullName || '',
          mobileNo: next.mobileNo || user.contactNo || '',
          emailAddress: next.emailAddress || user.mailAddress || '',
        });
      })
      .catch(err => {
        setError(err?.message || 'Unable to load your TIN application right now.');
      })
      .finally(() => setLoading(false));
  }, [navigate, user]);

  const canSubmit = useMemo(() => {
    return (
      form.nic.trim().length > 0 &&
      form.fullName.trim().length > 0 &&
      form.mobileNo.trim().length > 0 &&
      form.emailAddress.trim().length > 0 &&
      isValidEmail(form.emailAddress)
    );
  }, [form]);

  if (!user) {
    return null;
  }

  const isAssigned = application?.status === 'assigned';

  const buildSubmitPayload = (): TinSubmitPayload => ({
    nic: form.nic,
    fullName: form.fullName,
    mobileNo: form.mobileNo,
    emailAddress: form.emailAddress,
  });

  const saveDraft = () => {
    if (isAssigned) {
      showSnack('TIN already assigned for this NIC. This request cannot be edited.');
      return;
    }

    const token = sessionStorage.getItem(USER_TOKEN_KEY);
    if (!token) {
      setError('Session expired. Please login again.');
      return;
    }

    setSaving(true);
    setError('');

    const saveDraftRequest = moduleCode === 'M6' ? api.m6SaveDraft : api.m7SaveDraft;
    saveDraftRequest(token, {
      application: {
        nic: form.nic,
        fullName: form.fullName,
        mobileNo: form.mobileNo,
        emailAddress: form.emailAddress,
      },
    })
      .then(res => {
        const next = toTinApplication(res.application);
        setApplication(next);
        showSnack(moduleDraftSavedMessage);
      })
      .catch(err => {
        setError(err?.message || 'Unable to save draft.');
      })
      .finally(() => setSaving(false));
  };

  const proceedToPayment = () => {
    if (isAssigned) {
      showSnack('TIN already assigned for this NIC.');
      return;
    }

    if (!canSubmit) {
      showSnack('Please complete NIC, Full Name, Mobile No, and Email Address correctly.');
      return;
    }

    const token = sessionStorage.getItem(USER_TOKEN_KEY);
    if (!token) {
      setError('Session expired. Please login again.');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = buildSubmitPayload();

    const saveDraftRequest = moduleCode === 'M6' ? api.m6SaveDraft : api.m7SaveDraft;
    saveDraftRequest(token, {
      application: payload,
    })
      .then(res => {
        const next = toTinApplication(res.application);
        setApplication(next);
        showSnack(modulePreparePaymentMessage);
        navigate(`${moduleRouteBase}/payment`, {
          state: {
            applicationId: next.id,
            nic: next.nic,
            application: payload,
          },
        });
      })
      .catch(err => {
        setError(err?.message || modulePreparePaymentError);
      })
      .finally(() => setSubmitting(false));
  };

  const setField = <K extends keyof TinFormState>(key: K, value: TinFormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="m1-header-copy">
          <p className="m1-eyebrow">{moduleEyebrow}</p>
          <h1>
            <BadgeCheck size={22} /> {moduleHeading}
          </h1>
          <p>{moduleIntro}</p>
        </div>
        <img
          src="/images/logo.png"
          alt="MyTax"
          className="m1-header-logo"
          onError={e => ((e.target as HTMLImageElement).style.visibility = 'hidden')}
        />
      </div>

      <div className="dashboard-inner animate-in">
        {loading ? (
          <div className="admin-panel" style={{ minHeight: '220px', display: 'grid', placeItems: 'center' }}>
            <div className="spinner" />
          </div>
        ) : (
          <>
            {error && <div className="admin-alert error" style={{ marginBottom: '12px' }}>{error}</div>}

            <section className="admin-panel m1-section">
              <div className="admin-panel__title">
                <span>Application Form</span>
                <span className={statusClass(application?.status || 'draft')}>
                  {(application?.status || 'draft').toUpperCase()}
                </span>
              </div>

              <div className="m1-prefill-grid">
                <div>
                  <label>NIC Number *</label>
                  <div className="input-wrapper m1-static">
                    <CreditCard size={14} />
                    <span>{form.nic || '-'}</span>
                  </div>
                </div>

                <div>
                  <label>Full Name *</label>
                  <div className="input-wrapper">
                    <UserRound size={14} className="input-icon" />
                    <input
                      value={form.fullName}
                      onChange={e => setField('fullName', e.target.value)}
                      placeholder="Enter full name"
                      disabled={isAssigned}
                    />
                  </div>
                </div>

                <div>
                  <label>Mobile No *</label>
                  <div className="input-wrapper">
                    <Phone size={14} className="input-icon" />
                    <input
                      value={form.mobileNo}
                      onChange={e => setField('mobileNo', e.target.value)}
                      placeholder="Enter mobile number"
                      disabled={isAssigned}
                    />
                  </div>
                </div>

                <div>
                  <label>Email Address *</label>
                  <div className="input-wrapper">
                    <Mail size={14} className="input-icon" />
                    <input
                      value={form.emailAddress}
                      onChange={e => setField('emailAddress', e.target.value)}
                      placeholder="Enter email address"
                      disabled={isAssigned}
                    />
                  </div>
                </div>
              </div>

              <div className="m1-divider" />

              <div className="m1-nav-row">
                <button type="button" className="btn-outline" onClick={() => navigate('/dashboard/modules')}>
                  Back to Modules
                </button>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button type="button" className="btn-outline" onClick={saveDraft} disabled={saving || isAssigned}>
                    {saving ? <span className="spinner" /> : <Save size={14} style={{ marginRight: 6 }} />} Save Draft
                  </button>
                  <button type="button" className="btn-primary" onClick={proceedToPayment} disabled={submitting || !canSubmit || isAssigned}>
                    {submitting ? <span className="spinner" /> : <ArrowRight size={14} style={{ marginRight: 6 }} />} Proceed to Payment
                  </button>
                </div>
              </div>
            </section>

            <section className="admin-panel">
              <div className="admin-panel__title">Application Status</div>

              <div className="admin-detail-grid">
                <div className="admin-detail-tile">
                  <span>Request ID</span>
                  <strong>{application?.id || '-'}</strong>
                </div>
                <div className="admin-detail-tile">
                  <span>Current Status</span>
                  <strong>{(application?.status || 'draft').toUpperCase()}</strong>
                </div>
                <div className="admin-detail-tile">
                  <span>Payment Status</span>
                  <strong>
                    <span className={paymentClass(application?.paymentStatus || 'pending')}>
                      {(application?.paymentStatus || 'pending').toUpperCase()}
                    </span>
                  </strong>
                </div>
                <div className="admin-detail-tile">
                  <span>Payment Reference</span>
                  <strong>{application?.paymentReference || '-'}</strong>
                </div>
                <div className="admin-detail-tile">
                  <span>Assigned TIN Number</span>
                  <strong>{application?.assignedTin || '-'}</strong>
                </div>
                <div className="admin-detail-tile">
                  <span>Requested At</span>
                  <strong>{formatDate(application?.requestedAt || null)}</strong>
                </div>
                <div className="admin-detail-tile">
                  <span>Assigned At</span>
                  <strong>{formatDate(application?.assignedAt || null)}</strong>
                </div>
              </div>

              {application?.status === 'submitted' && (
                <p className="admin-empty" style={{ marginTop: '12px' }}>
                  {moduleCode === 'M6'
                    ? 'Certificate request submitted after successful payment and currently in processing.'
                    : 'Request submitted after successful payment and currently in processing.'}
                </p>
              )}

              {application?.status === 'assigned' && (
                <p className="admin-empty" style={{ marginTop: '12px' }}>
                  Your TIN has already been assigned. You can check it anytime from TIN Number Status (M2).
                </p>
              )}

              <div style={{ marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() =>
                    navigate(`${moduleRouteBase}/payment`, {
                      state: {
                        applicationId: application?.id || '',
                        nic: form.nic,
                        application: buildSubmitPayload(),
                      },
                    })
                  }
                >
                  <ArrowRight size={14} style={{ marginRight: 6 }} /> Open {moduleCode} Payment Screen
                </button>
              </div>
            </section>
          </>
        )}
      </div>

      {snack && <div className="snackbar">{snack}</div>}
    </div>
  );
};

export default TinCertificateApplicationPage;
