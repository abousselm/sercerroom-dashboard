import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sensors from './pages/Sensors';
import Users from './pages/Users';
import PendingApprovals from './pages/PendingApprovals';
import WaitingApproval from './pages/WaitingApproval';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sites from './pages/Sites';
import Rooms from './pages/Rooms';
import Equipment from './pages/Equipment';
import AccessLogs from './pages/AccessLogs';
import Incidents from './pages/Incidents';
import ChatbotWidget from './components/ChatbotWidget';
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// Composant pour gérer l'affichage conditionnel du chatbot
const ConditionalChatbot = () => {
  const location = useLocation();
  // Ne pas afficher le chatbot sur la page de login et d'attente
  if (location.pathname === '/login' || location.pathname === '/waiting-approval') {
    return null;
  }
  return <ChatbotWidget />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ConditionalChatbot />
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/waiting-approval" element={<WaitingApproval />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/sensors" element={
            <PrivateRoute>
              <Sensors />
            </PrivateRoute>
          } />
          <Route path="/users" element={
            <PrivateRoute>
              <Users />
            </PrivateRoute>
          } />
          <Route path="/pending-approvals" element={
            <PrivateRoute>
              <PendingApprovals />
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/login" />} />
          <Route path="/sites" element={
  <PrivateRoute>
    <Sites />
  </PrivateRoute>
} />
<Route path="/equipment" element={
  <PrivateRoute>
    <Equipment />
  </PrivateRoute>
} />
<Route path="/incidents" element={
  <PrivateRoute>
    <Incidents />
  </PrivateRoute>
} />
<Route path="/rooms" element={
  <PrivateRoute>
    <Rooms />
  </PrivateRoute>
} />
<Route path="/access-logs" element={
  <PrivateRoute>
    <AccessLogs />
  </PrivateRoute>
} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;