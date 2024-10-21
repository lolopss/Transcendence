import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Matchmaking from './pages/Matchmaking';

function App() {
  const navigate = useNavigate();

  const handleStartMatchmaking = () => {
    navigate('/matchmaking'); // Navigate to the matchmaking page
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<Home onStartMatchmaking={handleStartMatchmaking} />} />
        <Route path="/matchmaking" element={<Matchmaking />} />
      </Routes>
    </>
  );
}

export default function MainApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
