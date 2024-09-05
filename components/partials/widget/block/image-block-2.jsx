import useUserDetails from '@/hooks/useUserDetails';
import React, { useState, useEffect } from 'react';
import ComingSoonModal from '@/components/ComingSoonModal';

const ImageBlock2 = ({ selectedStartup, companyName }) => {
  const { user, loading } = useUserDetails();
  const [greeting, setGreeting] = useState('Good evening');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting('Good Morning');
    } else if (currentHour < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  }, []);

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div
      className="bg-no-repeat bg-cover bg-center p-5 rounded-[6px] relative w-full h-full"
      style={{
        backgroundImage: `url(/assets/images/all-img/widget-bg-2.png)`,
      }}
    >
      <div>
        <h4 className="text-xl font-medium text-white mb-2">
          {/* Show Portfolio Management and Company Name when a startup is selected */}
          {selectedStartup ? (
            <>
              <span className="block font-normal">Portfolio Management</span>
              <span className="block">{companyName}</span>
            </>
          ) : (
            <>
              {/* Show the original greeting and user name when no startup is selected */}
              <span className="block font-normal">{greeting},</span>
              <span className="block">{user?.name}</span>
              {/* Always show welcome text when no startup is selected */}
              <p className="text-sm text-white font-normal">Welcome to your portfolio management</p>
            </>
          )}
        </h4>
      </div>
    </div>
  );
};

export default ImageBlock2;
