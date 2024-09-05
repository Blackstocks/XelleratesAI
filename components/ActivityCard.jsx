'use client';
import React from 'react';
import Card from '@/components/ui/Card';

const ActivityCard = ({ title, imageSrc, onClick }) => {
  return (
    <Card className="w-64 h-64 flex flex-col items-center justify-center bg-white">
      {/* Card Image */}
      <div className="flex justify-center mb-4" onClick={onClick}>
        <img src={imageSrc} alt={title} className="h-24 w-auto object-cover" />
      </div>

      {/* Card Title */}
      <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
    </Card>
  );
};

export default ActivityCard;
