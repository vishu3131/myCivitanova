import React, { useState } from 'react';
import { User } from 'lucide-react';
import { PrivacyToggle } from './PrivacyToggle';
import { BadgeList } from './BadgeList';

export interface ProfileCardProps {
  user: {
    avatar_url?: string;
    full_name?: string;
    username?: string;
    bio?: string;
    email?: string;
    phone?: string;
    birthdate?: string;
    city?: string;
    role?: string;
    is_public_email?: boolean;
    is_public_phone?: boolean;
    is_public_birthdate?: boolean;
    xp?: number;
    level?: number;
    theme?: any;
    badges?: Array<{ badge_name: string; date_unlocked: string }>;
  };
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  return (
    <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-6 shadow-lg max-w-md mx-auto">
      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          <img
            src={user.avatar_url || 'https://ui-avatars.com/api/?name=' + (user.full_name || 'User')}
            alt="Avatar"
            className="w-24 h-24 rounded-full border-4 border-purple-500 shadow-lg"
          />
          {/* Cornice animata e badge livello */}
          <span className="absolute bottom-0 right-0 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold animate-pulse">
            Livello {user.level || 1}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">{user.full_name}</h2>
        <span className="text-purple-300 text-sm mb-2">@{user.username}</span>
        <p className="text-gray-300 text-center mb-2">{user.bio}</p>
        <div className="flex flex-col gap-1 w-full items-center">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Email:</span>
            <span>{user.is_public_email ? user.email : <PrivacyToggle />}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Telefono:</span>
            <span>{user.is_public_phone ? user.phone : <PrivacyToggle />}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Data di nascita:</span>
            <span>{user.is_public_birthdate ? user.birthdate : <PrivacyToggle />}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Città:</span>
            <span>{user.city}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Ruolo:</span>
            <span>{user.role}</span>
          </div>
        </div>
        <div className="w-full mt-4">
          <BadgeList badges={user.badges || []} />
        </div>
      </div>
    </div>
  );
};
