import React from 'react';
import { Receipt, User, UserCheck, Building2, Bot, Calendar, FolderOpen, BookOpen, AlertTriangle, Files, CreditCard, Ban, FileText, RefreshCw, Bell } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';



const GENERAL_GUIDE: { key: string; icon: React.ReactNode }[] = [
  { key: 'documentsForLogin', icon: <FolderOpen size={20} /> },
  { key: 'taxGeneralGuide', icon: <BookOpen size={20} /> },
  { key: 'taxFillingImportance', icon: <AlertTriangle size={20} /> },
  { key: 'taxFilingTypes', icon: <Files size={20} /> },
  { key: 'taxPayerRegDocs', icon: <CreditCard size={20} /> },
  { key: 'taxFilingPenalty', icon: <Ban size={20} /> },
  { key: 'taxFilingReqDocs', icon: <FileText size={20} /> },
  { key: 'taxInfoUpdateDocs', icon: <RefreshCw size={20} /> },
];

const GuidePage: React.FC = () => {
  const { s } = useLanguage();

  const GUIDE_TOPICS = [
    {
      icon: <Receipt size={28} />,
      key: 'guideUseOfTaxServices',
      desc: s['guideUseOfTaxDesc'],
      free: true,
      available: true,
    },
    {
      icon: <User size={28} />,
      key: 'guideUserGuide',
      desc: s['guideUserGuideDesc'],
      free: true,
      available: true,
    },
    {
      icon: <UserCheck size={28} />,
      key: 'guideAgentGuide',
      desc: s['guideAgentGuideDesc'],
      free: true,
      available: true,
    },
    {
      icon: <Building2 size={28} />,
      key: 'guideAboutUs',
      desc: s['guideAboutUsDesc'],
      free: true,
      available: true,
    },
    {
      icon: <Bot size={28} />,
      key: 'guideHelpAI',
      desc: s['guideHelpAIDesc'],
      free: true,
      available: false,
    },
    {
      icon: <Calendar size={28} />,
      key: 'guideTaxCalendar',
      desc: s['guideTaxCalendarDesc'],
      free: true,
      available: true,
    },
  ];

  return (
    <main className="sub-page">
      <div className="sub-page__hero">
        <h1 className="sub-page__title">{s['guidePageTitle']}</h1>
        <div className="silver-divider" style={{ marginTop: '16px' }} />
        <p className="sub-page__subtitle">{s['guidePageDesc']}</p>
      </div>

      <div className="container">
        {/* Video Guide Topics */}
        <div className="section-label">{s['videoGuidesTitle']?.toUpperCase() || 'VIDEO GUIDES'}</div>
        <h2 className="section-heading" style={{ fontSize: '26px', marginTop: '4px' }}>
          {s['toolGuidanceVideos']}
        </h2>
        <div className="section-heading-divider" />

        <div className="guide-grid">
          {GUIDE_TOPICS.map(topic => (
            <div key={topic.key} className="guide-card section-card">
              <div className="guide-card__top">
                <div className="guide-card__icon">{topic.icon}</div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    flex: 1,
                  }}
                >
                  <h3 className="guide-card__title">{s[topic.key]}</h3>
                  {topic.free && (
                    <span className="service-card__tag tag-free" style={{ alignSelf: 'flex-start' }}>
                      {s['freeOfCharge']}
                    </span>
                  )}
                </div>
              </div>
              <p className="guide-card__desc">{topic.desc}</p>
              <button
                className={topic.available ? 'btn-outline' : 'btn-outline'}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '10px',
                  fontSize: '12px',
                  opacity: topic.available ? 1 : 0.45,
                  cursor: topic.available ? 'pointer' : 'default',
                }}
                disabled={!topic.available}
              >
                {topic.available ? `▶ ${s['watchNow']}` : `⏳ ${s['comingSoon']}`}
              </button>
            </div>
          ))}
        </div>

        {/* General Tax Guide */}
        <div style={{ marginTop: '64px' }}>
          <div className="section-label">{s['guide']?.toUpperCase() || 'GENERAL GUIDE'}</div>
          <h2 className="section-heading" style={{ fontSize: '26px', marginTop: '4px' }}>
            {s['guideTitle']}
          </h2>
          <div className="section-heading-divider" />

          <div className="guide-topics-list">
            {GENERAL_GUIDE.map(item => (
              <button key={item.key} className="guide-topic-btn section-card">
                <span className="guide-topic-btn__icon">{item.icon}</span>
                <span className="guide-topic-btn__label">{s[item.key]}</span>
                <span className="guide-topic-btn__arrow">›</span>
              </button>
            ))}
          </div>
        </div>

        {/* SMS Alerts Info */}
        <div className="section-card" style={{ marginTop: '48px' }}>
          <div className="section-card__header"><Bell size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> {s['smsAlertsTitle']}</div>
          <p
            style={{
              color: 'rgba(234,234,234,0.6)',
              fontSize: '14px',
              lineHeight: 1.7,
              marginBottom: '20px',
            }}
          >
            {s['smsAlertsDesc']}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { tag: s['smsRegTag'], text: s['smsRegText'] },
              { tag: s['smsAssignTag'], text: s['smsAssignText'] },
              { tag: s['smsDocsTag'], text: s['smsDocsText'] },
              { tag: s['smsDoneTag'], text: s['smsDoneText'] },
              { tag: s['smsInvoiceTag'], text: s['smsInvoiceText'] },
              { tag: s['smsConfirmedTag'], text: s['smsConfirmedText'] },
            ].map(alert => (
              <div
                key={alert.tag}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 0',
                  borderBottom: '1px solid rgba(184,184,184,0.06)',
                }}
              >
                <span
                  style={{
                    minWidth: '90px',
                    fontSize: '10px',
                    letterSpacing: '0.8px',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    background: 'rgba(184,184,184,0.08)',
                    border: '1px solid rgba(184,184,184,0.18)',
                    color: 'rgba(234,234,234,0.6)',
                    textAlign: 'center',
                  }}
                >
                  {alert.tag}
                </span>
                <span style={{ color: 'rgba(234,234,234,0.65)', fontSize: '13px' }}>
                  {alert.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default GuidePage;
