import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');

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
          setUsername(session.user.email.split('@')[0]);
        } else {
          setUsername(data?.username || session.user.email.split('@')[0]);
        }
      }
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      fetchUser();
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen text-white p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center"
    >
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl sm:text-4xl md:text-5xl mb-6 text-center text-blue-400 font-bold"
      >
        {user ? `Welcome, ${username}!` : 'Welcome to AI Prompt Guide'}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-xl sm:text-2xl text-center text-gray-300 mb-8"
      >
        Explore lessons, practice prompts, and join our community to master AI prompting!
      </motion.p>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-md hover:bg-yellow-500 transition text-xl"
        >
          <Link to="/lessons">Start Learning</Link>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition text-xl"
        >
          <Link to="/practice">Practice Prompts</Link>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition text-xl"
        >
          <Link to="/community">Join Community</Link>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default HomePage;