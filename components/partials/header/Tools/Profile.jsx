import React, { useState, useEffect } from 'react';
import Dropdown from '@/components/ui/Dropdown';
import Icon from '@/components/ui/Icon';
import { Menu } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseclient'; // Import Supabase client

const ProfileLabel = ({ user }) => {
  return (
    <div className='flex items-center'>
      <div className='flex-1 ltr:mr-[10px] rtl:ml-[10px]'>
        <div className='lg:h-8 lg:w-8 h-7 w-7 rounded-full'>
          {user?.user_type === 'startup' ? (
            <div>
              {user?.company_logo ? (
                <img
                  src={user.company_logo}
                  alt='Company Logo'
                  className='w-full h-full object-cover rounded-full'
                />
              ) : (
                <img
                  src='assets/images/all-img/istockphoto-907865186-612x612.jpg'
                  alt=''
                  className='w-full h-full object-cover rounded-full'
                />
              )}
            </div>
          ) : (
            <div>
              {user?.company_logo ? (
                <img
                  src={user.company_logo}
                  alt='Company Logo'
                  className='w-full h-full object-cover rounded-full'
                />
              ) : (
                <img
                  src='assets/images/all-img/istockphoto-907865186-612x612.jpg'
                  alt=''
                  className='w-full h-full object-cover rounded-full'
                />
              )}
            </div>
          )}
        </div>
      </div>
      <div className='flex-none text-slate-600 dark:text-white text-sm font-normal items-center lg:flex hidden overflow-hidden text-ellipsis whitespace-nowrap'>
        <span className='overflow-hidden text-ellipsis whitespace-nowrap w-[85px] block'>
          {user?.name || 'User Name'}
        </span>
        <span className='text-base inline-block ltr:ml-[10px] rtl:mr-[10px]'>
          <Icon icon='heroicons-outline:chevron-down'></Icon>
        </span>
      </div>
    </div>
  );
};

const Profile = () => {
  const { logout } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !currentUser) {
        console.error('Error fetching user:', userError);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        setUser(profile);
      }

      setLoading(false);
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className='flex items-center'>
        <div className='flex-1 ltr:mr-[10px] rtl:ml-[10px]'>
          <div className='lg:h-8 lg:w-8 h-7 w-7 bg-[#C4C4C4] dark:bg-slate-500 rounded-full animate-pulse'></div>
        </div>
        <div className='flex-none text-slate-600 dark:text-white text-sm font-normal items-center lg:flex hidden overflow-hidden text-ellipsis whitespace-nowrap'>
          <div className='bg-[#C4C4C4] dark:bg-slate-500 h-4 w-[85px] rounded animate-pulse'></div>
          <div className='bg-[#C4C4C4] dark:bg-slate-500 h-4 w-4 rounded-full animate-pulse ltr:ml-[10px] rtl:mr-[10px]'></div>
        </div>
      </div>
    );
  }

  const ProfileMenu = [
    {
      label: 'Profile',
      icon: 'heroicons-outline:user',
      action: () => {
        router.push('/profile');
      },
    },
    {
      label: 'Wallet',
      icon: 'heroicons:wallet',
      action: () => {
        router.push('/wallet');
      },
    },
    {
      label: 'Logout',
      icon: 'heroicons-outline:login',
      action: async () => {
        await logout();
        router.push('/');
      },
    },
  ];

  return (
    <Dropdown
      label={<ProfileLabel user={user} />}
      classMenuItems='w-[180px] top-[58px]'
    >
      {ProfileMenu.map((item, index) => (
        <Menu.Item key={index}>
          {({ active }) => (
            <div
              onClick={item.action}
              className={`${
                active
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-600 dark:text-slate-300 dark:bg-opacity-50'
                  : 'text-slate-600 dark:text-slate-300'
              } block ${
                item.hasDivider
                  ? 'border-t border-slate-100 dark:border-slate-700'
                  : ''
              }`}
            >
              <div className={`block cursor-pointer px-4 py-2`}>
                <div className='flex items-center'>
                  <span className='block text-xl ltr:mr-3 rtl:ml-3'>
                    <Icon icon={item.icon} />
                  </span>
                  <span className='block text-sm'>{item.label}</span>
                </div>
              </div>
            </div>
          )}
        </Menu.Item>
      ))}
    </Dropdown>
  );
};

export default Profile;
