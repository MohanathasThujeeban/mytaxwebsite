import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Mail, CreditCard, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import OtpInput from '../components/OtpInput';
import { api } from '../utils/api';

type VerifyMethod = 'phone' | 'email';

const VerifyPage: React.FC = () => {
  const { s } = useLanguage();
  const { verification, updateVerification } = useAuth();
  const navigate = useNavigate();

  const [method, setMethod] = useState<VerifyMethod>('email');
  const [nic, setNic] = useState(verification.nic);
  const [mobile, setMobile] = useState(verification.mobile);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [isRegisteredAccount, setIsRegisteredAccount] = useState<boolean | null>(verification.isRegistered);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState('');
  const [countdown, setCountdown] = useState(0);

  const [apiError, setApiError] = useState('');

  const showSnack = (msg: string) => {
    setSnack(msg);
    setTimeout(() => setSnack(''), 3000);
  };

  const startCountdown = () => {
    setCountdown(60);
    const t = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(t); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const switchMethod = (m: VerifyMethod) => {
    setMethod(m);
    setOtpSent(false);
    setOtp(Array(6).fill(''));
    setCountdown(0);
  };

  const handleSendOtp = () => {
    setApiError('');
    const trimmedNic = nic.trim();
    const trimmedMobile = mobile.trim();
    const trimmedEmail = email.trim();
    const contact = method === 'phone' ? trimmedMobile : trimmedEmail;

    if (!trimmedNic || (method === 'phone' ? !trimmedMobile : !trimmedEmail)) {
      showSnack(s['fillAllFields']);
      return;
    }

    setLoading(true);
    api.requestOtp({
      nic: trimmedNic,
      phone: method === 'phone' ? trimmedMobile : undefined,
      email: method === 'email' ? trimmedEmail : undefined,
    })
      .then(res => {
        setLoading(false);

        if (res.channel === 'bypass') {
          const registered = res.isRegistered === true;
          setIsRegisteredAccount(registered);
          updateVerification({
            nic: trimmedNic,
            mobile: trimmedMobile,
            isOtpSent: false,
            isVerified: true,
            token: res.token ?? null,
            isRegistered: registered,
          });
          showSnack(res.message || 'Default account verified. Continue to login.');
          navigate('/login');
          return;
        }

        const registered = res.isRegistered === true;
        setIsRegisteredAccount(registered);
        setOtpSent(true);
        updateVerification({
          nic: trimmedNic,
          mobile: method === 'phone' ? trimmedMobile : verification.mobile,
          isOtpSent: true,
          isVerified: false,
          token: null,
          isRegistered: registered,
        });
        startCountdown();
        showSnack(res.message || `OTP sent to ${contact}`);
      })
      .catch(err => {
        setLoading(false);
        setApiError(err.message || 'Failed to send OTP');
      });
  };

  const handleVerifyOtp = () => {
    const otpStr = otp.join('');
    if (otpStr.length < 6) {
      showSnack(s['enterCompleteOtp']);
      return;
    }

    const trimmedNic = nic.trim();
    const trimmedEmail = email.trim();
    const trimmedMobile = mobile.trim();

    setLoading(true);
    api.verifyOtp({
      nic: trimmedNic,
      email: method === 'email' ? trimmedEmail : undefined,
      code: otpStr,
    })
      .then(res => {
        setLoading(false);
        setVerified(true);
        const registered = res.isRegistered === true;
        setIsRegisteredAccount(registered);
        updateVerification({
          isVerified: true,
          token: res.token,
          nic: trimmedNic,
          mobile: trimmedMobile,
          isOtpSent: true,
          isRegistered: registered,
        });
        showSnack(res.message || 'Verified');
      })
      .catch(err => {
        setLoading(false);
        setApiError(err.message || 'Invalid OTP');
      });
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setOtp(Array(6).fill(''));
    handleSendOtp();
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

      <div className="auth-form animate-in">
        <h1 className="auth-title">{s['userVerification']}</h1>
        <div className="auth-title-divider" />

        {!verified ? (
          <>
            {/* ── Method Tabs ── */}
            <div className="verify-tabs" style={{ marginBottom: '24px' }}>
              <button
                className={`verify-tab${method === 'phone' ? ' active' : ''}`}
                onClick={() => switchMethod('phone')}
              >
                <Smartphone size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />{s['phoneTab'] ?? 'Phone Number'}
              </button>
              <button
                className={`verify-tab${method === 'email' ? ' active' : ''}`}
                onClick={() => switchMethod('email')}
              >
                <Mail size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />{s['emailTab'] ?? 'Email'}
              </button>
            </div>

            {/* ── Step 1: NIC ── */}
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
                  disabled={otpSent}
                  style={{ opacity: otpSent ? 0.5 : 1 }}
                />
              </div>
            </div>

            {/* ── Phone or Email field ── */}
            <div style={{ marginBottom: '8px' }}>
              {method === 'phone' ? (
                <>
                  <div className="field-label">
                    <Smartphone size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> {s['mobileNumber']}
                  </div>
                  <div className="input-wrapper">
                    <input
                      type="tel"
                      placeholder="+94 XX XXX XXXX"
                      value={mobile}
                      onChange={e => setMobile(e.target.value)}
                      disabled={otpSent}
                      style={{ opacity: otpSent ? 0.5 : 1 }}
                    />
                  </div>
                  <p style={{ fontSize: '11px', color: 'rgba(184,184,184,0.5)', fontStyle: 'italic', marginTop: '6px' }}>
                    {s['underNic']}
                  </p>
                </>
              ) : (
                <>
                  <div className="field-label">
                    <Mail size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> {s['emailInput'] ?? 'Email Address:'}
                  </div>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={otpSent}
                      style={{ opacity: otpSent ? 0.5 : 1 }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Note */}
            <div className="note-block" style={{ margin: '20px 0' }}>
              <strong>{s['note']}</strong>
              {s['noteBody']}
            </div>

            {/* Send OTP or verify */}
            {!otpSent ? (
              <>
                <button
                  className="btn-primary btn-full"
                  onClick={handleSendOtp}
                  disabled={loading}
                >
                  {loading ? <span className="spinner" /> : <Send size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />} {s['sendOtp']}
                </button>
                {apiError && (
                  <p style={{ color: '#ff9a9a', marginTop: '12px', fontSize: '12px', textAlign: 'center' }}>{apiError}</p>
                )}
              </>
            ) : (
              <>
                {/* ── Step 2: OTP ── */}
                <div
                  style={{
                    margin: '28px 0 20px',
                    padding: '20px',
                    background: 'rgba(184,184,184,0.03)',
                    border: '1px solid rgba(184,184,184,0.12)',
                    borderRadius: '14px',
                  }}
                >
                  <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(234,234,234,0.65)', marginBottom: '20px' }}>
                    {s['enterOtp']}
                  </p>
                  <OtpInput value={otp} onChange={setOtp} />
                </div>

                <button
                  className="btn-primary btn-full"
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  style={{ marginBottom: '14px' }}
                >
                  {loading ? <span className="spinner" /> : '✓'} {s['verifyOtp']}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    className="passkey-link"
                    onClick={handleResend}
                    disabled={countdown > 0}
                    style={{ opacity: countdown > 0 ? 0.45 : 1 }}
                  >
                    🔄 {s['resendOtp']} {countdown > 0 ? `(${countdown}s)` : ''}
                  </button>
                  <button
                    className="passkey-link"
                    onClick={() => { setOtpSent(false); setOtp(Array(6).fill('')); setApiError(''); }}
                  >
                    ✎ {method === 'phone' ? 'Change number' : 'Change email'}
                  </button>
                </div>
                {apiError && (
                  <p style={{ color: '#ff9a9a', marginTop: '12px', fontSize: '12px' }}>{apiError}</p>
                )}
              </>
            )}
          </>
        ) : (
          /* ── Step 3: Verified ── */
          <div className="verified-badge">
            <div className="verified-icon">✓</div>
            <p
              style={{ fontSize: '16px', fontWeight: 700, color: 'var(--silver)', letterSpacing: '0.3px' }}
            >
              Verified!
            </p>
            <p className="verified-text">{isRegisteredAccount ? 'Account already exists. Please login to continue.' : s['verifiedMessage']}</p>
            <div className="verified-actions">
              <button
                className="btn-primary"
                style={{ flex: 1, minWidth: '130px' }}
                onClick={() => navigate('/login')}
              >
                {s['login']}
              </button>
              {isRegisteredAccount !== true && (
                <button
                  className="btn-outline"
                  style={{ flex: 1, minWidth: '130px' }}
                  onClick={() => navigate('/register')}
                >
                  {s['registerNew']}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {snack && <div className="snackbar">{snack}</div>}
    </div>
  );
};

export default VerifyPage;
