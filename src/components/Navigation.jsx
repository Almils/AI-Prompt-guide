import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Navigation = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching username:', error);
          setUsername(session.user.email);
        } else {
          setUsername(data?.username || session.user.email);
        }
      } else {
        setUser(null);
        setUsername('');
      }
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      fetchUser();
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="bg-gray-800 p-4 shadow-md no-border">
      <div className="flex justify-between items-center">
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? 'Close' : 'Menu'}
        </button>
        <ul className={`flex-col md:flex-row md:flex md:space-x-6 ${isMenuOpen ? 'flex' : 'hidden'} md:block`}>
          <li>
            <Link to="/" className="text-white hover:text-blue-400 transition block py-2">Home</Link>
          </li>
          <li>
            <Link to="/lessons" className="text-white hover:text-blue-400 transition block py-2">Lessons</Link>
          </li>
          <li>
            <Link to="/practice" className="text-white hover:text-blue-400 transition block py-2">Practice</Link>
          </li>
          <li>
            <Link to="/community" className="text-white hover:text-blue-400 transition block py-2">Community</Link>
          </li>
          <li>
            <Link to="/profile" className="text-white hover:text-blue-400 transition block py-2">Profile</Link>
          </li>
          <li>
            <Link to="/about" className="text-white hover:text-blue-400 transition block py-2">About</Link>
          </li>
        </ul>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-white text-sm">Signed in as {username}</span>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition"
              >
                Logout
              </motion.button>
            </>
          ) : (
            <Link to="/" className="text-white hover:text-blue-400 transition">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;