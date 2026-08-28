import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

const SYSTEM_ROUTES = new Set(['', '/', '/login', '/signup', '/dashboard', '/404', '/not-found']);

function MainApp() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    const url = new URL(window.location.href);
    setCurrentPath(url.pathname);
    setSearchParams(url.searchParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine which page to render
  const path = currentPath.toLowerCase();

  // Root Homepage
  if (path === '/' || path === '') {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans">
        <Navbar currentPath={currentPath} onNavigate={navigate} />
        <HomePage onNavigate={navigate} />
      </div>
    );
  }

  // Login Page
  if (path === '/login') {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans">
        <Navbar currentPath={currentPath} onNavigate={navigate} />
        <LoginPage onNavigate={navigate} />
      </div>
    );
  }

  // Signup Page
  if (path === '/signup') {
    const requestedUsername = searchParams.get('username') || '';
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans">
        <Navbar currentPath={currentPath} onNavigate={navigate} />
        <SignupPage onNavigate={navigate} initialUsername={requestedUsername} />
      </div>
    );
  }

  // Private Dashboard
  if (path === '/dashboard') {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans">
        <Navbar currentPath={currentPath} onNavigate={navigate} />
        <DashboardPage onNavigate={navigate} />
      </div>
    );
  }

  // Check if it's a single slug public profile like /bhanu or /sarah_design
  const slugMatch = currentPath.match(/^\/([a-zA-Z0-9_]+)\/?$/);
  if (slugMatch && !SYSTEM_ROUTES.has(path)) {
    const rawUsername = slugMatch[1];
    return <PublicProfilePage username={rawUsername} onNavigate={navigate} />;
  }

  // Fallback 404
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans">
      <Navbar currentPath={currentPath} onNavigate={navigate} />
      <NotFoundPage onNavigate={navigate} requestedPath={currentPath} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
