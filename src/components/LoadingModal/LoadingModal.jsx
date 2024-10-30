// /SnapLeadAR/src/components/LoadingModal/LoadingModal.jsx
import React from 'react';

const LoadingModal = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
                <p className="mt-4 text-center">Carregando...</p>
            </div>
        </div>
    );
};

export default LoadingModal;
