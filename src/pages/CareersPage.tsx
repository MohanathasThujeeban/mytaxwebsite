import React from 'react';
import { Rocket, Globe, BookOpen, TrendingUp, Mail } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const CareersPage: React.FC = () => {
  const { s } = useLanguage();

  const WHY_US = [
    { icon: <Rocket size={28} />, title: s['whyJobCuttingEdge'], desc: s['whyJobCuttingEdgeDesc'] },
    { icon: <Globe size={28} />, title: s['whyJobNationalImpact'], desc: s['whyJobNationalImpactDesc'] },
    { icon: <BookOpen size={28} />, title: s['whyJobLearning'], desc: s['whyJobLearningDesc'] },
    { icon: <TrendingUp size={28} />, title: s['whyJobGrowth'], desc: s['whyJobGrowthDesc'] },
  ];

  const OPEN_POSITIONS = [
    {
      title: s['jobReactTitle'],
      dept: s['jobTechDept'],
      type: s['jobFullTime'],
      location: s['jobColomboPH'],
      desc: s['jobReactDesc'],
    },
    {
      title: s['jobFlutterTitle'],
      dept: s['jobTechDept'],
      type: s['jobFullTime'],
      location: s['jobColomboPH'],
      desc: s['jobFlutterDesc'],
    },
    {
      title: s['jobTaxConsultTitle'],
      dept: s['jobAdvisoryDept'],
      type: s['jobFullTime'],
      location: s['jobMultiLoc'],
      desc: s['jobTaxConsultDesc'],
    },
    {
      title: s['jobBoothTitle'],
      dept: s['jobOpsDept'],
      type: s['jobContract'],
      location: s['jobIslandWide'],
      desc: s['jobBoothDesc'],
    },
    {
      title: s['jobDataTitle'],
      dept: s['jobTechDept'],
      type: s['jobFullTime'],
      location: s['jobColomboPH'],
      desc: s['jobDataDesc'],
    },
    {
      title: s['jobSupportTitle'],
      dept: s['jobOpsDept'],
      type: s['jobFullTime'],
      location: s['jobColomboPH'],
      desc: s['jobSupportDesc'],
    },
  ];

  return (
    <main className="sub-page">
      <div className="sub-page__hero">
        <h1 className="sub-page__title">{s['careersPageTitle']}</h1>
        <div className="silver-divider" style={{ marginTop: '16px' }} />
        <p className="sub-page__subtitle">{s['careersPageDesc']}</p>
      </div>

      <div className="container">
        {/* Why Us */}
        <div className="section-label">{s['cultureBenefits']?.toUpperCase() || 'CULTURE & BENEFITS'}</div>
        <h2 className="section-heading" style={{ fontSize: '26px', marginTop: '4px' }}>
          {s['whyUs']}
        </h2>
        <div className="section-heading-divider" />
        <div className="core-services-grid">
          {WHY_US.map(item => (
            <div key={item.title} className="section-card">
              <div style={{ fontSize: '26px', marginBottom: '12px' }}>{item.icon}</div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--silver)', marginBottom: '8px' }}>
                {item.title}
              </h3>
              <p style={{ color: 'rgba(234,234,234,0.6)', fontSize: '13px', lineHeight: 1.7 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Open Positions */}
        <div style={{ marginTop: '64px' }}>
          <div className="section-label">{s['currentOpenings']?.toUpperCase() || 'CURRENT OPENINGS'}</div>
          <h2 className="section-heading" style={{ fontSize: '26px', marginTop: '4px' }}>
            {s['openPositions']}
          </h2>
          <div className="section-heading-divider" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {OPEN_POSITIONS.map(pos => (
              <div key={pos.title} className="section-card job-card">
                <div className="job-card__header">
                  <div>
                    <h3 className="job-card__title">{pos.title}</h3>
                    <div className="job-card__meta">
                      <span>{pos.dept}</span>
                      <span>·</span>
                      <span>{pos.type}</span>
                      <span>·</span>
                      <span>📍 {pos.location}</span>
                    </div>
                  </div>
                  <button className="btn-outline" style={{ padding: '8px 20px', fontSize: '12px', flexShrink: 0 }}>
                    {s['applyNow']}
                  </button>
                </div>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'rgba(234,234,234,0.55)',
                    lineHeight: 1.6,
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(184,184,184,0.07)',
                  }}
                >
                  {pos.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CV submission */}
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
          <div style={{ fontSize: '28px', marginBottom: '12px' }}>📩</div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--silver)', marginBottom: '10px' }}>
            {s['dontSeeRole']}
          </h2>
          <p
            style={{
              color: 'rgba(234,234,234,0.6)',
              fontSize: '14px',
              maxWidth: '400px',
              margin: '0 auto 20px',
              lineHeight: 1.7,
            }}
          >
            {s['dontSeeRoleDesc']}
          </p>
          <div style={{ color: 'rgba(184,184,184,0.5)', fontSize: '13px' }}>
             careers@matrixinvestments.lk
          </div>
        </div>
      </div>
    </main>
  );
};

export default CareersPage;
