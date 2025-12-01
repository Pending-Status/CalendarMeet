import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContextCognito";
import { UserCircleIcon, BellIcon } from "@heroicons/react/24/outline";
import LoginModal from "./Auth/LoginModal";
import SignupModal from "./Auth/SignupModal";
import UserProfileModal from "./UserProfile/UserProfileModal";
import { useStore } from "../store/useStore";

const Navbar: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = useStore((s) => s.notifications);
  const markNotificationRead = useStore((s) => s.markNotificationRead);
  const clearNotifications = useStore((s) => s.clearNotifications);
  const unreadCount = useStore((s) => s.getUnreadCount());

  const sortedNotifications = [...notifications].sort(
    (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
  );

  return (
    <>
      <nav className="flex justify-between items-center px-8 py-4 bg-gradient-to-r from-green-700 to-yellow-500 text-white shadow-md">
        <Link to="/" className="text-xl font-bold hover:opacity-90 transition">
          CalendarMeet
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/calendar"
            className="bg-white text-green-700 font-semibold px-5 py-2 rounded-full hover:bg-green-50 transition"
          >
            Calendar
          </Link>

          {currentUser ? (
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <button
                className="relative p-2 hover:bg-white/20 rounded-full transition"
                aria-label="Notifications"
                onClick={() => setShowNotifications((prev) => !prev)}
              >
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* User Profile */}
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <UserCircleIcon className="w-8 h-8" />
                )}
                <span className="font-medium">
                  {userProfile?.displayName?.split(' ')[0] || 'Profile'}
                </span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-white/20 hover:bg-white/30 font-semibold px-5 py-2 rounded-full transition"
              >
                Log In
              </button>
              <button
                onClick={() => setShowSignupModal(true)}
                className="bg-white text-green-700 font-semibold px-5 py-2 rounded-full hover:bg-green-50 transition"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
      />

      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
      />

      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {showNotifications && (
        <div
          className="absolute right-6 top-16 bg-white text-black w-80 rounded-xl shadow-xl border border-gray-200 z-50"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <p className="font-semibold text-gray-800">Notifications</p>
              <p className="text-xs text-gray-500">{unreadCount} unread</p>
            </div>
            <button
              onClick={() => clearNotifications()}
              className="text-xs text-green-700 font-semibold hover:underline"
            >
              Clear all
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {sortedNotifications.length === 0 ? (
              <p className="text-sm text-gray-500 px-4 py-6 text-center">No notifications</p>
            ) : (
              sortedNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-gray-100 ${
                    n.read ? "bg-white" : "bg-green-50"
                  }`}
                  onMouseEnter={() => n.id !== undefined && markNotificationRead(n.id)}
                >
                  <p className="text-sm font-semibold text-gray-800">{n.title || "Update"}</p>
                  {n.message && <p className="text-xs text-gray-600 mt-1">{n.message}</p>}
                  {n.createdAt && (
                    <p className="text-[11px] text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
