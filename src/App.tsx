import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Clients from './views/Clients';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Clients />} />
          {/* Redirect other old paths to the main Clientes view to keep the application bulletproof */}
          <Route path="contacts" element={<Navigate to="/" replace />} />
          <Route path="deals" element={<Navigate to="/" replace />} />
          <Route path="marketing" element={<Navigate to="/" replace />} />
          <Route path="settings" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
