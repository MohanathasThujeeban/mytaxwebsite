import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CreditCard, Pen, Smartphone, Mail, MapPin, Map, Home, Shield, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const SRI_LANKA_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
];

interface FormData {
  fullName: string;
  mobileNo: string;
  emailAddress: string;
  district: string;
  dsDivision: string;
  gsDivision: string;
  postalNo: string;
  addLine1: string;
  addLine2: string;
  password: string;
  usePasskey: boolean;
}

const SectionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <div className="section-card" style={{ marginBottom: '16px' }}>
    <div className="section-card__header">
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>
      <span>{title}</span>
    </div>
    {children}
  </div>
);

const Field: React.FC<{
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  half?: boolean;
}> = ({ label, icon, children, half }) => (
  <div style={{ marginBottom: half ? '0' : '18px', flex: half ? '1' : undefined }}>
    <div className="field-label">
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: '4px' }}>{icon}</span>}
      {label}
    </div>
    {children}
  </div>
);

const RegisterPage: React.FC = () => {
  const { s } = useLanguage();
  const { verification, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>({
    fullName: '',
    mobileNo: verification.mobile,
    emailAddress: '',
    district: '',
    dsDivision: '',
    gsDivision: '',
    postalNo: '',
    addLine1: '',
    addLine2: '',
    password: '',
    usePasskey: false,
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState('');
  const [apiError, setApiError] = useState('');

  const set = (key: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm(f => ({ ...f, [key]: e.target.value }));

  const showSnack = (msg: string) => {
    setSnack(msg);
    setTimeout(() => setSnack(''), 3000);
  };

  const handleSubmit = () => {
    setApiError('');
    if (
      !form.fullName.trim() ||
      !form.mobileNo.trim() ||
      !form.emailAddress.trim() ||
      !form.password.trim()
    ) {
      showSnack(s['registerFillFields']);
      return;
    }
    setLoading(true);
    api.register({
      nic: verification.nic,
      fullName: form.fullName,
      mobileNo: form.mobileNo,
      emailAddress: form.emailAddress,
      district: form.district,
      dsDivision: form.dsDivision,
      gsDivision: form.gsDivision,
      postalNo: form.postalNo,
      addressLine1: form.addLine1,
      addressLine2: form.addLine2,
      password: form.password,
    })
      .then(res => {
        setLoading(false);
        sessionStorage.removeItem('mytax_admin_token');
        sessionStorage.setItem('mytax_user_token', res.token);
        const u = res.user as Record<string, unknown>;
        login({
          nic: (u.nic as string) || verification.nic,
          fullName: (u.fullName as string) || form.fullName,
          contactNo: (u.phone as string) || form.mobileNo,
          mailAddress: (u.email as string) || form.emailAddress,
          district: (u.district as string) || form.district,
          dsDivision: (u.dsDivision as string) || form.dsDivision,
          gsDivision: (u.gsDivision as string) || form.gsDivision,
          postalNo: (u.postalNo as string) || form.postalNo,
          addressLine1: (u.addressLine1 as string) || form.addLine1,
          addressLine2: (u.addressLine2 as string) || form.addLine2,
        });
        showSnack(res.message || 'Registered');
        navigate('/dashboard/modules');
      })
      .catch(err => {
        setLoading(false);
        setApiError(err.message || 'Registration failed');
      });
  };

  const inputStyle: React.CSSProperties = {};

  return (
    <div className="auth-page">
      {/* Top bar */}
      <div className="auth-topbar" style={{ maxWidth: '660px' }}>
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          ‹
        </button>
        <img
          src="/images/logo.png"
          alt="Logo"
          className="topbar-logo"
          onError={e => ((e.target as HTMLImageElement).style.visibility = 'hidden')}
        />
      </div>

      {/* Form */}
      <div className="register-form animate-in">
        <h1 className="auth-title" style={{ fontStyle: 'italic' }}>
          {s['registerTitle']}
        </h1>
        <div className="auth-title-divider" style={{ marginBottom: '28px' }} />

        {/* ── Personal Info ── */}
        <SectionCard icon={<User size={16} />} title="Personal Information">
          <Field label="NIC: *" icon={<CreditCard size={14} />}>
            <div className="input-wrapper">
              <input
                type="text"
                value={verification.nic}
                readOnly
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>
          </Field>
          <Field label={s['fullName']} icon={<Pen size={14} />}>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={set('fullName')}
              />
            </div>
          </Field>
          <Field label={s['mobileNo']} icon={<Smartphone size={14} />}>
            <div className="input-wrapper">
              <input
                type="tel"
                placeholder="+94 XX XXX XXXX"
                value={form.mobileNo}
                onChange={set('mobileNo')}
              />
            </div>
          </Field>
          <Field label={s['emailAddress']} icon={<Mail size={14} />}>
            <div className="input-wrapper">
              <input
                type="email"
                placeholder="example@email.com"
                value={form.emailAddress}
                onChange={set('emailAddress')}
              />
            </div>
          </Field>
        </SectionCard>

        {/* ── Location ── */}
        <SectionCard icon={<MapPin size={16} />} title="Location">
          <Field label={s['district']} icon={<Map size={14} />}>
            <div className="input-wrapper" style={{ padding: '0 14px' }}>
              <select
                value={form.district}
                onChange={set('district')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: form.district ? 'var(--silver)' : 'rgba(184,184,184,0.35)',
                  fontSize: '14px',
                  width: '100%',
                  padding: '12px 0',
                  cursor: 'pointer',
                }}
              >
                <option value="" disabled style={{ background: '#111' }}>Select district</option>
                {SRI_LANKA_DISTRICTS.map(d => (
                  <option key={d} value={d} style={{ background: '#111', color: '#eee' }}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </Field>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Field label={s['dsDivision']} half>
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="DS Division"
                  value={form.dsDivision}
                  onChange={set('dsDivision')}
                />
              </div>
            </Field>
            <Field label={s['gsDivision']} half>
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="GS Division"
                  value={form.gsDivision}
                  onChange={set('gsDivision')}
                />
              </div>
            </Field>
          </div>
        </SectionCard>

        {/* ── Postal Address ── */}
        <SectionCard icon={<Home size={16} />} title={s['postalAddress']}>
          <Field label="House / Building No.">
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="No. 135"
                value={form.postalNo}
                onChange={set('postalNo')}
              />
            </div>
          </Field>
          <Field label="Street / Road">
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Inner Harbour Road"
                value={form.addLine1}
                onChange={set('addLine1')}
              />
            </div>
          </Field>
          <Field label="City / Town">
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Colombo"
                value={form.addLine2}
                onChange={set('addLine2')}
              />
            </div>
          </Field>
        </SectionCard>

        {/* ── Security ── */}
        <SectionCard icon={<Shield size={16} />} title="Security">
          <Field label={s['createPassword']} icon={<Lock size={14} />}>
            <div className="input-wrapper">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={form.password}
                onChange={set('password')}
              />
              <button
                onClick={() => setShowPass(p => !p)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(184,184,184,0.5)',
                  cursor: 'pointer',
                  fontSize: '15px',
                  padding: '0',
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          {/* Passkey toggle */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'rgba(184,184,184,0.65)',
              userSelect: 'none',
            }}
          >
            <div
              onClick={() => setForm(f => ({ ...f, usePasskey: !f.usePasskey }))}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '5px',
                background: form.usePasskey
                  ? 'linear-gradient(145deg, #e0e0e0, #c0c0c0)'
                  : 'linear-gradient(145deg, #1c1c1c, #080808)',
                border: '1px solid rgba(184,184,184,0.3)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: '#000',
              }}
            >
              {form.usePasskey ? '✓' : ''}
            </div>
            <KeyRound size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} /> {s['usePasskeyBiometric']}
          </label>
        </SectionCard>

        {/* Submit */}
        <button
          className="btn-primary btn-full"
          onClick={handleSubmit}
          disabled={loading}
          style={{ padding: '16px' }}
        >
          {loading ? <span className="spinner" /> : '✓'} {s['verifyAndCreate']}
        </button>

        {apiError && (
          <p style={{ color: '#ff9a9a', marginTop: '12px', fontSize: '12px', textAlign: 'center' }}>{apiError}</p>
        )}

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'rgba(184,184,184,0.4)' }}>
          Already have an account?{' '}
          <button className="passkey-link" style={{ display: 'inline' }} onClick={() => navigate('/login')}>
            {s['login']}
          </button>
        </p>
      </div>

      {snack && <div className="snackbar">{snack}</div>}
    </div>
  );
};

export default RegisterPage;
