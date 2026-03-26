import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const LoginPage: React.FC = () => {
  const { s } = useLanguage();
  const { verification, login } = useAuth();
  const navigate = useNavigate();

  const [nic, setNic] = useState(verification.nic);
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState('');
  const [apiError, setApiError] = useState('');

  const showSnack = (msg: string) => {
    setSnack(msg);
    setTimeout(() => setSnack(''), 3000);
  };

  const handleLogin = () => {
    if (!nic.trim() || !password.trim()) {
      showSnack(s['loginFillFields']);
      return;
    }
    setLoading(true);
    api.login({ nic, password })
      .then(res => {
        const u = res.user as Record<string, unknown>;
        login({
          nic: (u.nic as string) || nic,
          fullName: u.fullName as string,
          contactNo: (u.phone as string) || verification.mobile,
          mailAddress: u.email as string,
          district: u.district as string,
          dsDivision: u.dsDivision as string,
          gsDivision: u.gsDivision as string,
          postalNo: u.postalNo as string,
          addressLine1: u.addressLine1 as string,
          addressLine2: u.addressLine2 as string,
        });
        navigate('/dashboard');
      })
      .catch(err => {
        setApiError(err.message || 'Login failed');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="auth-page">
      {/* Top bar */}
      <div className="auth-topbar">
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

      {/* Branding */}
      <div className="login-branding">
        <div className="login-branding__title">MyTax</div>
        <div className="login-branding__badge">{s['loginTitle']}</div>
      </div>

      {/* Form card */}
      <div className="auth-form animate-in" style={{ paddingTop: '0' }}>
        <div className="section-card">
          {/* NIC field */}
          <div style={{ marginBottom: '20px' }}>
            <div className="field-label">
              <CreditCard size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> {s['nicNumber']}
            </div>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="e.g. 922162719V"
                value={nic}
                onChange={e => setNic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>

          {/* Password field */}
          <div style={{ marginBottom: '12px' }}>
            <div className="field-label">
              <Lock size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> {s['password']}
            </div>
            <div className="input-wrapper">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
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
                  flexShrink: 0,
                }}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Passkey & Forgot */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <button className="passkey-link">
              <KeyRound size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />{s['usePasskey']}
            </button>
            <button className="passkey-link" onClick={() => navigate('/verify')}>
              {s['forgotPassword']}
            </button>
          </div>

          {/* Login button */}
          <button
            className="btn-primary btn-full"
            onClick={handleLogin}
            disabled={loading}
            style={{ marginBottom: '16px' }}
          >
            {loading ? <span className="spinner" /> : '→'} {s['loginTitle']}
          </button>

          {/* Register link */}
          <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(184,184,184,0.5)' }}>
            Don&apos;t have an account?{' '}
            <button
              className="passkey-link"
              style={{ display: 'inline', textDecoration: 'underline' }}
              onClick={() => navigate('/register')}
            >
              {s['registerNew']}
            </button>
          </p>
        </div>

        {/* Back to verify */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'rgba(184,184,184,0.4)' }}>
          First time?{' '}
          <button
            className="passkey-link"
            style={{ display: 'inline' }}
            onClick={() => navigate('/verify')}
          >
            Verify your identity first
          </button>
        </p>
      </div>

      {snack && <div className="snackbar">{snack}</div>}
      {apiError && <div className="snackbar" style={{ background: '#552222' }}>{apiError}</div>}
    </div>
  );
};

export default LoginPage;
