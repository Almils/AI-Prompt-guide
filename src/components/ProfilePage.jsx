import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [points, setPoints] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching username:', profileError);
          setUsername(session.user.email.split('@')[0]);
        } else {
          setUsername(profileData?.username || session.user.email.split('@')[0]);
        }

        const { data: pointsData, error: pointsError } = await supabase
          .from('user_points')
          .select('points')
          .eq('user_id', session.user.id)
          .single();
        if (pointsError && pointsError.code !== 'PGRST116') {
          console.error('Error fetching points:', pointsError);
        } else {
          setPoints(pointsData?.points || 0);
        }

        const { data: progress, error: progressError } = await supabase
          .from('user_progress')
          .select('lessons (title)')
          .eq('user_id', session.user.id)
          .eq('completed', true);
        if (progressError) {
          console.error('Error fetching progress:', progressError);
        } else {
          setCompletedLessons(progress.map(p => p.lessons.title));
        }

        const { data: badgesData, error: badgesError } = await supabase
          .from('badges')
          .select('badge_name, awarded_at')
          .eq('user_id', session.user.id);
        if (badgesError) {
          console.error('Error fetching badges:', badgesError);
        } else {
          setBadges(badgesData || []);
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  const getLevel = (points) => {
    return Math.floor(points / 100) + 1;
  };

  if (loading) return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen text-white p-4 sm:p-6 md:p-8 flex items-center justify-center"
    >
      <p className="text-xl">Loading...</p>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen text-white p-4 sm:p-6 md:p-8 flex flex-col items-center"
    >
      <h1 className="text-3xl sm:text-4xl md:text-5xl mb-6 text-center text-blue-400 font-bold">Your Profile</h1>
      {user ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-3xl w-full p-6 bg-gray-800 rounded-lg shadow-md no-border"
        >
          <p className="text-xl mb-2 text-white">Username: <span className="text-gray-300">{username}</span></p>
          <p className="text-xl mb-2 text-white">Level: <span className="text-gray-300">{getLevel(points)}</span></p>
          <p className="text-xl mb-2 text-white">Total Points: <span className="text-gray-300">{points}</span></p>
          <p className="text-xl mb-2 text-white">Completed Lessons: <span className="text-gray-300">{completedLessons.length}</span></p>
          {completedLessons.length > 0 && (
            <div className="mt-4">
              <h2 className="text-xl mb-2 text-blue-400 font-bold">Completed Lessons:</h2>
              <ul className="list-disc pl-6 text-gray-300 text-xl">
                {completedLessons.map((title, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                  >
                    {title}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
          {badges.length > 0 && (
            <div className="mt-4">
              <h2 className="text-xl mb-2 text-blue-400 font-bold">Badges:</h2>
              <ul className="list-disc pl-6 text-gray-300 text-xl">
                {badges.map((badge, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                  >
                    {badge.badge_name} (Awarded: {new Date(badge.awarded_at).toLocaleDateString()})
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      ) : (
        <p className="text-center text-gray-300 text-xl">Please log in to view your profile.</p>
      )}
    </motion.div>
  );
};

export default ProfilePage;