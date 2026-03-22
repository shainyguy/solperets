import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import BarPage from './pages/BarPage';
import EventsPage from './pages/EventsPage';
import AboutPage from './pages/AboutPage';
import ContactsPage from './pages/ContactsPage';
import AdminPage from './pages/AdminPage';
import AdminInstructionPage from './pages/AdminInstructionPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import LegalPage from './pages/LegalPage';

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="min-h-screen bg-zinc-950">
          <Routes>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/instructions" element={<AdminInstructionPage />} />
            <Route path="*" element={
              <>
                <Navbar />
                <CartDrawer />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/menu" element={<MenuPage />} />
                  <Route path="/bar" element={<BarPage />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contacts" element={<ContactsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/legal" element={<LegalPage />} />
                </Routes>
                <Footer />
              </>
            } />
          </Routes>
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}
