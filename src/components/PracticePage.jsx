import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const PracticePage = () => {
  const [prompt, setPrompt] = useState('');
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [aiResponse, setAiResponse] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUser(session.user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  const scorePrompt = (prompt) => {
    let score = 0;
    const feedback = [];

    const isClear = prompt.length > 10 && /[a-zA-Z]/.test(prompt);
    if (isClear) score += 2;
    else feedback.push('Prompt is too short or unclear. Try to be more descriptive.');

    const specificWords = ['specific', 'detail', 'precise', 'for example'];
    const isSpecific = specificWords.some(word => prompt.toLowerCase().includes(word));
    if (isSpecific) score += 2;
    else feedback.push('Add specific details or requirements to make the prompt more targeted.');

    const hasStructure = prompt.includes('.') || prompt.includes(',');
    if (hasStructure) score += 2;
    else feedback.push('Use punctuation to structure your prompt clearly.');

    const contextWords = ['context', 'background', 'purpose', 'audience'];
    const hasContext = contextWords.some(word => prompt.toLowerCase().includes(word));
    if (hasContext) score += 2;
    else feedback.push('Provide context, such as the purpose or intended audience.');

    const hasExamples = prompt.toLowerCase().includes('example');
    if (hasExamples) score += 2;
    else feedback.push('Including examples can improve the AI’s response.');

    return { score, feedback };
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt.');
      return;
    }

    const { score, feedback } = scorePrompt(prompt);
    setScore(score);
    setFeedback(feedback);

    if (user) {
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
      const newPoints = currentPoints + 5;
      const { error: pointsError } = await supabase
        .from('user_points')
        .upsert(
          { user_id: user.id, points: newPoints, updated_at: new Date() },
          { onConflict: ['user_id'] }
        );
      if (pointsError) {
        console.error('Error awarding points:', pointsError);
        toast.error('Failed to update points: ' + pointsError.message);
        return;
      }

      if (score >= 8) {
        const { error: badgeError } = await supabase
          .from('badges')
          .insert({ user_id: user.id, badge_name: 'Prompt Master', awarded_at: new Date() });
        if (badgeError) {
          console.error('Error awarding badge:', badgeError);
        } else {
          toast.success('Congratulations! You earned the "Prompt Master" badge!');
        }
      }

      toast.success(`Prompt scored: ${score}/10. +5 points for submitting!`);
    }
  };

  const handleTestAI = async () => {
    toast('AI integration is temporarily disabled. Please try again later.');
    setAiResponse('');
    setAiLoading(false);
  };

  if (loading) return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen text-white p-4 sm:p-6 md:p-8 flex items-center justify-center bg-gray-900"
    >
      Loading...
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen text-white p-4 sm:p-6 md:p-8 bg-gray-900 fade-in"
    >
      <h1 className="text-2xl sm:text-3xl md:text-4xl mb-6 text-center text-blue-400 font-bold">Practice Your Prompts</h1>
      <motion.textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Write your prompt here (e.g., 'Explain AI in simple terms for beginners, with examples.')"
        className="w-full h-32 p-3 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition"
        whileFocus={{ scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      />
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-4">
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          Score My Prompt
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleTestAI}
          className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition"
          disabled={aiLoading}
        >
          {aiLoading ? 'Testing...' : 'Test with AI'}
        </motion.button>
      </div>
      {score !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6 p-4 bg-gray-800 rounded-lg shadow-md no-border"
        >
          <p className="text-xl sm:text-2xl text-blue-400 font-bold">Your prompt scored: {score}/10</p>
          {feedback.length > 0 && (
            <div>
              <h2 className="text-lg sm:text-xl mt-2 text-blue-400 font-bold">Feedback:</h2>
              <ul className="list-disc pl-6 text-gray-300">
                {feedback.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                  >
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
      {aiResponse && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6 p-4 bg-gray-800 rounded-lg shadow-md no-border"
        >
          <h2 className="text-lg sm:text-xl text-blue-400 font-bold">AI Response:</h2>
          <p className="text-gray-300">{aiResponse}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PracticePage;