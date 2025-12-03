
import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Developers } from './pages/Developers';
import { Sales } from './pages/Sales';
import { Agreements } from './pages/Agreements';
import { Finance } from './pages/Finance';
import { Agents } from './pages/Agents';
import { Commissions } from './pages/Commissions';
import { Clients } from './pages/Clients';
import { Admin } from './pages/Admin';
import { Reports } from './pages/Reports';
import { Stands } from './pages/Stands';
import { Login } from './pages/Login';
import { Installments } from './pages/Installments';

const AppContent: React.FC = () => {
  const { currentPath, isAuthenticated } = useApp();

  if (!isAuthenticated) {
      return <Login />;
  }

  let content;
  switch (currentPath) {
    case '/': content = <Dashboard />; break;
    case '/developers': content = <Developers />; break;
    case '/stands': content = <Stands />; break;
    case '/clients': content = <Clients />; break;
    case '/sales': content = <Sales />; break;
    case '/agreements': content = <Agreements />; break;
    case '/commissions': content = <Commissions />; break;
    case '/finance': content = <Finance />; break;
    case '/installments': content = <Installments />; break;
    case '/reports': content = <Reports />; break;
    case '/agents': content = <Agents />; break;
    case '/admin': content = <Admin />; break;
    default: content = <Dashboard />;
  }

  return (
    <Layout>
      {content}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
