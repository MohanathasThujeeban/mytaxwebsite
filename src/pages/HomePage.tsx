import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Zap,
  Users,
  Rocket,
  FolderOpen,
  AlertTriangle,
  ClipboardList,
  FileText,
  Banknote,
  Files,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface Service {
  code: string;
  labelKey: string;
  paid: boolean | null; // null = N/A (primary service)
}

const SERVICES: Service[] = [
  { code: "M1", labelKey: "m1", paid: null },
  { code: "M2", labelKey: "m2", paid: false },
  { code: "M3", labelKey: "m3", paid: false },
  { code: "M5", labelKey: "m5", paid: true },
  { code: "M6", labelKey: "m6", paid: true },
  { code: "M7", labelKey: "m7", paid: true },
  { code: "M8", labelKey: "m8", paid: true },
  { code: "M9", labelKey: "m9", paid: true },
];

const ABOUT_CARDS: {
  icon: React.ReactNode;
  titleKey: string;
  descKey: string;
}[] = [
  {
    icon: <ShieldCheck size={28} />,
    titleKey: "secureTitle",
    descKey: "secureDesc",
  },
  { icon: <Zap size={28} />, titleKey: "fastTitle", descKey: "fastDesc" },
  {
    icon: <Users size={28} />,
    titleKey: "supportTitle",
    descKey: "supportDesc",
  },
];

