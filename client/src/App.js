import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sensors from './pages/Sensors';
import Users from './pages/Users';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sites from './pages/Sites';
import Rooms from './pages/Rooms';
import Equipment from './pages/Equipment';
import AccessLogs from './pages/AccessLogs';
import Incidents from './pages/Incidents';
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/login" element={<Login />} />
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