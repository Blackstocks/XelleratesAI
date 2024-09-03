'use client';
import React from 'react';
import Card from '@/components/ui/Card';

const FairMarketValueCard = () => {
  const countries = [
    { name: 'India', code: 'in', change: 5.1, value: '26,890' },
    { name: 'Germany', code: 'de', change: 1.3, value: '12,345' },
    { name: 'Spain', code: 'es', change: 2.7, value: '18,765' },
    { name: 'China', code: 'cn', change: -1.0, value: '9,874' },
    { name: 'Mexico', code: 'mx', change: 2.7, value: '21,456' },
    { name: 'Canada', code: 'ca', change: 3.4, value: '28,976' },
    { name: 'Argentina', code: 'ar', change: 5.4, value: '17,678' },
    { name: 'Singapore', code: 'sg', change: 0.9, value: '16,789' },
    { name: 'Italy', code: 'it', change: 0.3, value: '21,456' },
    { name: 'China', code: 'cn', change: -1.0, value: '9,874' },
    { name: 'Mexico', code: 'mx', change: 2.7, value: '21,456' },
  ];

  return (
    <Card
      title="Fair Market Value"
      extra={
        <a href="#" className="text-gray-400">
          View All
        </a>
      }
    >
      <ul className="space-y-2">
        {countries.map((country, index) => (
          <li key={index} className="flex justify-between items-center">
            {/* Updated flag source using Flagpedia */}
            <img
              src={`https://flagcdn.com/48x36/${country.code}.png`}
              alt={country.name}
              className="h-5 w-5 mr-2"
            />
            <span className="flex-grow">{country.name}</span>
            <span
              className={`flex-grow text-right ${
                country.change >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {country.change > 0 ? `${country.change}% ↑` : `${Math.abs(country.change)}% ↓`}
            </span>
            <span className="flex-grow text-right">{country.value}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default FairMarketValueCard;
