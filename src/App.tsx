import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Menu from './components/Menu';
import About from './components/About';
import Events from './components/Events';
import BanquetCalculator from './components/BanquetCalculator';
import Reviews from './components/Reviews';
import Contacts from './components/Contacts';
import Cart from './components/Cart';
import Footer from './components/Footer';
import Legal, { useLegalModal } from './components/Legal';

function App() {
  const { isOpen: isLegalOpen, docType, openDoc, closeDoc } = useLegalModal();

  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <Hero />
          <Menu />
          <About />
          <BanquetCalculator />
          <Events />
          <Reviews />
          <Contacts />
        </main>
        <Footer onOpenLegal={openDoc} />
        <Cart onOpenLegal={openDoc} />
        <Legal isOpen={isLegalOpen} docType={docType} onClose={closeDoc} />
      </div>
    </CartProvider>
  );
}

export default App;
