import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Briefcase, Tag, Edit2, Save, X } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState({
    skills: user?.workerProfile?.skills || [],
    bio: user?.workerProfile?.bio || '',
  });

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const handleAddSkill = () => {
    const skill = tagInput.trim().toLowerCase();
    if (skill && !formData.skills.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
      setTagInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSaveChanges = () => {
    // TODO: Save profile changes to backend
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      skills: user?.workerProfile?.skills || [],
      bio: user?.workerProfile?.bio || '',
    });
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        {user.role === 'WORKER' && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-primary-600 px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-white text-primary-600 flex items-center justify-center font-bold text-3xl">
              {getInitials(user.email)}
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-semibold">{user.email}</h2>
              <span className="inline-block mt-1 px-3 py-1 bg-white/20 rounded-full text-sm">
                {user.role === 'CLIENT' ? 'Client (Job Poster)' : 'Worker (Job Seeker)'}
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Briefcase className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Account Type</p>
              <p className="font-medium text-gray-900">
                {user.role === 'CLIENT' ? 'Client (Job Poster)' : 'Worker (Job Seeker)'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="font-medium text-gray-900">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Worker Profile - Editable Section */}
          {user.role === 'WORKER' && (
            <>
              {/* Bio Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Bio</h3>
                </div>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    placeholder="Tell clients about yourself..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-700">
                    {formData.bio || (
                      <span className="text-gray-400 italic">No bio yet. Click Edit Profile to add one.</span>
                    )}
                  </p>
                )}
              </div>

              {/* Skills Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <Tag className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Skills</h3>
                      <p className="text-xs text-gray-500 mt-1">Add skills to match with relevant jobs</p>
                    </div>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g., React, NodeJS, Python"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleAddSkill}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                        >
                          {skill}
                          <button
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-2 text-primary-600 hover:text-primary-800"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.length > 0 ? (
                      formData.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm italic">No skills added yet</span>
                    )}
                  </div>
                )}
              </div>

              {/* Edit Mode Actions */}
              {isEditing && (
                <div className="border-t border-gray-200 pt-6 flex gap-3">
                  <button
                    onClick={handleSaveChanges}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};