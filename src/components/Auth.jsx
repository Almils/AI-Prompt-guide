import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isSignUp && !username.trim()) {
      toast.error('Please enter a username.');
      return;
    }

    let error;
    if (isSignUp) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      error = signUpError;
      if (!error && data.user) {
        await supabase.from('profiles').upsert({ id: data.user.id, username });
        toast.success('Sign-up successful! Check your email for verification.');
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      error = signInError;
      if (!error) toast.success('Logged in successfully!');
    }

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        toast.error('Please verify your email before logging in.');
      } else if (error.message.includes('Invalid login credentials')) {
        toast.error('Incorrect email or password. Please try again.');
      } else if (error.message.includes('User not found')) {
        toast.error('No account found with this email. Please sign up.');
      } else {
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen text-white p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center"
    >
      <h1 className="text-3xl sm:text-4xl md:text-5xl mb-6 text-center text-blue-400 font-bold">{isSignUp ? 'Sign Up' : 'Log In'}</h1>
      <form onSubmit={handleAuth} className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-md no-border">
        {isSignUp && (
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full p-3 mb-4 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition text-xl"
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-3 mb-4 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition text-xl"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-3 mb-4 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition text-xl"
        />
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="w-full bg-yellow-400 text-gray-900 px-4 py-2 rounded-md hover:bg-yellow-500 transition text-xl"
        >
          {isSignUp ? 'Sign Up' : 'Log In'}
        </motion.button>
        <p className="mt-4 text-center text-gray-300 text-xl">
          {isSignUp ? 'Already have an account?' : 'Need an account?'}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-400 hover:text-blue-600 text-xl"
          >
            {isSignUp ? 'Log In' : 'Sign Up'}
          </button>
        </p>
      </form>
    </motion.div>
  );
};

export default Auth;