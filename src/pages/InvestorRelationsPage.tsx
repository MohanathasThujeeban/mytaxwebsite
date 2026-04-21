import React from 'react';
import { TrendingUp, Landmark, Lightbulb, Users, Globe, Banknote, Briefcase, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const InvestorRelationsPage: React.FC = () => {
  const { s } = useLanguage();

  const WHY_INVEST = [
    {
      icon: <TrendingUp size={28} />,
      title: s['whyGrowingMarket'],
      desc: s['whyGrowingMarketDesc'],
    },
    {
      icon: <Landmark size={28} />,
      title: s['whyRegulatoryTailwind'],
      desc: s['whyRegulatoryTailwindDesc'],
    },
    {
      icon: <Lightbulb size={28} />,
      title: s['whyTechMoat'],
      desc: s['whyTechMoatDesc'],
    },
    {
      icon: <Users size={28} />,
      title: s['whyGovPartnership'],
      desc: s['whyGovPartnershipDesc'],
    },
    {
      icon: <Globe size={28} />,
      title: s['whyRegionalExpansion'],
      desc: s['whyRegionalExpansionDesc'],
    },
    {
      icon: <Banknote size={28} />,
      title: s['whyDiversifiedRevenue'],
      desc: s['whyDiversifiedRevenueDesc'],
    },
  ];

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
            { value: 'LKR 50M+', label: s['invStatRevenue'] },
            { value: '6', label: s['invStatCompanies'] },
            { value: '25', label: s['invStatDistricts'] },
            { value: '2030', label: s['invStatTarget'] },
          ].map(stat => (
            <div key={stat.label} className="stat-card silver-box">
              <div className="stat-card__value">{stat.value}</div>
              <div className="stat-card__label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Why Invest */}
        <div style={{ marginTop: '64px' }}>
          <div className="section-label">{s['investmentCase']?.toUpperCase() || 'INVESTMENT CASE'}</div>
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
          <div className="section-card__header"> {s['businessModelTitle']}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { model: s['bmClientSubs'], desc: s['bmClientSubsDesc'] },
              { model: s['bmPerFiling'], desc: s['bmPerFilingDesc'] },
              { model: s['bmBoothFranchise'], desc: s['bmBoothFranchiseDesc'] },
              { model: s['bmAdvisory'], desc: s['bmAdvisoryDesc'] },
              { model: s['bmGovAPI'], desc: s['bmGovAPIDesc'] },
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
             border: '1px solid rgba(212, 175, 55, 0.28)',
            boxShadow:'0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(212, 175, 55, 0.12)',
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
            {s['partnerWithUs']}
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
            {s['partnerWithUsDesc']}
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
