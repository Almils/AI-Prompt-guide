import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(isSignUp ? 'Sign-up successful!' : 'Logged in successfully!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen text-white p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center bg-gray-900 fade-in"
    >
      <h1 className="text-2xl sm:text-3xl md:text-4xl mb-6 text-center text-blue-400 font-bold">{isSignUp ? 'Sign Up' : 'Log In'}</h1>
      <form onSubmit={handleAuth} className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-md no-border">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-3 mb-4 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-3 mb-4 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          {isSignUp ? 'Sign Up' : 'Log In'}
        </motion.button>
        <p className="mt-4 text-center text-gray-300">
          {isSignUp ? 'Already have an account?' : 'Need an account?'}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-400 hover:text-blue-600"
          >
            {isSignUp ? 'Log In' : 'Sign Up'}
          </button>
        </p>
      </form>
    </motion.div>
  );
};

export default Auth;