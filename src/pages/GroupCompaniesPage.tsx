import React from 'react';
import { ShoppingBag, Monitor, Building2, TrendingUp, Scale, Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const GroupCompaniesPage: React.FC = () => {
  const { s } = useLanguage();

  const COMPANIES = [
    { id: 1, icon: <ShoppingBag size={28} />, name: 'S&C Business Consultants (Pvt) Ltd', tagline: s['company1Tagline'], description: s['company1Desc'], services: [s['svcAccounts'], s['svcTaxFiling'], s['svcCompanyReg'], s['svcInventoryMgmt'], s['svcRealEstate'], s['svcProposals'], s['svcSecretarialWorks']], established: '2015' },
    { id: 2, icon: <Monitor size={28} />, name: 'Matrix MyTax Digital Solutions (Pvt) Ltd', tagline: s['company2Tagline'], description: s['company2Desc'], services: [s['svcMyTaxApp'], s['svcDigitalTaxFiling'], s['svcTINServices'], s['svcComplianceTools'], s['svcAIAssistant']], established: '2020' },
    { id: 3, icon: <Building2 size={28} />, name: 'Matrix Tax Booth Network (Pvt) Ltd', tagline: s['company3Tagline'], description: s['company3Desc'], services: [s['svcTINRegistration'], s['svcAppOnboarding'], s['svcVoiceFiling'], s['svcPaymentGuidance']], established: '2022' },
    { id: 4, icon: <TrendingUp size={28} />, name: 'Matrix Financial Advisory (Pvt) Ltd', tagline: s['company4Tagline'], description: s['company4Desc'], services: [s['svcFinancialAdvisory'], s['svcInvestmentPlanning'], s['svcCapitalManagement'], s['svcRiskAssessment']], established: '2018' },
    { id: 5, icon: <Scale size={28} />, name: 'Matrix Compliance Solutions (Pvt) Ltd', tagline: s['company5Tagline'], description: s['company5Desc'], services: [s['svcComplianceAudits'], s['svcRiskManagement'], s['svcGovernmentLiaison'], s['svcRegulatoryReporting']], established: '2019' },
    { id: 6, icon: <Activity size={28} />, name: 'Matrix Data & Analytics (Pvt) Ltd', tagline: s['company6Tagline'], description: s['company6Desc'], services: [s['svcDataAnalytics'], s['svcClientDatabase'], s['svcAIAssistant'], s['svcReportingTools']], established: '2021' },
  ];

  return (
    <main className="sub-page">
      <div className="sub-page__hero">
        <h1 className="sub-page__title">{s['groupPageTitle']}</h1>
        <div className="silver-divider" style={{ marginTop: '16px' }} />
        <p className="sub-page__subtitle">{s['groupPageDesc']}</p>
      </div>

      <div className="container">
        <div className="companies-grid">
          {COMPANIES.map(company => (
            <div key={company.id} className="company-card section-card">
              <div className="company-card__icon" style={{ display: 'inline-flex', alignItems: 'center', color: 'rgba(184,184,184,0.6)' }}>{company.icon}</div>
              <div className="company-card__number">0{company.id}</div>
              <h3 className="company-card__name">{company.name}</h3>
              <div className="company-card__tagline">{company.tagline}</div>
              <p className="company-card__desc">{company.description}</p>
              <div className="company-card__services">
                {company.services.map(svc => (
                  <span key={svc} className="service-tag">{svc}</span>
                ))}
              </div>
              <div className="company-card__footer">
                <span style={{ color: 'rgba(184,184,184,0.4)', fontSize: '11px', letterSpacing: '1px' }}>
                  EST. {company.established}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Group structure note */}
        <div
          style={{
            marginTop: '48px',
            padding: '24px 28px',
            background: 'rgba(13,13,13,0.6)',
            borderRadius: '14px',
            border: '1px solid rgba(212, 175, 55, 0.28)',
            boxShadow:'0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(212, 175, 55, 0.12)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'rgba(184,184,184,0.45)',
              marginBottom: '10px',
            }}
          >
            {s['groupStructure']}
          </div>
          <p style={{ color: 'rgba(234,234,234,0.6)', fontSize: '13px', lineHeight: 1.7 }}>
            {s['groupStructureNote']}
          </p>
        </div>
      </div>
    </main>
  );
};

export default GroupCompaniesPage;
