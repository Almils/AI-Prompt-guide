import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useState, useEffect } from 'react';
import { FaHome, FaBook, FaPen, FaUsers, FaUser, FaInfoCircle, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const Navigation = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Navigation useEffect triggered');
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        console.log('Fetching session...');
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          if (session) {
            setUser(session.user);
            console.log('User authenticated:', session.user);
            const { data, error: profileError } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', session.user.id)
              .single();
            if (profileError) {
              console.error('Profile fetch error:', profileError.message);
              setUsername(session.user.email.split('@')[0]);
            } else {
              setUsername(data?.username || session.user.email.split('@')[0]);
            }
          } else {
            setUser(null);
            setUsername('');
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err.message);
        if (isMounted) {
          setError('Authentication failed. Using default navigation.');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      if (isMounted) initializeAuth();
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      setIsMenuOpen(false);
      setUser(null);
      setUsername('');
    } catch (err) {
      console.error('Logout error:', err.message);
      setError('Logout failed');
    }
  };

  if (loading) {
    return (
      <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 py-3">
        <div className="container mx-auto max-w-4xl px-4 text-center text-gray-300">Loading...</div>
      </nav>
    );
  }

  if (error) {
    return (
      <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 py-3">
        <div className="container mx-auto max-w-4xl px-4 text-center text-red-400">{error}</div>
      </nav>
    );
  }

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 py-3 shadow-md">
      <div className="container mx-auto max-w-4xl px-4 flex flex-col md:flex-row justify-between items-center">
        {/* Header Section */}
        <div className="flex items-center space-x-4 mb-2 md:mb-0">
          <div className="text-gray-300 text-lg font-medium">{username ? `Hi, ${username}` : 'Guest'}</div>
        </div>

        {/* Menu Toggle and Navigation */}
        <div className="flex items-center space-x-4">
          <button
            className="md:hidden text-white text-2xl focus:outline-none"
            onClick={() => {
              console.log('Menu toggle clicked, isMenuOpen:', !isMenuOpen);
              setIsMenuOpen(!isMenuOpen);
            }}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          <ul
            className={`${
              isMenuOpen ? 'block' : 'hidden'
            } md:flex md:space-x-6 items-center mt-2 md:mt-0 w-full md:w-auto`}
          >
            <li>
              <Link
                to="/"
                className="flex items-center space-x-2 text-gray-300 hover:text-yellow-400 no-underline py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaHome className="text-yellow-400" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link
                to="/lessons"
                className="flex items-center space-x-2 text-gray-300 hover:text-yellow-400 no-underline py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaBook className="text-yellow-400" />
                <span>Lessons</span>
              </Link>
            </li>
            <li>
              <Link
                to="/practice"
                className="flex items-center space-x-2 text-gray-300 hover:text-yellow-400 no-underline py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaPen className="text-yellow-400" />
                <span>Practice</span>
              </Link>
            </li>
            <li>
              <Link
                to="/community"
                className="flex items-center space-x-2 text-gray-300 hover:text-yellow-400 no-underline py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaUsers className="text-yellow-400" />
                <span>Community</span>
              </Link>
            </li>
            <li>
              <Link
                to="/profile"
                className="flex items-center space-x-2 text-gray-300 hover:text-yellow-400 no-underline py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaUser className="text-yellow-400" />
                <span>Profile</span>
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="flex items-center space-x-2 text-gray-300 hover:text-yellow-400 no-underline py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaInfoCircle className="text-yellow-400" />
                <span>About</span>
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-yellow-400 text-gray-900 px-3 py-1 rounded hover:bg-yellow-500 no-underline mt-2 md:mt-0"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;