"use client";
import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Dummy data for different views
const data = {
  tabular: [
    { name: 'Avg. Session', value: '2m 35s', change: '+5.2%' },
    { name: 'New Users', value: '5,621', change: '+10.3%' },
    { name: 'Page Views', value: '45,890', change: '-2.15%' },
    { name: 'Conversion Rate', value: '4.8%', change: '+1.5%' },
    { name: 'Bounce Rate', value: '32.5%', change: '-3.8%' },
    { name: 'Returning Visitors', value: '8,932', change: '+7.2%' },
    { name: 'Avg. Order Value', value: '$56.78', change: '-2.7%' },
  ],
  pie: {
    series: [35, 25, 20, 15, 5],
    options: {
      labels: ['Avg. Session', 'New Users', 'Page Views', 'Conversion Rate', 'Others'],
      chart: { type: 'pie' },
      legend: { position: 'bottom' },
    },
  },
  graphical: {
    series: [{ name: 'Metrics', data: [35, 25, 20, 15, 5] }],
    options: {
      chart: { type: 'bar', height: 400, toolbar: { show: false } },
      colors: ['#1E90FF'],
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: false,
          columnWidth: '55%',
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: { 
        categories: ['Avg. Session', 'New Users', 'Page Views', 'Conversion Rate', 'Others'],
        title: { text: 'Metrics' }
      },
      yaxis: { 
        title: { text: 'Values' }
      },
    },
  },
};

const CaptableCard = () => {
  const [selectedView, setSelectedView] = useState('Tabular Form');

  // Function to handle dropdown selection
  const handleFilterChange = (event) => {
    setSelectedView(event.target.value);
  };

  return (
    <Card className="bg-white -p-1 h-[470px]"> {/* Consistent height */}
      {/* Header with Dropdown Filter */}
      <div className="flex justify-between items-center mb-0"> {/* Minimal margin above Captable */}
        <h3 className="text-xl font-semibold">Captable</h3>
        <select
          value={selectedView}
          onChange={handleFilterChange}
          className="px-1 py-1 border rounded-md text-xs ml-1" // Smaller dropdown with gap
        >
          <option value="Tabular Form">Tabular Form</option>
          <option value="Pie Chart Form">Pie Chart Form</option>
          <option value="Graphical Form">Graphical Form</option>
        </select>
      </div>
      {/* Conditionally Render Views */}
      <div className="h-full flex items-center justify-center mt-1"> {/* Ensures consistent height and centering */}
        {selectedView === 'Tabular Form' && (
          <div className="overflow-y-auto w-full h-full">
            <ul className="space-y-1 p-1"> {/* Minimal padding above the table */}
              {data.tabular.map((item, index) => (
                <li key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon name="session-duration" className="mr-3 text-blue-500" />
                    <div>
                      <span className="block font-medium">{item.name}</span>
                      <span className={`text-xs ${item.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                        {item.change.startsWith('+') ? `Increased by ${item.change}` : `Decreased by ${item.change}`} 
                      </span>
                    </div>
                  </div>
                  <span>{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {selectedView === 'Pie Chart Form' && (
          <div className="flex justify-center w-full mt-10">
            <Chart options={data.pie.options} series={data.pie.series} type="pie" height={400} />
          </div>
        )}

        {selectedView === 'Graphical Form' && (
          <div className="flex justify-center w-full">
            <Chart options={data.graphical.options} series={data.graphical.series} type="bar" height={400} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default CaptableCard;
