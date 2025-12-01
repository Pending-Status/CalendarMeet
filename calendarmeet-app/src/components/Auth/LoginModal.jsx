import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContextCognito';
import toast from 'react-hot-toast';

const LoginModal = ({ isOpen, onClose, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login'); // login | reset
  const { signin, signInWithGoogle, resetPassword } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === 'login') {
      if (!email || !password) {
        toast.error('Please fill in all fields');
        return;
      }

      setLoading(true);
      try {
        await signin(email, password);
        toast.success('Welcome back!');
        onClose();
      } catch (error) {
        console.error('Login error:', error);
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          toast.error('Invalid email or password');
        } else if (error.code === 'auth/too-many-requests') {
          toast.error('Too many attempts. Please try again later');
        } else {
          toast.error('Failed to log in. Please try again');
        }
      } finally {
        setLoading(false);
      }
    } else {
      if (!email) {
        toast.error('Enter your email to reset password');
        return;
      }
      setLoading(true);
      try {
        await resetPassword(email);
        toast.success('Reset link sent. Check your inbox.');
        setMode('login');
      } catch (error) {
        console.error('Reset error:', error);
        toast.error('Failed to send reset email');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Welcome back!');
      onClose();
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-3xl font-bold text-green-700 mb-2">Welcome Back</h2>
        <p className="text-gray-600 mb-6">Log in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="you@cpp.edu"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <div className="flex justify-between items-center text-sm text-green-700">
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'reset' : 'login')}
              className="font-semibold hover:text-green-800"
              disabled={loading}
            >
              {mode === 'login' ? 'Forgot password?' : 'Back to login'}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mode === 'login' ? (loading ? 'Logging in...' : 'Log In') : (loading ? 'Sending...' : 'Send reset link')}
          </button>
        </form>

        {mode === 'login' && (
          <>
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-gray-500 text-sm">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </>
        )}

        <p className="mt-6 text-center text-gray-600 text-sm">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-green-600 font-semibold hover:text-green-700"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
