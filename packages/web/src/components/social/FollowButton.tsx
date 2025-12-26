/**
 * FollowButton Component
 * Button to follow/unfollow a user
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { followUser, unfollowUser } from '@trainsmart/shared';

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  variant?: 'default' | 'small' | 'outline';
  className?: string;
}

export function FollowButton({
  userId,
  isFollowing: initialFollowing,
  onFollowChange,
  variant = 'default',
  className = '',
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleClick = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isFollowing) {
        const result = await unfollowUser(userId);
        if (result.success) {
          setIsFollowing(false);
          onFollowChange?.(false);
        }
      } else {
        const result = await followUser(userId);
        if (result.success) {
          setIsFollowing(true);
          onFollowChange?.(true);
        }
      }
    } catch (error) {
      console.error('Follow error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonStyles = () => {
    const baseStyles = 'font-semibold transition-all duration-200 disabled:opacity-50';

    if (variant === 'small') {
      return `${baseStyles} px-3 py-1 text-sm rounded-lg`;
    }

    if (variant === 'outline') {
      if (isFollowing) {
        return `${baseStyles} px-4 py-2 rounded-lg border-2 ${
          isHovering
            ? 'border-red-500 text-red-500 bg-red-500/10'
            : 'border-gray-500 text-gray-300'
        }`;
      }
      return `${baseStyles} px-4 py-2 rounded-lg border-2 border-blue-500 text-blue-500 hover:bg-blue-500/10`;
    }

    // Default variant
    if (isFollowing) {
      return `${baseStyles} px-4 py-2 rounded-lg ${
        isHovering
          ? 'bg-red-600 text-white'
          : 'bg-gray-700 text-white'
      }`;
    }
    return `${baseStyles} px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white`;
  };

  const getButtonText = () => {
    if (isLoading) return '...';
    if (isFollowing) {
      return isHovering ? 'Smetti di seguire' : 'Seguendo';
    }
    return 'Segui';
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      disabled={isLoading}
      className={`${getButtonStyles()} ${className}`}
    >
      {getButtonText()}
    </motion.button>
  );
}

export default FollowButton;
