'use client';
import React from 'react';
import Card from '@/components/ui/Card';

const ActivityCard = ({ title, imageSrc, activities }) => {
  return (
    <Card>
      {/* Card Image */}
      <div className="flex justify-center mb-4">
        <img src={imageSrc} alt={title} className="h-32 w-auto object-cover" />
      </div>

      {/* Card Title */}
      <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>

      {/* Recent Activities Section */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">Recent Activity</span>
          <a href="#" className="text-blue-500 text-sm">View All</a>
        </div>
        <ul className="space-y-3">
          {activities.map((activity, index) => (
            <li key={index} className="flex items-start space-x-3 text-sm">
              {/* Colored Dot */}
              <span className={`inline-block w-2 h-2 rounded-full mt-1.5 ${
                index === 0
                  ? 'bg-blue-500'
                  : index === 1
                  ? 'bg-purple-500'
                  : index === 2
                  ? 'bg-red-500'
                  : index === 3
                  ? 'bg-orange-500'
                  : 'bg-green-500'
              }`}></span>
              
              {/* Activity Details */}
              <div>
                <span className="block text-xs text-gray-500">{activity.time}</span>
                <span className="font-semibold">{activity.user}</span>
                <span className="block">
                  {activity.description.split(' ').map((word, i) => (
                    word.startsWith('#') || word.startsWith('Widget') ? (
                      <a key={i} href="#" className="text-blue-500">{word} </a>
                    ) : (
                      <span key={i}>{word} </span>
                    )
                  ))}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default ActivityCard;
