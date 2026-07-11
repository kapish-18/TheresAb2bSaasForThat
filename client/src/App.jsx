import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SharedResult from './pages/SharedResult';
import Admin from './pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/r/:slug" element={<SharedResult />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
