'use client';
import React from 'react';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon'; // Ensure that Icon is correctly imported

const CaptableCard = () => {
  return (
    <Card title="Captable" extra={<button className="text-gray-400">...</button>}>
      <ul className="space-y-1 p-0"> {/* Reduced padding from p-4 to p-2 */}
        {/* Avg. Session Duration */}
        <li className="flex items-center justify-between">
          <div className="flex items-center">
            <Icon name="session-duration" className="mr-3 text-blue-500" />
            <div>
              <span className="block font-medium">Avg. Session </span>
              <span className="text-xs text-green-500">Increased by 5.2% ↑</span>
            </div>
          </div>
          <span>2m 35s</span>
        </li>

        {/* New Users */}
        <li className="flex items-center justify-between">
          <div className="flex items-center">
            <Icon name="users" className="mr-3 text-pink-500" />
            <div>
              <span className="block font-medium">New Users</span>
              <span className="text-xs text-green-500">Increased by 10.3% ↑</span>
            </div>
          </div>
          <span>5,621</span>
        </li>

        {/* Page Views */}
        <li className="flex items-center justify-between">
          <div className="flex items-center">
            <Icon name="page-views" className="mr-3 text-red-500" />
            <div>
              <span className="block font-medium">Page Views</span>
              <span className="text-xs text-red-500">Decreased by 2.15% ↓</span>
            </div>
          </div>
          <span>45,890</span>
        </li>

        {/* Conversion Rate */}
        <li className="flex items-center justify-between">
          <div className="flex items-center">
            <Icon name="conversion-rate" className="mr-3 text-orange-500" />
            <div>
              <span className="block font-medium">Conversion Rate</span>
              <span className="text-xs text-green-500">Increased by 1.5% ↑</span>
            </div>
          </div>
          <span>4.8%</span>
        </li>

        {/* Bounce Rate */}
        <li className="flex items-center justify-between">
          <div className="flex items-center">
            <Icon name="bounce-rate" className="mr-3 text-purple-500" />
            <div>
              <span className="block font-medium">Bounce Rate</span>
              <span className="text-xs text-red-500">Decreased by 3.8% ↓</span>
            </div>
          </div>
          <span>32.5%</span>
        </li>

        {/* Returning Visitors */}
        <li className="flex items-center justify-between">
          <div className="flex items-center">
            <Icon name="returning-visitors" className="mr-3 text-yellow-500" />
            <div>
              <span className="block font-medium">Returning Visitors</span>
              <span className="text-xs text-green-500">Increased by 7.2% ↑</span>
            </div>
          </div>
          <span>8,932</span>
        </li>

        {/* Avg. Order Value */}
        <li className="flex items-center justify-between">
          <div className="flex items-center">
            <Icon name="order-value" className="mr-3 text-blue-500" />
            <div>
              <span className="block font-medium">Avg. Order Value</span>
              <span className="text-xs text-red-500">Decreased by 2.7% ↓</span>
            </div>
          </div>
          <span>$56.78</span>
        </li>
      </ul>
    </Card>
  );
};

export default CaptableCard;
