import React from 'react';
import { ShoppingBag, Monitor, Building2, TrendingUp, Scale, Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const COMPANIES: {
  id: number;
  icon: React.ReactNode;
  name: string;
  tagline: string;
  description: string;
  services: string[];
  established: string;
}[] = [
  { id: 1, icon: <ShoppingBag size={28} />, name: 'S&C Business Consultants (Pvt) Ltd', tagline: 'Business & Tax Consulting Excellence', description: 'Providing comprehensive accounting, tax, company registration, secretarial and real estate advisory services to businesses and individuals across Sri Lanka.', services: ['Accounts', 'Tax Filing', 'Company Registrations', 'Inventory Management', 'Real Estates', 'Proposals', 'Secretarial Works'], established: '2015' },
  { id: 2, icon: <Monitor size={28} />, name: 'Matrix MyTax Digital Solutions (Pvt) Ltd', tagline: 'Digital Tax Innovation', description: 'The technology arm of Matrix Investments PLC, driving the MyTax digital platform for tax filing and compliance management.', services: ['MyTax App', 'Digital Tax Filing', 'TIN Services', 'Compliance Tools', 'AI Tax Assistant'], established: '2020' },
  { id: 3, icon: <Building2 size={28} />, name: 'Matrix Tax Booth Network (Pvt) Ltd', tagline: 'Nationwide Tax Access Points', description: 'Manages the Matrix Tax Booth national rollout providing assisted TIN registration, app onboarding, and voice-based tax filing services across GS Divisions.', services: ['TIN Registration', 'App Onboarding', 'Voice Filing', 'Payment Guidance'], established: '2022' },
  { id: 4, icon: <TrendingUp size={28} />, name: 'Matrix Financial Advisory (Pvt) Ltd', tagline: 'Investment & Finance Advisory', description: 'Providing expert financial advisory, investment planning, and capital management services to corporate and individual clients.', services: ['Financial Advisory', 'Investment Planning', 'Capital Management', 'Risk Assessment'], established: '2018' },
  { id: 5, icon: <Scale size={28} />, name: 'Matrix Compliance Solutions (Pvt) Ltd', tagline: 'Regulatory Compliance Management', description: 'Specialized in regulatory compliance monitoring, audit trail management, and government liaison services.', services: ['Compliance Audits', 'Risk Management', 'Government Liaison', 'Regulatory Reporting'], established: '2019' },
  { id: 6, icon: <Activity size={28} />, name: 'Matrix Data & Analytics (Pvt) Ltd', tagline: 'Data Intelligence for Tax', description: 'Driving data analytics and intelligence solutions supporting client database management and AI-based tax questionnaire systems.', services: ['Data Analytics', 'Client Database Management', 'AI Tax Assistant', 'Reporting Tools'], established: '2021' },
];

const GroupCompaniesPage: React.FC = () => {
  const { s } = useLanguage();

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
            border: '1px solid rgba(184,184,184,0.1)',
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
            Group Structure
          </div>
          <p style={{ color: 'rgba(234,234,234,0.6)', fontSize: '13px', lineHeight: 1.7 }}>
            All subsidiaries operate under the strategic direction of <strong style={{ color: 'var(--silver)' }}>Matrix Investments PLC</strong>, with shared governance, compliance standards, and technology infrastructure.
          </p>
        </div>
      </div>
    </main>
  );
};

export default GroupCompaniesPage;
