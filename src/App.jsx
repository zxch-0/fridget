import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Basket from './pages/Basket.jsx';
import Compare from './pages/Compare.jsx';
import Home from './pages/Home.jsx';
import Product from './pages/Product.jsx';
import Scan from './pages/Scan.jsx';
import Search from './pages/Search.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="recherche" element={<Search />} />
        <Route path="scan" element={<Scan />} />
        <Route path="comparer" element={<Compare />} />
        <Route path="panier" element={<Basket />} />
        <Route path="produit/:id" element={<Product />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
}
