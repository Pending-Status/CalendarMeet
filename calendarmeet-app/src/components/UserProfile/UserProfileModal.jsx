import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContextCognito';
import toast from 'react-hot-toast';
import { UserCircleIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline';

const UserProfileModal = ({ isOpen, onClose }) => {
  const { currentUser, userProfile, updateUserProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || '',
    major: userProfile?.major || '',
    year: userProfile?.year || '',
    bio: userProfile?.bio || '',
    interests: userProfile?.interests || []
  });

  if (!isOpen || !currentUser) return null;

  const interestOptions = [
    'Studying', 'Basketball', 'Soccer', 'Tennis', 'Gaming',
    'Art', 'Music', 'Cooking', 'Photography', 'Hiking',
    'Programming', 'Anime', 'Movies', 'Reading'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSave = async () => {
    try {
      await updateUserProfile(formData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
          aria-label="Close"
        >
          ×
        </button>

        <div className="flex items-center gap-4 mb-6">
          {currentUser.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt="Profile"
              className="w-20 h-20 rounded-full"
            />
          ) : (
            <UserCircleIcon className="w-20 h-20 text-gray-400" />
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {userProfile?.displayName || 'User Profile'}
            </h2>
            <p className="text-gray-600">{currentUser.email}</p>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Major
                </label>
                <input
                  type="text"
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Year
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="">Select year</option>
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Interests
              </label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                      formData.interests.includes(interest)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <CheckIcon className="w-5 h-5" />
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    displayName: userProfile?.displayName || '',
                    major: userProfile?.major || '',
                    year: userProfile?.year || '',
                    bio: userProfile?.bio || '',
                    interests: userProfile?.interests || []
                  });
                }}
                className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Major</h3>
              <p className="text-gray-800">{userProfile?.major || 'Not set'}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Year</h3>
              <p className="text-gray-800">{userProfile?.year || 'Not set'}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Bio</h3>
              <p className="text-gray-800">{userProfile?.bio || 'No bio yet'}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {userProfile?.interests && userProfile.interests.length > 0 ? (
                  userProfile.interests.map(interest => (
                    <span
                      key={interest}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No interests set</p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Stats</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {userProfile?.eventsCreated?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Events Created</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {userProfile?.eventsAttending?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Events Attending</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {userProfile?.friends?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Friends</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <PencilIcon className="w-5 h-5" />
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition"
              >
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;
