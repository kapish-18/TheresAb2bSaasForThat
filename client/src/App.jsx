import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SharedResult from './pages/SharedResult';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/r/:slug" element={<SharedResult />} />
      </Routes>
    </BrowserRouter>
  );
}
