import React from 'react';
import { TrendingUp, Landmark, Lightbulb, Users, Globe, Banknote, Briefcase, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const WHY_INVEST: { icon: React.ReactNode; title: string; desc: string }[] = [
  {
    icon: <TrendingUp size={28} />,
    title: 'Growing Market',
    desc: 'Sri Lanka has 10+ million taxable individuals. Less than 30% currently file returns, representing a massive growth opportunity.',
  },
  {
    icon: <Landmark size={28} />,
    title: 'Regulatory Tailwind',
    desc: 'Government mandates for digital tax submission and TIN registration are driving rapid adoption of digital platforms.',
  },
  {
    icon: <Lightbulb size={28} />,
    title: 'Technology Moat',
    desc: 'Proprietary AI tax questionnaire, multilingual voice interface, and GS Division booth network create strong competitive barriers.',
  },
  {
    icon: <Users size={28} />,
    title: 'Government Partnership',
    desc: 'Strategic partnership with IRD for data access APIs and national tax booth rollout creates a defensible market position.',
  },
  {
    icon: <Globe size={28} />,
    title: 'Regional Expansion',
    desc: 'Platform architecture supports expansion to other South Asian markets with similar tax compliance challenges.',
  },
  {
    icon: <Banknote size={28} />,
    title: 'Diversified Revenue',
    desc: 'Revenue from SaaS subscriptions, per-filing fees, booth franchise model, and advisory services provides diversified income streams.',
  },
];

const InvestorRelationsPage: React.FC = () => {
  const { s } = useLanguage();

  return (
    <main className="sub-page">
      <div className="sub-page__hero">
        <h1 className="sub-page__title">{s['investorPageTitle']}</h1>
        <div className="silver-divider" style={{ marginTop: '16px' }} />
        <p className="sub-page__subtitle">{s['investorPageDesc']}</p>
      </div>

      <div className="container">
        {/* Key Metrics */}
        <div className="stats-grid">
          {[
            { value: 'LKR 50M+', label: 'Revenue Pipeline' },
            { value: '6', label: 'Subsidiary Companies' },
            { value: '25', label: 'District Coverage' },
            { value: '2030', label: 'Target: 2M Clients' },
          ].map(stat => (
            <div key={stat.label} className="stat-card silver-box">
              <div className="stat-card__value">{stat.value}</div>
              <div className="stat-card__label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Why Invest */}
        <div style={{ marginTop: '64px' }}>
          <div className="section-label">INVESTMENT CASE</div>
          <h2 className="section-heading" style={{ fontSize: '26px', marginTop: '4px' }}>
            {s['whyInvest']}
          </h2>
          <div className="section-heading-divider" />
          <div className="core-services-grid">
            {WHY_INVEST.map(item => (
              <div key={item.title} className="section-card">
                <div style={{ fontSize: '28px', marginBottom: '14px' }}>{item.icon}</div>
                <h3
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--silver)',
                    marginBottom: '10px',
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ color: 'rgba(234,234,234,0.6)', fontSize: '13px', lineHeight: 1.7 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Business Model */}
        <div className="section-card" style={{ marginTop: '48px' }}>
          <div className="section-card__header"> Business Model Overview</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { model: 'Client Subscriptions', desc: 'Annual tax management packages for individuals and businesses' },
              { model: 'Per-Filing Fees', desc: 'Transaction-based revenue for each tax return filed' },
              { model: 'Tax Booth Franchise', desc: 'Franchise fees from national Tax Booth network operators' },
              { model: 'Advisory Services', desc: 'Premium consulting via S&C Business Consultants' },
              { model: 'Government API Access', desc: 'Future: government-licensed data services' },
            ].map(item => (
              <div
                key={item.model}
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(184,184,184,0.07)',
                }}
              >
                <div style={{ minWidth: '170px', fontSize: '13px', fontWeight: 600, color: 'rgba(234,234,234,0.85)' }}>
                  {item.model}
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(234,234,234,0.55)', lineHeight: 1.6 }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact for Investors */}
        <div
          style={{
            marginTop: '48px',
            padding: '36px',
            textAlign: 'center',
            background: 'linear-gradient(145deg, #0d0d0d, #080808)',
            border: '1px solid rgba(184,184,184,0.12)',
            borderRadius: '20px',
          }}
        >
          <div style={{ fontSize: '28px', marginBottom: '12px' }}></div>
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--silver)',
              marginBottom: '10px',
            }}
          >
            Partner With Us
          </h2>
          <p
            style={{
              color: 'rgba(234,234,234,0.6)',
              fontSize: '14px',
              maxWidth: '420px',
              margin: '0 auto 24px',
              lineHeight: 1.7,
            }}
          >
            We welcome strategic investors, institutional partners, and government collaborators aligned with our mission of digital tax transformation.
          </p>
          <div style={{ color: 'rgba(184,184,184,0.5)', fontSize: '13px', marginBottom: '8px' }}>
            {s['investorContact']}
          </div>
          <div style={{ color: 'rgba(184,184,184,0.5)', fontSize: '13px' }}>
             +94 11 000 0002
          </div>
        </div>
      </div>
    </main>
  );
};

export default InvestorRelationsPage;
