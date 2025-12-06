import React from 'react';

interface ModalProps {
    isOpen: boolean;
    title?: string;
    children: React.ReactNode;
}

export default function Modal({ isOpen, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all scale-100 animate-in zoom-in-95 duration-200 border border-gray-700">
                {title && (
                    <h2 className="text-2xl font-bold text-white mb-4 text-center">{title}</h2>
                )}
                <div className="space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
