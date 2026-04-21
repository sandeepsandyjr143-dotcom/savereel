import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import HomePage from './pages/HomePage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import DmcaPage from './pages/DmcaPage.jsx';
import Footer from './components/Footer.jsx';
import Toast from './components/Toast.jsx';
import { useToast } from './hooks/useToast.js';
import styles from './App.module.css';

export default function App() {
  const { toast, showToast, hideToast } = useToast();

  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        <Routes>
          <Route path="/"        element={<HomePage showToast={showToast} />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms"   element={<TermsPage />} />
          <Route path="/dmca"    element={<DmcaPage />} />
        </Routes>
      </main>
      <Footer />
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}
