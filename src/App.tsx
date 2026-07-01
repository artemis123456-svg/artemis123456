import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Clients from './views/Clients';
import Obras from './views/Obras';
import Proveedores from './views/Proveedores';
import Productos from './views/Productos';
import Facturas from './views/Facturas';
import FacturasProveedor from './views/FacturasProveedor';
import Impuestos from './views/Impuestos';
import Login from './views/Login';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { session, isAuthorized, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
          <span className="text-xs font-semibold text-slate-500">Cargando Verini CRM...</span>
        </div>
      </div>
    );
  }

  if (!session || !isAuthorized) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Clients />} />
          <Route path="obras" element={<Obras />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="productos" element={<Productos />} />
          <Route path="facturas" element={<Facturas />} />
          <Route path="facturas-proveedor" element={<FacturasProveedor />} />
          <Route path="impuestos" element={<Impuestos />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
