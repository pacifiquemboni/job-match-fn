// src/components/common/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Briefcase, LogOut, MessageSquare, User } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  useEffect(() => {
    if (socket && user) {
      // Listen for new messages
      socket.on('newMessage', () => {
        setUnreadMessageCount(prev => prev + 1);
      });

      // Listen for message read events
      socket.on('messagesRead', () => {
        setUnreadMessageCount(0);
      });

      // Get initial unread count
      socket.emit('getUnreadCount');
      socket.on('unreadCount', (count: number) => {
        setUnreadMessageCount(count);
      });

      return () => {
        socket.off('newMessage');
        socket.off('messagesRead');
        socket.off('unreadCount');
      };
    }
  }, [socket, user]);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-orange-600" />
              <span className="font-bold text-xl text-gray-900">JobMatch</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <>
                <Link to="/messages" className="relative text-gray-700 hover:text-orange-600 transition">
                  <MessageSquare className="h-5 w-5" />
                  {unreadMessageCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                    </span>
                  )}
                </Link>
                
                <NotificationDropdown />

                {/* User Avatar with Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <button className="flex items-center space-x-2">
                    <div className="w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center font-semibold text-sm">
                      {getInitials(user.email)}
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                        <p className="text-xs text-gray-500">{user.role}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {!user && (
              <>
                <Link to="/login" className="text-gray-700 hover:text-orange-600">
                  Login
                </Link>
                <Link to="/register" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};