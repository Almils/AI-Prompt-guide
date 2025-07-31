import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const CommunityPage = () => {
  const [prompts, setPrompts] = useState([]);
  const [newPrompt, setNewPrompt] = useState('');
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndPrompts = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();
        setUser({ ...session.user, username: profileData?.username || session.user.email });
      }

      const { data: promptsData, error: promptsError } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false });
      if (promptsError) {
        console.error('Error fetching prompts:', promptsError);
        toast.error('Failed to load prompts: ' + promptsError.message);
      } else {
        setPrompts(promptsData);
      }

      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: true });
      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
        toast.error('Failed to load comments: ' + commentsError.message);
      } else {
        const commentsByPrompt = commentsData.reduce((acc, comment) => {
          acc[comment.prompt_id] = acc[comment.prompt_id] || [];
          acc[comment.prompt_id].push(comment);
          return acc;
        }, {});
        setComments(commentsByPrompt);
      }
      setLoading(false);
    };
    fetchUserAndPrompts();
  }, []);

  const handleSubmitPrompt = async () => {
    if (!user) {
      toast.error('Please log in to post a prompt.');
      return;
    }
    if (!newPrompt.trim()) {
      toast.error('Please enter a prompt.');
      return;
    }

    const { data, error } = await supabase
      .from('prompts')
      .insert({ user_id: user.id, username: user.username, content: newPrompt })
      .select();
    if (error) {
      console.error('Error posting prompt:', error);
      toast.error('Failed to post prompt: ' + error.message);
    } else {
      setPrompts([data[0], ...prompts]);
      setNewPrompt('');
      toast.success('Prompt posted successfully!');
    }
  };

  const handleSubmitComment = async (promptId) => {
    if (!user) {
      toast.error('Please log in to comment.');
      return;
    }
    if (!newComment[promptId]?.trim()) {
      toast.error('Please enter a comment.');
      return;
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        prompt_id: promptId,
        user_id: user.id,
        username: user.username,
        content: newComment[promptId],
      })
      .select();
    if (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment: ' + error.message);
    } else {
      setComments({
        ...comments,
        [promptId]: [...(comments[promptId] || []), data[0]],
      });
      setNewComment({ ...newComment, [promptId]: '' });
      toast.success('Comment posted successfully!');
    }
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
      <h1 className="text-2xl sm:text-3xl md:text-4xl mb-6 text-center text-blue-400 font-bold">Community Forum</h1>
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 p-4 bg-gray-800 rounded-lg shadow-md no-border"
        >
          <textarea
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            placeholder="Share a prompt..."
            className="w-full h-24 p-3 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition"
          />
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmitPrompt}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Post Prompt
          </motion.button>
        </motion.div>
      )}
      <div className="space-y-6">
        {prompts.map((prompt) => (
          <motion.div
            key={prompt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: prompt.id * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="p-6 bg-gray-800 rounded-lg shadow-md no-border"
          >
            <p className="text-lg sm:text-xl text-white"><strong>{prompt.username}</strong>: {prompt.content}</p>
            <p className="text-sm text-gray-400 mt-1">
              Posted: {new Date(prompt.created_at).toLocaleString()}
            </p>
            <div className="mt-4">
              <h3 className="text-md sm:text-lg text-blue-400 font-bold">Comments:</h3>
              {(comments[prompt.id] || []).map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-4 mt-2 p-3 bg-gray-700 rounded-md no-border"
                >
                  <p className="text-sm sm:text-base text-white"><strong>{comment.username}</strong>: {comment.content}</p>
                  <p className="text-xs text-gray-400">
                    Posted: {new Date(comment.created_at).toLocaleString()}
                  </p>
                </motion.div>
              ))}
              {user && (
                <div className="mt-4 ml-4">
                  <textarea
                    value={newComment[prompt.id] || ''}
                    onChange={(e) =>
                      setNewComment({ ...newComment, [prompt.id]: e.target.value })
                    }
                    placeholder="Add a comment..."
                    className="w-full h-16 p-3 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSubmitComment(prompt.id)}
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                  >
                    Post Comment
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default CommunityPage;