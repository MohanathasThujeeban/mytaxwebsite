import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CreditCard, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

type CardBrand = 'visa' | 'mastercard';

interface PaymentRouteState {
  applicationId?: string;
  nic?: string;
  application?: {
    nic?: string;
    fullName?: string;
    mobileNo?: string;
    emailAddress?: string;
  };
}

const USER_TOKEN_KEY = 'mytax_user_token';

const maskCardPreview = (cardNumber: string): string => {
  const digits = cardNumber.replace(/\D/g, '');
  const tail = digits.slice(-4);
  if (!tail) {
    return '**** **** **** ****';
  }
  return `**** **** **** ${tail}`;
};

const formatCardInput = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const formatExpiryInput = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

type TinModuleCode = 'M6' | 'M7';

interface TinApplicationPaymentPageProps {
  moduleCode?: TinModuleCode;
}

const generatePaymentReference = (applicationId?: string, moduleCode: TinModuleCode = 'M7'): string => {
  const fallbackPrefix = moduleCode === 'M6' ? 'M6REQ' : 'M7REQ';
  const normalizedId = (applicationId || fallbackPrefix).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const prefix = (normalizedId.slice(0, 8) || fallbackPrefix).padEnd(8, 'X');
  const tail = String(Date.now()).slice(-8).padStart(8, '0');
  return `PAY-${prefix}-${tail}`;
};

