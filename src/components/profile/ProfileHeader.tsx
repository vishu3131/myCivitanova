// Componente Header del profilo

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Edit3, MapPin, Calendar, Users, Award } from 'lucide-react';
import { UserProfile, UserStats } from '@/types/profile';
import { getRoleColor } from '@/utils/profileValidation';

interface ProfileHeaderProps {
  profileUser: UserProfile;
  userStats: UserStats | null;
  onEditProfile: () => void;
  onAvatarClick: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profileUser,
  userStats,
  onEditProfile,
  onAvatarClick
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full blur-3xl" />
      
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          {/* Avatar Section */}
          <div className="relative group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative cursor-pointer"
              onClick={onAvatarClick}
            >
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-1 shadow-2xl">
                <div className="w-full h-full rounded-full bg-gray-900 overflow-hidden">
                  {profileUser.avatar_url && !imageError ? (
                    <img
                      src={profileUser.avatar_url}
                      alt={profileUser.full_name || 'Avatar'}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-4xl lg:text-5xl font-bold text-white">
                      {(profileUser.full_name || profileUser.username || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Camera Overlay */}
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            
            {/* Online Status */}
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-gray-900 shadow-lg" />
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2">
                {/* Name and Username */}
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {profileUser.full_name || 'Nome non disponibile'}
                  </h1>
                  <p className="text-lg text-gray-400">@{profileUser.username || 'username'}</p>
                </div>

                {/* Role Badge */}
                {profileUser.role && (
                  <div className="inline-flex items-center gap-2">
                    <div 
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(profileUser.role)} shadow-lg`}
                    >
                      <Award className="w-4 h-4 inline mr-1" />
                      {profileUser.role.charAt(0).toUpperCase() + profileUser.role.slice(1)}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {profileUser.bio && (
                  <p className="text-gray-300 max-w-2xl leading-relaxed">
                    {profileUser.bio}
                  </p>
                )}

                {/* Location and Join Date */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  {profileUser.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profileUser.location}</span>
                    </div>
                  )}
                  {profileUser.created_at && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Membro dal {new Date(profileUser.created_at).toLocaleDateString('it-IT', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEditProfile}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Edit3 className="w-4 h-4" />
                <span>Modifica Profilo</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        {userStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
              <div className="text-2xl font-bold text-blue-400">{userStats.total_xp || 0}</div>
              <div className="text-sm text-gray-400">XP Totali</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
              <div className="text-2xl font-bold text-purple-400">{userStats.level || 1}</div>
              <div className="text-sm text-gray-400">Livello</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
              <div className="text-2xl font-bold text-pink-400">{userStats.badges_count || 0}</div>
              <div className="text-sm text-gray-400">Badge</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
              <div className="text-2xl font-bold text-green-400">{userStats.events_attended || 0}</div>
              <div className="text-sm text-gray-400">Eventi</div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ProfileHeader;