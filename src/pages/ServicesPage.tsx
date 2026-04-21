import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, CreditCard, BarChart2, ClipboardList, Package, Receipt, Landmark, FileEdit, Home } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';



const ServicesPage: React.FC = () => {
  const { s } = useLanguage();
  const navigate = useNavigate();

  const CORE_SERVICES = [
    {
      icon: <User size={28} />,
      key: 'individualTaxFiling',
      descKey: 'individualTaxDesc',
      tag: s['tagIndividuals'],
      tagClass: 'tag-free',
    },
    {
      icon: <Building2 size={28} />,
      key: 'businessTaxFiling',
      descKey: 'businessTaxDesc',
      tag: s['tagBusinesses'],
      tagClass: 'tag-free',
    },
    {
      icon: <CreditCard size={28} />,
      key: 'tinRegistration',
      descKey: 'tinRegistrationDesc',
      tag: s['tagRegistration'],
      tagClass: 'tag-free',
    },
    {
      icon: <BarChart2 size={28} />,
      key: 'complianceMonitoring',
      descKey: 'complianceMonitoringDesc',
      tag: s['tagMonitoring'],
      tagClass: 'tag-paid',
    },
  ];

  const PLATFORM_SERVICES = [
    { code: 'M1', label: s['platM1Label'], tag: s['tagPrimary'], tagClass: 'tag-paid' },
    { code: 'M2', label: s['platM2Label'], tag: s['free'], tagClass: 'tag-free' },
    { code: 'M3', label: s['platM3Label'], tag: s['free'], tagClass: 'tag-free' },
    { code: 'M5', label: s['platM5Label'], tag: s['paid'], tagClass: 'tag-paid' },
    { code: 'M6', label: s['platM6Label'], tag: s['paid'], tagClass: 'tag-paid' },
    { code: 'M7', label: s['platM7Label'], tag: s['paid'], tagClass: 'tag-paid' },
    { code: 'M8', label: s['platM8Label'], tag: s['paid'], tagClass: 'tag-paid' },
    { code: 'M9', label: s['platM9Label'], tag: s['paid'], tagClass: 'tag-paid' },
  ];

  return (
    <main className="sub-page">
      <div className="sub-page__hero">
        <h1 className="sub-page__title">{s['servicesPageTitle']}</h1>
        <div className="silver-divider" style={{ marginTop: '16px' }} />
        <p className="sub-page__subtitle">{s['servicesPageDesc']}</p>
      </div>

      <div className="container">
        {/* Core Services */}
        <div className="section-label">{s['coreServices']?.toUpperCase() || 'CORE SERVICES'}</div>
        <h2 className="section-heading" style={{ fontSize: '26px', marginTop: '4px' }}>
          {s['taxFilingComplianceTitle']}
        </h2>
        <div className="section-heading-divider" />

        <div className="core-services-grid">
          {CORE_SERVICES.map(svc => (
            <div key={svc.key} className="section-card core-service-card">
              <div className="core-service-card__icon" style={{ display: 'inline-flex', alignItems: 'center', color: 'rgba(184,184,184,0.7)' }}>{svc.icon}</div>
              <h3 className="core-service-card__title">{s[svc.key]}</h3>
              <p className="core-service-card__desc">{s[svc.descKey]}</p>
              <span className={`service-card__tag ${svc.tagClass}`} style={{ marginTop: 'auto' }}>
                {svc.tag}
              </span>
            </div>
          ))}
        </div>

        {/* MyTax Platform Services */}
        <div style={{ marginTop: '64px' }}>
          <div className="section-label">{s['platformModules']?.toUpperCase() || 'PLATFORM MODULES'}</div>
          <h2 className="section-heading" style={{ fontSize: '26px', marginTop: '4px' }}>
            {s['myTaxDigitalServices']}
          </h2>
          <div className="section-heading-divider" />
          <div className="services-grid">
            {PLATFORM_SERVICES.map(svc => (
              <div key={svc.code} className="service-card">
                <div className="service-card__code">{svc.code}</div>
                <div className="service-card__body">
                  <div className="service-card__label">{svc.label}</div>
                  <span className={`service-card__tag ${svc.tagClass}`}>{svc.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* S&C Expanded Services */}
        <div style={{ marginTop: '64px' }}>
          <div className="section-label">{s['subsidiaryServices']?.toUpperCase() || 'SUBSIDIARY SERVICES'}</div>
          <h2 className="section-heading" style={{ fontSize: '26px', marginTop: '4px' }}>
            S&C Business Consultants (Pvt) Ltd
          </h2>
          <div className="section-heading-divider" />
          <div className="services-cat-grid">
            {[
              {
                icon: <BarChart2 size={18} />,
                title: s['scAccounts'],
                items: [s['scMonthlyFinance'], s['scMonthlyAccounts'], s['scProfitReports'], s['scLoanAccounts'], s['scAnnualAccounts']],
              },
              {
                icon: <ClipboardList size={18} />,
                title: s['scProposals'],
                items: [s['scLoanProposal'], s['scBusinessProposal']],
              },
              {
                icon: <Package size={18} />,
                title: s['scInventory'],
                items: [s['scStockVerification'], s['scDigitalStock']],
              },
              {
                icon: <Receipt size={18} />,
                title: s['scTaxCategory'],
                items: [s['scIncomeTaxFiling'], s['scIncomeTaxReg'], s['scVatConsult'], s['scTaxConsult']],
              },
              {
                icon: <Landmark size={18} />,
                title: s['scCompanyReg'],
                items: [s['scBusinessReg'], s['scCharityReg']],
              },
              {
                icon: <FileEdit size={18} />,
                title: s['scSecretarial'],
                items: [s['scAnnualReturn'], s['scSecretary']],
              },
              {
                icon: <Home size={18} />,
                title: s['scRealEstate'],
                items: [s['scDealAdvisory']],
              },
            ].map(cat => (
              <div key={cat.title} className="section-card">
                <div className="section-card__header">
                  {cat.icon} {cat.title}
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

        {/* CTA */}
        <div
          style={{
            marginTop: '64px',
            padding: '48px 24px',
            textAlign: 'center',
            background: 'linear-gradient(145deg, #0d0d0d, #080808)',
             border: '1px solid rgba(212, 175, 55, 0.28)',
            boxShadow:'0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(212, 175, 55, 0.12)',
            borderRadius: '20px',
          }}
        >
          <div className="section-label">{s['getStarted']?.toUpperCase() || 'GET STARTED'}</div>
          <h2
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: 'var(--silver)',
              margin: '8px 0 12px',
            }}
          >
            {s['readyToFile']}
          </h2>
          <p
            style={{
              color: 'rgba(234,234,234,0.6)',
              fontSize: '15px',
              marginBottom: '32px',
              maxWidth: '440px',
              margin: '0 auto 32px',
              lineHeight: 1.6,
            }}
          >
            {s['readyToFileDesc']}
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => navigate('/verify')}>
              🔐 {s['signIn']}
            </button>
            <button className="btn-outline" onClick={() => navigate('/verify')}>
              {s['registerNew']}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ServicesPage;
