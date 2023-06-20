
import './App.css';
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom'
import { Navbar } from './components/navbar';
import { Cart } from './pages/cart/cart';
import { Shop } from './pages/shop/shop';
import { Setting } from './pages/setting/setting';
import { Description } from './pages/shop/description';
import { History } from './pages/history/history';
import { ShopContextProvider } from './context/shop-context';
import { Checkout } from './pages/checkout/checkout';

function App() {
  return (
    <div className="App">
      <ShopContextProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route>
              <Route path="/" element={<Shop />} />
              <Route path="/history" element={<History />} />
              <Route path="/description/:id" element={<Description />} />
              <Route path="/cart" element={<Cart />} />
              <Route path= "/checkout" element={<Checkout />} />
              <Route path= "/setting" element={<Setting />}/>
            </Route>
          </Routes>
        </Router>
      </ShopContextProvider>
    </div>
  );
}

export default App;
