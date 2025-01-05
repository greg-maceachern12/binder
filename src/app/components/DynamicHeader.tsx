import React from 'react';

interface DynamicHeaderProps {
  title: string;
  imageUrl?: string;
  children: React.ReactNode;
}

const DynamicHeader: React.FC<DynamicHeaderProps> = ({ title, imageUrl, children }) => {
  const fallbackBackground = "bg-gradient-to-br from-orange-50 via-rose-50 to-purple-100";
  
  return (
    <div className="relative">
      <div className={`relative px-6 md:px-8 py-8 md:py-10 ${!imageUrl ? fallbackBackground : ''}`}>
        {imageUrl && (
          <>
            <img
              src={imageUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </>
        )}
        <div className={`relative ${imageUrl ? 'text-white' : 'text-black'}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default DynamicHeader;