const HomePage: React.FC = () => {
  const { s } = useLanguage();
  const navigate = useNavigate();

  return (
    <main className="home-page">
      {/* ══════════════════════════════
          HERO
          ══════════════════════════════ */}
      <section className="hero">
        <div className="hero__logo-wrap">
          <div className="ring-glow"></div>
          <div className="ring-static"></div>
          <div className="ring-slow"></div>
          <img
            src="/images/logo.png"
            alt="MyTax Logo"
            className="hero__logo"
            onError={(e) =>
              ((e.target as HTMLImageElement).style.visibility = "hidden")
            }
          />
        </div>

        <h1 className="hero__title">
          MyTax<sup>™</sup>
        </h1>
        <p className="hero__company">{s["companyName"]}</p>
        <p className="hero__tagline">{s["heroTagline"]}</p>
        <div className="hero__actions">
          <button className="btn-primary" onClick={() => navigate("/verify")}>
            <Rocket
              size={15}
              style={{ marginRight: 6, verticalAlign: "middle" }}
            />
            {s["getStarted"]}
          </button>
          <a href="#services" className="btn-outline">
            {s["learnMore"]} ↓
          </a>
        </div>
      </section>

      {/* ══════════════════════════════
          SERVICES
          ══════════════════════════════ */}
      <section id="services" className="home-section">
        <div className="section-wrapper">
          <p className="section-label reveal reveal-d1">
            {s["taxServicesTitle"]}
          </p>
          <h2 className="section-heading reveal reveal-d2">
            {s["myTaxServices"]}
          </h2>
          <div className="section-heading-divider" />

          <div className="services-grid">
            {SERVICES.map((svc, index) => (
              <div
                key={svc.code}
                className={`service-card reveal-d${(index % 6) + 1}`}
              >
                <div className="card-line"></div>
                <div className="service-card__code">{svc.code}</div>
                <div className="service-card__body">
                  <div className="service-card__label">
                    {s[svc.labelKey]?.replace(/^M\d+ - /, "") ??
                      s[svc.labelKey]}
                  </div>
                  {svc.paid !== null && (
                    <span
                      className={`service-card__tag ${svc.paid ? "tag-paid" : "tag-free"}`}
                    >
                      {svc.paid ? "Paid" : "Free"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          ABOUT
          ══════════════════════════════ */}
      <section id="about" className="home-section home-section--alt">
        <div className="section-wrapper">
          <p className="section-label reveal reveal-d1">{s["aboutUs"]}</p>
          <h2 className="section-heading reveal reveal-d2">
            {s["aboutTitle"]}
          </h2>
          <div className="section-heading-divider" />

          <p
            style={{
              fontSize: "15px",
              color: "rgba(184,184,184,0.65)",
              lineHeight: "1.8",
              marginBottom: "40px",
              maxWidth: "680px",
            }}
          >
            {s["aboutDesc"]}
          </p>

          <div className="about-cards">
            {ABOUT_CARDS.map((card, i) => (
              <div
                key={card.titleKey}
                className={`about-card reveal-d${i + 1}`}
              >
                <div className="card-line"></div>
                <div className="about-card__icon">{card.icon}</div>
                <div className="about-card__title">{s[card.titleKey]}</div>
                <div className="about-card__text">{s[card.descKey]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          GUIDE PLACEHOLDER
          ══════════════════════════════ */}
      <section id="guide" className="home-section">
        <div className="section-wrapper">
          <p className="section-label reveal reveal-d1">{s["guide"]}</p>
          <h2 className="section-heading reveal reveal-d2">
            {s["guideTitle"]}
          </h2>
          <div className="section-heading-divider" />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "14px",
            }}
          >
            {[
              { icon: <FolderOpen size={20} />, key: "documentsForLogin" },
              {
                icon: <AlertTriangle size={20} />,
                key: "taxFillingImportance",
              },
              { icon: <ClipboardList size={20} />, key: "taxFilingTypes" },
              { icon: <FileText size={20} />, key: "taxPayerRegDocs" },
              { icon: <Banknote size={20} />, key: "taxFilingPenalty" },
              { icon: <Files size={20} />, key: "taxFilingReqDocs" },
            ].map((item, idx) => (
              <button
                key={item.key}
                className={`guide-card reveal-d${idx + 1}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "18px 20px",
                  background: "linear-gradient(160deg, #0b0b0b, #050505)",
                  border: "1px solid rgba(184,184,184,0.11)",
                  borderRadius: "14px",
                  color: "rgba(234,234,234,0.75)",
                  fontSize: "13px",
                  cursor: "pointer",
                  textAlign: "left",

                  /* 🔥 premium additions */
                  transition:
                    "transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease, border-color 0.25s ease",
                  transform: "translateY(0) scale(1)",
                  boxShadow: "0 0 0 rgba(0,0,0,0)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;

                  el.style.borderColor = "rgba(184,184,184,0.28)";
                  el.style.transform = "translateY(-6px) scale(0.98)";
                  el.style.boxShadow =
                    "0 10px 30px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)";

                  const icon = el.querySelector(".icon") as HTMLElement;
                  const arrow = el.querySelector(".arrow") as HTMLElement;

                  if (icon) icon.style.transform = "scale(1.1)";
                  if (arrow) arrow.style.transform = "translateX(6px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;

                  el.style.borderColor = "rgba(184,184,184,0.11)";
                  el.style.transform = "translateY(0) scale(1)";
                  el.style.boxShadow = "0 0 0 rgba(0,0,0,0)";

                  const icon = el.querySelector(".icon") as HTMLElement;
                  const arrow = el.querySelector(".arrow") as HTMLElement;

                  if (icon) icon.style.transform = "scale(1)";
                  if (arrow) arrow.style.transform = "translateX(0)";
                }}
              >
                <span
                  className="icon"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    flexShrink: 0,
                    transition: "transform 0.3s ease",
                  }}
                >
                  {item.icon}
                </span>

                <span>{s[item.key]}</span>

                <span
                  className="arrow"
                  style={{
                    marginLeft: "auto",
                    opacity: 0.35,
                    transition: "transform 0.3s ease",
                  }}
                >
                  ›
                </span>
              </button>
            ))}
          </div>

          <p
            style={{
              fontSize: "12px",
              color: "rgba(184,184,184,0.35)",
              textAlign: "center",
              marginTop: "28px",
            }}
          >
            {s["skip"]} — Full guide content coming soon
          </p>
        </div>
      </section>

      {/* ══════════════════════════════
          CTA BANNER
          ══════════════════════════════ */}
      <section
        className="reveal"
        style={{
          padding: "80px 40px",
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(100,100,100,0.07) 0%, transparent 70%)",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "30px",
            fontWeight: 800,
            color: "var(--silver)",
            marginBottom: "14px",
            letterSpacing: "0.5px",
          }}
        >
          {s["welcome"]}
        </h2>
        <p
          style={{
            fontSize: "14px",
            color: "rgba(184,184,184,0.55)",
            marginBottom: "36px",
            maxWidth: "480px",
            margin: "0 auto 36px",
            lineHeight: 1.7,
          }}
        >
          {s["thankYouReg"]}
        </p>
        <button className="btn-primary" onClick={() => navigate("/verify")}>
          <Rocket
            size={15}
            style={{ marginRight: 6, verticalAlign: "middle" }}
          />
          {s["getStarted"]}
        </button>
      </section>

      {/* ══════════════════════════════
          DECLARATION
          ══════════════════════════════ */}
      <div className="declaration">
        <div className="declaration__inner">
          <p className="declaration__title">{s["declaration"]}</p>
          <p className="declaration__text">{s["declarationBody"]}</p>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
