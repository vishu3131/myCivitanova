import React from 'react';
import Image from 'next/image';
import { BadgeList } from './BadgeList';

export interface PublicProfileProps {
  user: {
    avatar_url?: string;
    full_name?: string;
    username?: string;
    bio?: string;
    badges?: Array<{ badge_name: string; date_unlocked: string }>;
    theme?: any;
    city?: string;
    interests?: string[];
  };
  isFollowing?: boolean;
  onFollow?: () => void;
}

export const PublicProfile: React.FC<PublicProfileProps> = ({ user, isFollowing, onFollow }) => {
  return (
    <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-xl p-6 shadow-xl max-w-lg mx-auto">
      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          <Image
            src={user.avatar_url || 'https://ui-avatars.com/api/?name=' + (user.full_name || 'User')}
            alt="Avatar"
            width={112}
            height={112}
            className="rounded-full border-4 border-blue-500 shadow-lg"
            style={{ borderColor: user.theme?.borderColor || '#3b82f6' }}
          />
        </div>
        <h2 className="text-3xl font-bold text-white mb-1">{user.full_name}</h2>
        <span className="text-blue-300 text-md mb-2">@{user.username}</span>
        <p className="text-gray-300 text-center mb-2">{user.bio}</p>
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {user.interests && user.interests.map((interest, idx) => (
            <span key={idx} className="bg-blue-700 text-white px-2 py-1 rounded-full text-xs">{interest}</span>
          ))}
        </div>
        <div className="mb-4">
          <BadgeList badges={user.badges || []} />
        </div>
        <button
          className={`mt-2 px-4 py-2 rounded-full font-bold transition-all ${isFollowing ? 'bg-gray-700 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
          onClick={onFollow}
        >
          {isFollowing ? 'Segui già' : 'Segui'}
        </button>
      </div>
    </div>
  );
};
