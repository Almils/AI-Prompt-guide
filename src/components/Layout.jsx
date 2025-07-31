import { motion } from 'framer-motion';
import Navigation from './Navigation';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen text-white bg-gray-900">
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-4 flex items-center justify-center shadow-md no-border"
      >
        <motion.img
          src="/logo.png"
          alt="AI Prompt Guide Logo"
          className="h-12 mr-4"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        />
        <h1 className="text-xl sm:text-2xl font-bold text-blue-400">AI Prompt Guide</h1>
      </motion.header>
      <Navigation />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-4 sm:p-6 md:p-8"
      >
        {children}
      </motion.main>
    </div>
  );
};

export default Layout;