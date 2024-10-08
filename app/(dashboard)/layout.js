'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import Header from '@/components/partials/header';
import Sidebar from '@/components/partials/sidebar';
import Settings from '@/components/partials/settings';
import useWidth from '@/hooks/useWidth';
import useSidebar from '@/hooks/useSidebar';
import useContentWidth from '@/hooks/useContentWidth';
import useMenulayout from '@/hooks/useMenulayout';
import useMenuHidden from '@/hooks/useMenuHidden';
import Footer from '@/components/partials/footer';
// import Breadcrumbs from "@/components/ui/Breadcrumbs";
import MobileMenu from '@/components/partials/sidebar/MobileMenu';
import useMobileMenu from '@/hooks/useMobileMenu';
import useMonoChrome from '@/hooks/useMonoChrome';
import MobileFooter from '@/components/partials/footer/MobileFooter';
import { useSelector } from 'react-redux';
import useRtl from '@/hooks/useRtl';
import useDarkMode from '@/hooks/useDarkMode';
import useSkin from '@/hooks/useSkin';
import Loading from '@/app/loading';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import useNavbarType from '@/hooks/useNavbarType';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseclient';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';
import useUserDetails from '@/hooks/useUserDetails';
import Modal from '@/components/ui/Modal';

export default function RootLayout({ children }) {
  const {
    companyProfile,
    founderInformation,
    loading: usercompleteLoading,
  } = useCompleteUserDetails();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { width, breakpoints } = useWidth();
  const [collapsed] = useSidebar();
  const [isRtl] = useRtl();
  const [isDark] = useDarkMode();
  const [skin] = useSkin();
  const [navbarType] = useNavbarType();
  const [isMonoChrome] = useMonoChrome();
  const router = useRouter();
  const { user, loading } = useUserDetails();
  useEffect(() => {
    const checkAuthToken = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        console.log('No session found, redirecting to login');
        router.push('/');
      }
    };
    checkAuthToken();
  }, [router]);
  const location = usePathname();
  const [contentWidth] = useContentWidth();
  const [menuType] = useMenulayout();
  const [menuHidden] = useMenuHidden();
  const [mobileMenu, setMobileMenu] = useMobileMenu();
  const switchHeaderClass = () => {
    if (menuType === 'horizontal' || menuHidden) {
      return 'ltr:ml-0 rtl:mr-0';
    } else if (collapsed) {
      return 'ltr:ml-[72px] rtl:mr-[72px]';
    } else {
      return 'ltr:ml-[248px] rtl:mr-[248px]';
    }
  };

  useEffect(() => {
    if (location !== '/profile' && !usercompleteLoading) {
      if (
        user?.user_type === 'startup' &&
        companyProfile !== undefined &&
        founderInformation !== undefined
      ) {
        if (!companyProfile || !founderInformation) {
          setIsModalOpen(true);
        }
      }
    }
  }, [user, companyProfile, founderInformation, usercompleteLoading, location]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`app-warp    ${isDark ? 'dark' : 'light'} ${
        skin === 'bordered' ? 'skin--bordered' : 'skin--default'
      }
      ${navbarType === 'floating' ? 'has-floating' : ''}
      `}
    >
      <Header className={width > breakpoints.xl ? switchHeaderClass() : ''} />
      {menuType === 'vertical' && width > breakpoints.xl && !menuHidden && (
        <Sidebar />
      )}
      <MobileMenu
        className={`${
          width < breakpoints.xl && mobileMenu
            ? 'left-0 visible opacity-100  z-[9999]'
            : 'left-[-300px] invisible opacity-0  z-[-999] '
        }`}
      />
      {/* mobile menu overlay*/}
      {width < breakpoints.xl && mobileMenu && (
        <div
          className='overlay bg-slate-950/50 backdrop-filter backdrop-blur-sm opacity-100 fixed inset-0 z-[999]'
          onClick={() => setMobileMenu(false)}
        ></div>
      )}
      {/* <Settings /> */}
      <div
        className={`content-wrapper transition-all duration-150 ${
          width > 1280 ? switchHeaderClass() : ''
        }`}
      >
        {/* md:min-h-screen will h-full*/}
        <div className='page-content   page-min-height  '>
          <div
            className={
              contentWidth === 'boxed' ? 'container mx-auto' : 'container-fluid'
            }
          >
            <motion.div
              key={location}
              initial='pageInitial'
              animate='pageAnimate'
              exit='pageExit'
              variants={{
                pageInitial: {
                  opacity: 0,
                  y: 50,
                },
                pageAnimate: {
                  opacity: 1,
                  y: 0,
                },
                pageExit: {
                  opacity: 0,
                  y: -50,
                },
              }}
              transition={{
                type: 'tween',
                ease: 'easeInOut',
                duration: 0.5,
              }}
            >
              <Suspense fallback={<Loading />}>{children}</Suspense>
            </motion.div>
          </div>
        </div>
      </div>
      {width < breakpoints.md && <MobileFooter />}
      {width > breakpoints.md && (
        <Footer className={width > breakpoints.xl ? switchHeaderClass() : ''} />
      )}
      <Modal
        activeModal={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title='Complete Your Profile'
        className='max-w-lg'
        themeClass='bg-[#0F172A] dark:bg-slate-900 dark:border-b dark:border-slate-700'
      >
        <p>
          {!companyProfile &&
            !founderInformation &&
            'Please complete your Startup Profile and Founder Profile to avail these features.'}
          {!companyProfile &&
            founderInformation &&
            'Please complete your Startup Profile to avail these features.'}
          {companyProfile &&
            !founderInformation &&
            'Please complete your Founder Profile to avail these features.'}
        </p>

        <div className='mt-4 flex gap-4'>
          {/* Proceed Button */}
          <button
            onClick={() => {
              setIsModalOpen(false); // Close the modal
              router.push('/profile'); // Navigate to /profile
            }}
            className='bg-white text-black border border-black py-2 px-4 rounded-md transition-colors duration-300 hover:bg-[#0F172A] hover:text-white hover:border-transparent'
          >
            Proceed
          </button>

          {/* Close Button */}
          <button
            onClick={() => setIsModalOpen(false)} // Just close the modal
            className='bg-white text-black border border-black py-2 px-4 rounded-md transition-colors duration-300 hover:bg-[#0F172A] hover:text-white hover:border-transparent'
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}
