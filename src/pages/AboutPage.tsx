import React from 'react';
import { BarChart2, ClipboardList, Package, Receipt, Landmark, FileEdit, Home, Target, Eye, Building2, Monitor, Smartphone, Play, GraduationCap, Bot, Calendar, UserCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';


const AboutPage: React.FC = () => {
  const { s } = useLanguage();

  const SC_SERVICES = [
    {
      icon: '📊',
      title: s['scAccounts'],
      items: [s['scMonthlyFinance'], s['scMonthlyAccounts'], s['scProfitReports'], s['scLoanAccounts'], s['scAnnualAccounts']],
    },
    {
      icon: '📋',
      title: s['scProposals'],
      items: [s['scLoanProposal'], s['scBusinessProposal']],
    },
    {
      icon: '📦',
      title: s['scInventory'],
      items: [s['scStockVerification'], s['scDigitalStock']],
    },
    {
      icon: '🧾',
      title: s['scTaxCategory'],
      items: [s['scIncomeTaxFiling'], s['scIncomeTaxReg'], s['scVatConsult'], s['scTaxConsult']],
    },
    {
      icon: '🏛️',
      title: s['scCompanyReg'],
      items: [s['scBusinessReg'], s['scCharityReg']],
    },
    {
      icon: '📝',
      title: s['scSecretarial'],
      items: [s['scAnnualReturn'], s['scSecretary']],
    },
    {
      icon: '🏠',
      title: s['scRealEstate'],
      items: [s['scDealAdvisory']],
    },
  ];

  const STATS = [
    { value: '10,000+', label: s['statsClients'] },
    { value: '5+', label: s['statsYears'] },
    { value: '25,000+', label: s['statsTaxReturns'] },
    { value: '25', label: s['statsDistricts'] },
  ];

  return (
    <main className="sub-page">
      <div className="sub-page__hero">
        <h1 className="sub-page__title">{s['aboutPageTitle']}</h1>
        <div className="silver-divider" style={{ marginTop: '16px' }} />
        <p className="sub-page__subtitle">{s['aboutPageDesc']}</p>
      </div>

      <div className="container">
        {/* Stats row */}
        <div className="stats-grid">
          {STATS.map(stat => (
            <div key={stat.label} className="stat-card silver-box">
              <div className="card-line"></div>
              <div className="stat-card__value">{stat.value}</div>
              <div className="stat-card__label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="two-col-grid" style={{ marginTop: '64px' }}>
          <div className="section-card">
            <div className="section-card__header"><Target size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />{s['aboutPageMission']}</div>
            <p style={{ color: 'rgba(234,234,234,0.7)', lineHeight: 1.8, fontSize: '15px' }}>
              {s['aboutPageMissionDesc']}
            </p>
          </div>
          <div className="section-card">
            <div className="section-card__header"><Eye size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />{s['aboutPageVision']}</div>
            <p style={{ color: 'rgba(234,234,234,0.7)', lineHeight: 1.8, fontSize: '15px' }}>
              {s['aboutPageVisionDesc']}
            </p>
          </div>
        </div>

        {/* About Matrix */}
        <div className="section-card" style={{ marginTop: '28px' }}>
          <div className="section-card__header"><Building2 size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Matrix Investments PLC</div>
          <p style={{ color: 'rgba(234,234,234,0.7)', lineHeight: 1.8, fontSize: '15px', marginBottom: '14px' }}>
            {s['aboutMatrixDesc1']}
          </p>
          <p style={{ color: 'rgba(234,234,234,0.7)', lineHeight: 1.8, fontSize: '15px' }}>
            {s['aboutMatrixDesc2']}
          </p>
        </div>

        {/* S&C Services */}
        <div style={{ marginTop: '48px' }}>
          <div className="section-label" style={{ marginBottom: '6px' }}>{s['subsidiaryServices']}</div>
          <h2 className="section-heading" style={{ fontSize: '22px' }}>
            S&C Business Consultants (Pvt) Ltd
          </h2>
          <div className="section-heading-divider" />
          <div className="services-cat-grid">
            {SC_SERVICES.map(cat => (
              <div key={cat.title} className="section-card">
                <div className="section-card__header">
                  <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 8 }}>{cat.icon}</span>{cat.title}
                </div>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {cat.items.map(item => (
                    <li
                      key={item}
                      style={{
                        color: 'rgba(234,234,234,0.65)',
                        fontSize: '13px',
                        padding: '7px 0',
                        borderBottom: '1px solid rgba(184,184,184,0.07)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span style={{ color: 'rgba(184,184,184,0.35)', fontSize: '9px' }}>▸</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Digital tools */}
        <div className="section-card" style={{ marginTop: '28px' }}>
          <div className="section-card__header"><Monitor size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Digital Tools</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '4px' }}>
            {[
              { icon: <Smartphone size={16} />, label: s['toolMyTaxApp'], tag: s['free'] },
              { icon: <Play size={16} />, label: s['toolGuidanceVideos'], tag: s['free'] },
              { icon: <GraduationCap size={16} />, label: s['toolUserGuideLabel'], tag: s['free'] },
              { icon: <Bot size={16} />, label: s['toolAIInstructor'], tag: s['free'] },
              { icon: <Calendar size={16} />, label: s['toolTaxCalendar'], tag: s['free'] },
              { icon: <UserCheck size={16} />, label: s['toolAgentGuide'], tag: s['free'] },
            ].map(tool => (
              <div
                key={tool.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(184,184,184,0.1)',
                  borderRadius: '10px',
                  fontSize: '13px',
                  color: 'rgba(234,234,234,0.75)',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', color: 'rgba(184,184,184,0.6)' }}>{tool.icon}</span>
                <span>{tool.label}</span>
                <span className="service-card__tag tag-free">{tool.tag}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Declaration */}
        <div
          style={{
            marginTop: '48px',
            padding: '24px',
            background: 'rgba(13,13,13,0.6)',
            borderRadius: '12px',
            border: '1px solid rgba(212, 175, 55, 0.28)',
            boxShadow:'0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(212, 175, 55, 0.12)'
          }}
        >
          <p
            style={{
              color: 'rgba(184,184,184,0.5)',
              fontSize: '12px',
              lineHeight: 1.8,
              textAlign: 'center',
            }}
          >
            {s['declarationBody']}
          </p>
        </div>
      </div>
    </main>
  );
};

export default AboutPage;
