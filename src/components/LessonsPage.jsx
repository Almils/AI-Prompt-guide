import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const LessonsPage = () => {
  const [lessons, setLessons] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserAndLessons = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('lesson_id')
        .eq('user_id', session.user.id)
        .eq('completed', true);
      if (progressError) {
        console.error('Error fetching progress:', progressError);
        toast.error('Failed to load progress: ' + progressError.message);
      } else {
        setCompletedLessons(progress.map(p => p.lesson_id));
      }
    }

    const { data, error } = await supabase.from('lessons').select('*');
    if (error) {
      console.error('Error fetching lessons:', error);
      toast.error('Failed to load lessons: ' + error.message);
    } else {
      setLessons(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserAndLessons();
  }, []);

  const markAsCompleted = async (lessonId) => {
    if (!user) {
      toast.error('Please log in to mark lessons as completed.');
      return;
    }

    const { data: existingProgress } = await supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .eq('completed', true)
      .single();
    if (existingProgress) {
      toast('Lesson already completed.');
      return;
    }

    const { error: progressError } = await supabase
      .from('user_progress')
      .insert({ user_id: user.id, lesson_id: lessonId, completed: true, completed_at: new Date() });
    if (progressError) {
      console.error('Error marking lesson as completed:', progressError);
      toast.error('Failed to mark lesson as completed: ' + progressError.message);
      return;
    }

    const { data: pointsData, error: fetchError } = await supabase
      .from('user_points')
      .select('points')
      .eq('user_id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching points:', fetchError);
      toast.error('Failed to update points: ' + fetchError.message);
      return;
    }

    const currentPoints = pointsData?.points || 0;
    const { error: pointsError } = await supabase
      .from('user_points')
      .upsert(
        { user_id: user.id, points: currentPoints + 10, updated_at: new Date() },
        { onConflict: ['user_id'] }
      );
    if (pointsError) {
      console.error('Error awarding points:', pointsError);
      toast.error('Failed to update points: ' + pointsError.message);
    } else {
      setCompletedLessons(prev => [...prev, lessonId]);
      toast.success('Lesson marked as completed! +10 points');
    }
  };

  const progressPercentage = lessons.length ? (completedLessons.length / lessons.length) * 100 : 0;

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
      <h1 className="text-3xl sm:text-4xl md:text-5xl mb-4 text-center text-blue-400 font-bold">Lessons</h1>
      <div className="mb-6 max-w-md w-full">
        <p className="text-xl text-center text-gray-300 mb-2">Progress: {completedLessons.length}/{lessons.length}</p>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <motion.div
            className="bg-blue-500 h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {lessons.map((lesson) => (
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: lesson.id * 0.1 }}
            whileHover={{ scale: 1.03 }}
            className="p-6 bg-gray-800 rounded-lg shadow-md no-border"
          >
            <h2 className="text-2xl mb-2 text-blue-400 font-bold">{lesson.title}</h2>
            <p className="text-xl text-gray-300 mb-4">{lesson.content}</p>
            {completedLessons.includes(lesson.id) ? (
              <span className="text-green-400 font-semibold text-xl">Completed</span>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => markAsCompleted(lesson.id)}
                className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-md hover:bg-yellow-500 transition text-xl"
              >
                Mark as Completed
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default LessonsPage;