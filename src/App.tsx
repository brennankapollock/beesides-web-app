import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Discover } from './pages/Discover';
import { Album } from './pages/Album';
import { Profile } from './pages/Profile';
export function App() {
  return <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/album/:id" element={<Album />} />
        <Route path="/profile/:username" element={<Profile />} />
      </Routes>
    </BrowserRouter>;
}