import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Auth from './components/Auth';
import HomePage from './components/HomePage';
import LessonsPage from './components/LessonsPage';
import PracticePage from './components/PracticePage';
import CommunityPage from './components/CommunityPage';
import ProfilePage from './components/ProfilePage';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Layout>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { background: '#334155', color: '#FFFFFF', border: 'none' }
          }}
        />
        <Routes>
          <Route
            path="/"
            element={user ? <HomePage /> : <Auth />}
          />
          <Route path="/lessons" element={<ProtectedRoute><LessonsPage /></ProtectedRoute>} />
          <Route path="/practice" element={<ProtectedRoute><PracticePage /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/about" element={<div className="min-h-screen text-white p-4 sm:p-6 md:p-8 bg-gray-900 fade-in">About Page</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;