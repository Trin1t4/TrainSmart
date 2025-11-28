import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Menu, Bell, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  showMenu?: boolean;
  showNotifications?: boolean;
  showProfile?: boolean;
  onMenuClick?: () => void;
  rightContent?: React.ReactNode;
  transparent?: boolean;
}

export default function MobileHeader({
  title,
  showBack = false,
  showMenu = false,
  showNotifications = false,
  showProfile = false,
  onMenuClick,
  rightContent,
  transparent = false
}: MobileHeaderProps) {
  const navigate = useNavigate();
  const [hasNotifications] = useState(false); // TODO: Connect to notifications

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 safe-area-top ${
        transparent
          ? 'bg-transparent'
          : 'bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50'
      }`}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left side */}
        <div className="flex items-center gap-2 min-w-[48px]">
          {showBack && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
          )}
          {showMenu && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onMenuClick}
              className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </motion.button>
          )}
        </div>

        {/* Title */}
        {title && (
          <h1 className="text-lg font-display font-bold text-white truncate max-w-[200px]">
            {title}
          </h1>
        )}

        {/* Right side */}
        <div className="flex items-center gap-1 min-w-[48px] justify-end">
          {rightContent}

          {showNotifications && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {hasNotifications && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </motion.button>
          )}

          {showProfile && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/profile')}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              <User className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}
