import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const CommunityPage = () => {
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserAndPrompts = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      const { data: promptsData, error: promptsError } = await supabase
        .from('prompts')
        .select('*, comments(*, profiles(username)), likes(count)')
        .order('created_at', { ascending: false })
        .leftJoin('likes', { on: 'id', select: { count: 'count(*)' } }, { foreignTable: 'prompts' });
      if (promptsError) console.error('Error fetching prompts:', promptsError);
      else setPrompts(promptsData);
    };
    fetchUserAndPrompts();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      fetchUserAndPrompts();
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleCommentSubmit = async (promptId, parentId = null) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!newComment.trim()) return;

    const { error } = await supabase.from('comments').insert({
      prompt_id: promptId,
      parent_id: parentId,
      user_id: user.id,
      content: newComment,
    });
    if (error) console.error('Error submitting comment:', error);
    else {
      setNewComment('');
      setReplyTo(null);
      fetchPrompts();
    }
  };

  const handleLike = async (promptId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const { data: existingLike } = await supabase
      .from('likes')
      .select('*')
      .eq('prompt_id', promptId)
      .eq('user_id', user.id)
      .single();

    if (existingLike) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);
      if (error) console.error('Error unliking:', error);
    } else {
      const { error } = await supabase.from('likes').insert({
        prompt_id: promptId,
        user_id: user.id,
      });
      if (error) console.error('Error liking:', error);
    }
    fetchPrompts();
  };

  const fetchPrompts = async () => {
    const { data } = await supabase
      .from('prompts')
      .select('*, comments(*, profiles(username)), likes(count)')
      .order('created_at', { ascending: false })
      .leftJoin('likes', { on: 'id', select: { count: 'count(*)' } }, { foreignTable: 'prompts' });
    setPrompts(data);
  };

  return (
    <div className="page-content">
      <h1 className="text-2xl sm:text-3xl md:text-4xl text-blue-400 font-medium mb-6">Community</h1>
      {prompts.map((prompt) => {
        const likeCount = prompt.likes?.[0]?.count || 0;
        const isLiked = prompt.likes?.some((like) => like.user_id === user?.id);
        return (
          <div key={prompt.id} className="mb-6 p-4 bg-gray-800 rounded-lg">
            <p className="text-gray-300">{prompt.content}</p>
            <div className="flex space-x-4 mt-2">
              <button
                onClick={() => handleLike(prompt.id)}
                className={`text-yellow-400 hover:text-yellow-500 ${isLiked ? 'font-bold' : ''}`}
              >
                {isLiked ? 'Unlike' : 'Like'} ({likeCount})
              </button>
              <button
                onClick={() => setReplyTo(prompt.id)}
                className="text-blue-400 hover:text-blue-500"
              >
                Reply
              </button>
            </div>
            {/* Comments and Replies */}
            {prompt.comments && prompt.comments.length > 0 && (
              <div className="ml-4 mt-2">
                {prompt.comments.map((comment) => (
                  <div key={comment.id} className="mb-2 p-2 bg-gray-700 rounded">
                    <p className="text-gray-300">
                      <span className="font-medium">{comment.profiles.username}: </span>
                      {comment.content}
                    </p>
                    <button
                      onClick={() => setReplyTo(comment.id)}
                      className="text-blue-400 hover:text-blue-500 mt-1"
                    >
                      Reply
                    </button>
                    {/* Nested Replies */}
                    {comment.comments && comment.comments.length > 0 && (
                      <div className="ml-4 mt-2">
                        {comment.comments.map((nestedComment) => (
                          <div key={nestedComment.id} className="mb-2 p-2 bg-gray-600 rounded">
                            <p className="text-gray-300">
                              <span className="font-medium">
                                {nestedComment.profiles.username}:{' '}
                              </span>
                              {nestedComment.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                replyTo
                  ? `Replying to ${prompts
                      .flatMap((p) => [p, ...p.comments])
                      .find((c) => c.id === replyTo)?.content || 'comment'}...`
                  : 'Add a comment...'
              }
              className="w-full p-2 mt-2 text-gray-900 rounded"
            />
            <button
              onClick={() => handleCommentSubmit(prompt.id, replyTo)}
              className="bg-yellow-400 text-gray-900 px-2 py-1 rounded mt-2"
            >
              Submit
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default CommunityPage;