const TinApplicationPaymentPage: React.FC<TinApplicationPaymentPageProps> = ({ moduleCode = 'M7' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const routeState = (location.state || {}) as PaymentRouteState;

  const [brand, setBrand] = useState<CardBrand>('visa');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.fullName || '');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [paid, setPaid] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [paidAt, setPaidAt] = useState('');
  const [error, setError] = useState('');
  const [snack, setSnack] = useState('');

  const showSnack = (message: string) => {
    setSnack(message);
    window.setTimeout(() => setSnack(''), 2600);
  };

  const moduleRouteBase = moduleCode === 'M6' ? '/dashboard/m6' : '/dashboard/m7';
  const moduleEyebrow = `${moduleCode} PAYMENT SCREEN (PLACEHOLDER)`;
  const moduleDescription =
    moduleCode === 'M6'
      ? 'This is an interactive payment screen for M6 TIN Certificate Request. Final API integration can be plugged in later.'
      : 'This is an interactive payment screen for now. Final API integration can be plugged in later.';
  const moduleServiceLabel =
    moduleCode === 'M6' ? 'M6 - TIN Certificate Request' : 'M7 - TIN Certificate Application';

  const canPay = useMemo(() => {
    const cardDigits = cardNumber.replace(/\D/g, '');
    const expiryDigits = expiry.replace(/\D/g, '');
    const cvvDigits = cvv.replace(/\D/g, '');

    return (
      cardDigits.length === 16 &&
      cardHolder.trim().length >= 2 &&
      expiryDigits.length === 4 &&
      cvvDigits.length >= 3
    );
  }, [cardHolder, cardNumber, cvv, expiry]);

  useEffect(() => {
    if (!user) {
      navigate('/verify', { replace: true });
    }
  }, [navigate, user]);

  if (!user) {
    return null;
  }

  const handlePayNow = () => {
    if (!canPay) {
      showSnack('Please complete all card details.');
      return;
    }

    const token = sessionStorage.getItem(USER_TOKEN_KEY);
    if (!token) {
      setError('Session expired. Please login again.');
      return;
    }

    setError('');
    setProcessing(true);

    window.setTimeout(() => {
      const generatedReference = generatePaymentReference(routeState.applicationId, moduleCode);
      setPaymentReference(generatedReference);
      setPaidAt(new Date().toISOString());
      setPaid(true);
      setProcessing(false);
      showSnack('Payment successful. Click Request My Certificate to complete submission.');
    }, 850);
  };

  const handleRequestCertificate = () => {
    if (!paid) {
      showSnack('Complete payment first.');
      return;
    }

    const token = sessionStorage.getItem(USER_TOKEN_KEY);
    if (!token) {
      setError('Session expired. Please login again.');
      return;
    }

    setRequesting(true);
    setError('');

    const submitRequest = moduleCode === 'M6' ? api.m6Submit : api.m7Submit;
    submitRequest(token, {
      application: {
        nic: routeState.application?.nic || routeState.nic || user.nic,
        fullName: routeState.application?.fullName || user.fullName || '',
        mobileNo: routeState.application?.mobileNo || user.contactNo || '',
        emailAddress: routeState.application?.emailAddress || user.mailAddress || '',
      },
      payment: {
        paymentReference,
        method: brand === 'visa' ? 'VISA' : 'MASTERCARD',
        amount: 1500,
        currency: 'LKR',
        paidAt,
      },
    })
      .then(() => {
        const requestKind = moduleCode === 'M6' ? 'Certificate request submitted' : 'TIN request submitted';
        showSnack(`${requestKind}. Payment ID: ${paymentReference}`);
        navigate(moduleRouteBase, { replace: true });
      })
      .catch(err => {
        setError(err?.message || 'Unable to submit your request after payment. Please try again.');
      })
      .finally(() => setRequesting(false));
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="m1-header-copy">
          <p className="m1-eyebrow">{moduleEyebrow}</p>
          <h1>
            <CreditCard size={22} /> Visa / MasterCard Payment
          </h1>
          <p>{moduleDescription}</p>
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

        <div className="m1-dashboard-grid">
          <section className="admin-panel m1-section">
            <div className="admin-panel__title">Card Details</div>

            <div className="m1-toggle-choices" style={{ marginBottom: '14px' }}>
              <button
                type="button"
                className={`m1-chip${brand === 'visa' ? ' active' : ''}`}
                onClick={() => setBrand('visa')}
              >
                VISA
              </button>
              <button
                type="button"
                className={`m1-chip${brand === 'mastercard' ? ' active' : ''}`}
                onClick={() => setBrand('mastercard')}
              >
                MASTERCARD
              </button>
            </div>

            <div className="m1-form-grid">
              <div>
                <label>Card Number</label>
                <div className="input-wrapper">
                  <CreditCard size={14} className="input-icon" />
                  <input
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardInput(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div>
                <label>Card Holder Name</label>
                <div className="input-wrapper">
                  <ShieldCheck size={14} className="input-icon" />
                  <input
                    value={cardHolder}
                    onChange={e => setCardHolder(e.target.value)}
                    placeholder="Name on card"
                  />
                </div>
              </div>

              <div>
                <label>Expiry (MM/YY)</label>
                <div className="input-wrapper">
                  <input
                    value={expiry}
                    onChange={e => setExpiry(formatExpiryInput(e.target.value))}
                    placeholder="MM/YY"
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div>
                <label>CVV</label>
                <div className="input-wrapper">
                  <Lock size={14} className="input-icon" />
                  <input
                    value={cvv}
                    onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="***"
                    inputMode="numeric"
                  />
                </div>
              </div>
            </div>

            <div className="m1-nav-row" style={{ marginTop: '16px' }}>
              <button type="button" className="btn-outline" onClick={() => navigate(moduleRouteBase)}>
                <ArrowLeft size={14} style={{ marginRight: 6 }} /> Back to Application
              </button>
              <button type="button" className="btn-outline" onClick={handlePayNow} disabled={processing || !canPay || paid}>
                {processing ? <span className="spinner" /> : <CheckCircle2 size={14} style={{ marginRight: 6 }} />}
                {paid ? 'Payment Completed' : 'Pay Now'}
              </button>
              <button type="button" className="btn-primary" onClick={handleRequestCertificate} disabled={!paid || requesting}>
                {requesting ? <span className="spinner" /> : <CheckCircle2 size={14} style={{ marginRight: 6 }} />}
                Request My Certificate
              </button>
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-panel__title">Payment Summary</div>

            <div className="admin-detail-grid">
              <div className="admin-detail-tile">
                <span>Request ID</span>
                <strong>{routeState.applicationId || '-'}</strong>
              </div>
              <div className="admin-detail-tile">
                <span>NIC Number</span>
                <strong>{routeState.nic || user.nic}</strong>
              </div>
              <div className="admin-detail-tile">
                <span>Payment Method</span>
                <strong>{brand === 'visa' ? 'VISA' : 'MASTERCARD'}</strong>
              </div>
              <div className="admin-detail-tile">
                <span>Card Preview</span>
                <strong>{maskCardPreview(cardNumber)}</strong>
              </div>
              <div className="admin-detail-tile">
                <span>Service</span>
                <strong>{moduleServiceLabel}</strong>
              </div>
              <div className="admin-detail-tile">
                <span>Payment ID</span>
                <strong>{paymentReference || '-'}</strong>
              </div>
              <div className="admin-detail-tile">
                <span>Amount</span>
                <strong>LKR 1,500.00</strong>
              </div>
              <div className="admin-detail-tile">
                <span>Paid At</span>
                <strong>{paidAt ? new Date(paidAt).toLocaleString() : '-'}</strong>
              </div>
            </div>

            <p className="admin-empty" style={{ marginTop: '12px' }}>
              {paid
                ? 'Payment is marked successful. Click Request My Certificate to submit this paid request.'
                : 'Complete payment first, then click Request My Certificate to submit your request.'}
            </p>
          </section>
        </div>
      </div>

      {snack && <div className="snackbar">{snack}</div>}
    </div>
  );
};

export default TinApplicationPaymentPage;
