import React, { useState } from 'react';

const PostCreateLoginRequiredModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-pink-100 rounded-lg p-6 text-center max-w-md w-full shadow-lg border-2 border-pink-300">
        <h2 className="text-pink-800 text-2xl font-bold mb-4">Attenzione</h2>
        <p className="text-pink-600 mb-6">Effettua il login per utilizzare questa funzionalità</p>
        <button 
          onClick={onClose}
          className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded transition duration-300"
        >
          Chiudi
        </button>
      </div>
    </div>
  );
};

export default PostCreateLoginRequiredModal;