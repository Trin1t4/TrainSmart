/**
 * FeedPost Component
 * Displays a single post in the community feed
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SocialPost, PostComment } from '@trainsmart/shared';
import { likePost, unlikePost, addComment, getComments } from '@trainsmart/shared';

interface FeedPostProps {
  post: SocialPost;
  onPostDeleted?: (postId: string) => void;
  currentUserId?: string;
}

export function FeedPost({ post, onPostDeleted, currentUserId }: FeedPostProps) {
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    try {
      if (isLiked) {
        const result = await unlikePost(post.id);
        if (result.success) {
          setIsLiked(false);
          setLikesCount(result.new_likes_count);
        }
      } else {
        const result = await likePost(post.id);
        if (result.success) {
          setIsLiked(true);
          setLikesCount(result.new_likes_count);
        }
      }
    } catch (error) {
      console.error('Like error:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const loadComments = async () => {
    if (comments.length > 0) {
      setShowComments(!showComments);
      return;
    }

    setIsLoading(true);
    try {
      const result = await getComments(post.id);
      if (result.success && result.data) {
        setComments(result.data);
      }
      setShowComments(true);
    } catch (error) {
      console.error('Load comments error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      const result = await addComment(post.id, newComment.trim());
      if (result.success && result.data) {
        setComments([...comments, result.data]);
        setCommentsCount(result.new_comments_count);
        setNewComment('');
      }
    } catch (error) {
      console.error('Add comment error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'ora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}g`;
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  };

  const getPostIcon = () => {
    switch (post.post_type) {
      case 'workout_completed': return '🏋️';
      case 'pr_achieved': return '🏆';
      case 'streak_milestone': return '🔥';
      case 'achievement_unlocked': return '🎖️';
      default: return '📝';
    }
  };

  const renderMetadata = () => {
    if (!post.metadata) return null;

    switch (post.post_type) {
      case 'workout_completed':
        return (
          <div className="flex gap-4 mt-3 text-sm">
            <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
              {post.metadata.duration_minutes}min
            </div>
            <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">
              {post.metadata.exercises_count} esercizi
            </div>
            {post.metadata.total_volume && (
              <div className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full">
                {(post.metadata.total_volume / 1000).toFixed(1)}t volume
              </div>
            )}
          </div>
        );

      case 'pr_achieved':
        return (
          <div className="mt-3 bg-yellow-500/20 p-3 rounded-lg">
            <div className="text-yellow-400 font-bold text-lg">
              {post.metadata.exercise_name}
            </div>
            <div className="text-white">
              {post.metadata.new_value} {post.metadata.unit}
              {post.metadata.previous_value && (
                <span className="text-gray-400 text-sm ml-2">
                  (prima: {post.metadata.previous_value} {post.metadata.unit})
                </span>
              )}
            </div>
          </div>
        );

      case 'streak_milestone':
        return (
          <div className="mt-3 bg-orange-500/20 p-3 rounded-lg flex items-center gap-3">
            <span className="text-4xl">🔥</span>
            <div>
              <div className="text-orange-400 font-bold text-2xl">
                {post.metadata.streak_days} giorni
              </div>
              <div className="text-gray-300 text-sm">
                di allenamento consecutivo!
              </div>
            </div>
          </div>
        );

      case 'achievement_unlocked':
        return (
          <div className="mt-3 bg-purple-500/20 p-3 rounded-lg flex items-center gap-3">
            <span className="text-4xl">{post.metadata.icon || '🎖️'}</span>
            <div>
              <div className="text-purple-400 font-bold">
                {post.metadata.achievement_name}
              </div>
              <div className="text-gray-300 text-sm">
                {post.metadata.description}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-4 border border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
          {post.user?.avatar_url ? (
            <img
              src={post.user.avatar_url}
              alt={post.user.display_name || post.user.username}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            (post.user?.display_name || post.user?.username || 'U')[0].toUpperCase()
          )}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-white">
            {post.user?.display_name || post.user?.username || 'Utente'}
          </div>
          <div className="text-gray-400 text-sm flex items-center gap-2">
            <span>{getPostIcon()}</span>
            <span>{formatDate(post.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      {post.title && (
        <h3 className="text-white font-semibold text-lg mb-2">{post.title}</h3>
      )}
      {post.content && (
        <p className="text-gray-300">{post.content}</p>
      )}

      {/* Metadata based on post type */}
      {renderMetadata()}

      {/* Image if present */}
      {post.image_url && (
        <div className="mt-3 rounded-lg overflow-hidden">
          <img
            src={post.image_url}
            alt="Post"
            className="w-full h-auto"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-700">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-2 transition-colors ${
            isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
          }`}
        >
          <motion.span
            animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {isLiked ? '❤️' : '🤍'}
          </motion.span>
          <span>{likesCount}</span>
        </button>

        <button
          onClick={loadComments}
          className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
        >
          <span>💬</span>
          <span>{commentsCount}</span>
        </button>

        <button className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors ml-auto">
          <span>📤</span>
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-700"
          >
            {/* Comment Input */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Scrivi un commento..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddComment();
                }}
              />
              <button
                onClick={handleAddComment}
                disabled={isLoading || !newComment.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Invia
              </button>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {comment.user?.avatar_url ? (
                      <img
                        src={comment.user.avatar_url}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      (comment.user?.display_name || comment.user?.username || 'U')[0].toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 bg-gray-700/50 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-semibold">
                        {comment.user?.display_name || comment.user?.username || 'Utente'}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}

              {comments.length === 0 && (
                <p className="text-gray-500 text-center text-sm">
                  Nessun commento ancora. Sii il primo!
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default FeedPost;
