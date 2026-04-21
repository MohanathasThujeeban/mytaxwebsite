import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Smartphone, Globe, CheckCircle2, SendHorizonal, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ContactPage: React.FC = () => {
  const { s } = useLanguage();

  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  const CONTACT_ITEMS = [
    { icon: <Mail size={20} />, label: s['contactEmailLabel'], value: 'info@matrixinvestments.lk' },
    { icon: <Phone size={20} />, label: s['contactHotlineLabel'], value: '+94 11 000 0000' },
    { icon: <MapPin size={20} />, label: s['contactLocationLabel'], value: s['contactLocationValue'] },
    { icon: <Clock size={20} />, label: s['contactHoursLabel'], value: s['contactBusinessHoursValue'] },
    { icon: <Smartphone size={20} />, label: s['contactWhatsAppLabel'], value: '+94 77 000 0000' },
    { icon: <Globe size={20} />, label: s['contactWebLabel'], value: 'www.matrixinvestments.lk' },
  ];

  return (
    <main className="sub-page">
      <div className="sub-page__hero">
        <h1 className="sub-page__title">{s['contactPageTitle']}</h1>
        <div className="silver-divider" style={{ marginTop: '16px' }} />
        <p className="sub-page__subtitle">{s['contactPageDesc']}</p>
      </div>

      <div className="container">
        <div className="contact-layout">
          {/* Left: Contact info */}
          <div>
            <div className="section-card" style={{ marginBottom: '28px' }}>
              <div className="section-card__header"><MapPin size={16} style={{ display:'inline', verticalAlign:'middle', marginRight:'6px' }} />{s['getInTouch']}</div>
              {CONTACT_ITEMS.map(item => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(184,184,184,0.07)',
                  }}
                >
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div
                      style={{
                        fontSize: '10px',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        color: 'rgba(184,184,184,0.45)',
                        marginBottom: '2px',
                      }}
                    >
                      {item.label}
                    </div>
                    <div style={{ fontSize: '14px', color: 'rgba(234,234,234,0.8)' }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Response commitment */}
            <div
              style={{
                padding: '18px',
                background: 'rgba(70,180,100,0.05)',
                border: '1px solid rgba(70,180,100,0.18)',
                borderRadius: '12px',
              }}
            >
              <div style={{ fontSize: '13px', color: 'rgba(234,234,234,0.7)', lineHeight: 1.7 }}>
                 {s['responseCommitment1']}
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(234,234,234,0.7)', lineHeight: 1.7, marginTop: '6px' }}>
                 {s['responseCommitment2']}
              </div>
            </div>
          </div>

          {/* Right: Forms */}
          <div>
            {submitted ? (
              <div className="verified-badge">
                <div className="verified-icon"></div>
                <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--silver)' }}>
                  {s['thankYouContact']}
                </div>
                <p className="verified-text">
                  {s['reviewAndRespond']}
                </p>
                <button
                  className="btn-outline"
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                >
                  {s['sendAnother']}
                </button>
              </div>
            ) : (
              <>
                {/* General Contact */}
                <div className="section-card" style={{ marginBottom: '24px' }}>
                  <div className="section-card__header"><Mail size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />{s['getInTouch']}</div>
                  <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                      <div className="field-label">{s['contactFormName']}</div>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          name="name"
                          placeholder={s['phFullName']}
                          value={form.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <div className="field-label">{s['contactFormEmail']}</div>
                      <div className="input-wrapper">
                        <input
                          type="email"
                          name="email"
                          placeholder={s['phEmail']}
                          value={form.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <div className="field-label">{s['contactFormPhone']}</div>
                      <div className="input-wrapper">
                        <input
                          type="tel"
                          name="phone"
                          placeholder={s['phPhone']}
                          value={form.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <div className="field-label">{s['contactFormSubject']}</div>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          name="subject"
                          placeholder={s['phSubject']}
                          value={form.subject}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <div className="field-label">{s['contactFormMessage']}</div>
                      <div className="input-wrapper" style={{ alignItems: 'flex-start' }}>
                        <textarea
                          name="message"
                          rows={5}
                          placeholder={s['phMessage']}
                          value={form.message}
                          onChange={handleChange}
                          required
                          style={{
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: 'var(--silver)',
                            fontSize: '14px',
                            width: '100%',
                            resize: 'vertical',
                            fontFamily: 'var(--font)',
                            minHeight: '100px',
                          }}
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="btn-primary btn-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>{s['sending']}</span>
                      ) : (
                        <><SendHorizonal size={15} style={{ marginRight: '6px' }} />{s['submitBtn']}</>
                      )}
                    </button>
                  </form>
                </div>

                {/* Complaint Form */}
                <div className="section-card">
                  <div className="section-card__header"><AlertTriangle size={16} style={{ display:'inline', verticalAlign:'middle', marginRight:'6px' }} />{s['complaintSection']}</div>
                  <p
                    style={{
                      color: 'rgba(234,234,234,0.55)',
                      fontSize: '13px',
                      lineHeight: 1.7,
                      marginBottom: '16px',
                    }}
                  >
                    {s['complaintFormDesc']}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'rgba(234,234,234,0.7)' }}>
                      <span>📧</span>
                      <span>complaints@matrixinvestments.lk</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'rgba(234,234,234,0.7)' }}>
                      <span>📞</span>
                      <span>+94 11 000 0001 (Complaints Hotline)</span>
                    </div>
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '12px',
                        background: 'rgba(255,200,50,0.04)',
                        border: '1px solid rgba(255,200,50,0.12)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: 'rgba(234,234,234,0.5)',
                        lineHeight: 1.7,
                      }}
                    >
                      {s['complaintPdpaNote']}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;
