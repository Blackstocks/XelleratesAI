import useUserDetails from '@/hooks/useUserDetails';
import React, { useState, useEffect } from "react";
import ComingSoonModal from "@/components/ComingSoonModal";

const ImageBlock2 = () => {
  const { user, details, loading } = useUserDetails();
  const [value, setValue] = useState({
    startDate: new Date(),
    endDate: new Date().setMonth(11),
  });
  const [greeting, setGreeting] = useState("Good evening");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting("Good Morning");
    } else if (currentHour < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  }, []);

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div
      className='bg-no-repeat bg-cover bg-center p-5 rounded-[6px] relative'
      style={{
        backgroundImage: `url(/assets/images/all-img/widget-bg-2.png)`,
      }}
    >
      <div>
        <h4 className='text-xl font-medium text-white mb-2'>
          <span className='block font-normal'>{greeting},</span>
          <span className='block'>{user?.name}</span>
        </h4>
        <p className='text-sm text-white font-normal'>Welcome to Xellerates AI</p>
      </div>
    </div>
  );
};

export default ImageBlock2;
