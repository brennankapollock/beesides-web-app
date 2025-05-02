import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Discover } from './pages/Discover';
import { Album } from './pages/Album';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Search } from './pages/Search';
import { OnboardingFlow } from './pages/OnboardingFlow';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
export function App() {
  return <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/search" element={<Search />} />
          <Route path="/album/:id" element={<Album />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={<PrivateRoute>
                <OnboardingFlow />
              </PrivateRoute>} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/settings" element={<PrivateRoute>
                <Settings />
              </PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>;
}
