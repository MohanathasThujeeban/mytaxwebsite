import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import VerifyPage from './pages/VerifyPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PostLoginModulesPage from './pages/PostLoginModulesPage';
import M1TaxSubmissionPage from './pages/M1TaxSubmissionPage';
import TinNumberStatusPage from './pages/TinNumberStatusPage';
import TinCertificateApplicationPage from './pages/TinCertificateApplicationPage';
import TinApplicationPaymentPage from './pages/TinApplicationPaymentPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AboutPage from './pages/AboutPage';
import GroupCompaniesPage from './pages/GroupCompaniesPage';
import ServicesPage from './pages/ServicesPage';
import GuidePage from './pages/GuidePage';
import ContactPage from './pages/ContactPage';
import LegalPage from './pages/LegalPage';
import InvestorRelationsPage from './pages/InvestorRelationsPage';
import CareersPage from './pages/CareersPage';
import { useScrollReveal } from './hooks/useScrollReveal';

const AppInner: React.FC = () => {
  useScrollReveal();
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard/modules" element={<PostLoginModulesPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/m1" element={<M1TaxSubmissionPage />} />
        <Route path="/dashboard/m2" element={<TinNumberStatusPage />} />
        <Route path="/dashboard/m6" element={<TinCertificateApplicationPage moduleCode="M6" />} />
        <Route path="/dashboard/m6/payment" element={<TinApplicationPaymentPage moduleCode="M6" />} />
        <Route path="/dashboard/m7" element={<TinCertificateApplicationPage moduleCode="M7" />} />
        <Route path="/dashboard/m7/payment" element={<TinApplicationPaymentPage moduleCode="M7" />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/group" element={<GroupCompaniesPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/guide" element={<GuidePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/legal" element={<LegalPage />} />
        <Route path="/investor" element={<InvestorRelationsPage />} />
        <Route path="/careers" element={<CareersPage />} />
      </Routes>
      <Footer />
    </>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LanguageProvider>
        <AuthProvider>
          <AppInner />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;
