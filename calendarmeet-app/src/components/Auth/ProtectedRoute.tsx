import React, { useState, ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContextCognito';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-yellow-50 text-gray-700">
        <div className="bg-white shadow-lg rounded-2xl px-6 py-5 border border-green-100">
          Checking your session...
        </div>
      </div>
    );
  }

  if (currentUser) {
    return children;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-yellow-50 px-4">
      <div className="bg-white shadow-2xl rounded-3xl max-w-xl w-full p-10 border border-green-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center">
            🔒
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sign in to continue</h2>
            <p className="text-gray-600">
              Access your calendar, events, and notifications with your account.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setShowLogin(true)}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition"
          >
            Log In
          </button>
          <button
            onClick={() => setShowSignup(true)}
            className="w-full border-2 border-green-200 text-green-700 font-semibold py-3 rounded-xl hover:bg-green-50 transition"
          >
            Create an Account
          </button>
        </div>
      </div>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToSignup={() => {
          setShowLogin(false);
          setShowSignup(true);
        }}
      />

      <SignupModal
        isOpen={showSignup}
        onClose={() => setShowSignup(false)}
        onSwitchToLogin={() => {
          setShowSignup(false);
          setShowLogin(true);
        }}
      />
    </div>
  );
};

export default ProtectedRoute;
