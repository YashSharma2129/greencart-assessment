import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContextProvider';
import { Toaster } from './components/ui/sonner';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Drivers from './pages/Drivers';
import Orders from './pages/Orders';
import RoutesPage from './pages/Routes';
import Simulation from './pages/Simulation';
import CSVUpload from './pages/CSVUpload';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/drivers" 
                element={
                  <PrivateRoute>
                    <Drivers />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/orders" 
                element={
                  <PrivateRoute>
                    <Orders />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/routes" 
                element={
                  <PrivateRoute>
                    <RoutesPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/simulation" 
                element={
                  <PrivateRoute>
                    <Simulation />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/upload-csv" 
                element={
                  <PrivateRoute>
                    <CSVUpload />
                  </PrivateRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster position="top-right" richColors />
      </Router>
    </AuthProvider>
  );
}

export default App;
