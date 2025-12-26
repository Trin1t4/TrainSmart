/**
 * FeedList Component
 * Displays the community feed with infinite scroll
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { SocialPost, FeedFilters } from '@trainsmart/shared';
import { getFeed, getFollowingFeed } from '@trainsmart/shared';
import { FeedPost } from './FeedPost';

interface FeedListProps {
  filters?: FeedFilters;
  followingOnly?: boolean;
  userId?: string;
}

export function FeedList({ filters, followingOnly = false, userId }: FeedListProps) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async (pageNum: number, reset: boolean = false) => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = followingOnly
        ? await getFollowingFeed(pageNum, 20)
        : await getFeed(
            filters ? { ...filters, user_ids: userId ? [userId] : filters.user_ids } : undefined,
            pageNum,
            20
          );

      if (result.success && result.data) {
        const newPosts = result.data.posts;
        setPosts(prev => reset ? newPosts : [...prev, ...newPosts]);
        setHasMore(result.data.pagination.has_more);
      } else {
        setError(result.error || 'Errore nel caricamento dei post');
      }
    } catch (err) {
      console.error('Feed load error:', err);
      setError('Errore nel caricamento del feed');
    } finally {
      setIsLoading(false);
    }
  }, [filters, followingOnly, userId, isLoading]);

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    loadPosts(1, true);
  }, [filters, followingOnly, userId]);

  const loadMore = () => {
    if (!hasMore || isLoading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      loadMore();
    }
  };

  if (error && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="text-4xl mb-4">😞</span>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => loadPosts(1, true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Riprova
        </button>
      </div>
    );
  }

  if (!isLoading && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="text-4xl mb-4">📭</span>
        <p className="text-gray-400">
          {followingOnly
            ? 'Nessun post dalle persone che segui. Inizia a seguire altri atleti!'
            : 'Nessun post ancora. Sii il primo a condividere!'}
        </p>
      </div>
    );
  }

  return (
    <div
      className="space-y-4 overflow-y-auto"
      onScroll={handleScroll}
    >
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <FeedPost
            post={post}
            onPostDeleted={handlePostDeleted}
          />
        </motion.div>
      ))}

      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="text-center text-gray-500 py-4">
          Hai visto tutti i post 🎉
        </p>
      )}
    </div>
  );
}

export default FeedList;
