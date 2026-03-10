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
        <Route path="/dashboard" element={<DashboardPage />} />
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
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppInner />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;
