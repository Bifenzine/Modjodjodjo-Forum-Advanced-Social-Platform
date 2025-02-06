import React, { useEffect, useRef } from 'react';

const DropDownCrudProfil = ({ isOpen, onClose }) => {
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
          
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                   drop
                </button>
            
        </div>
    );
};

export default DropDownCrudProfil;
