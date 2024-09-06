'use client';
import useDarkMode from '@/hooks/useDarkMode';
import UpdatePassword from '@/components/partials/auth/update-password';
import Image from 'next/image';
import Link from 'next/link';
import Globe from '@/components/globe'; 

// image import

const UpdatePasswordPage = () => {
  const [isDark] = useDarkMode();
  return (
    <>
      <div className='loginwrapper'>
        <div className='lg-inner-column'>
        <div
          className="left-column relative z-[1]"
          style={{ backgroundColor: "black" }}
        >
          <div className="absolute left-0 2xl:bottom-[-10px] bottom-[-10px] h-full w-full z-[-1]">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "transparent",
                height: "10vh",
              }}
            >
              <img
                src="assets/images/logo/X.gif"
                alt="Logo"
                style={{
                  height: "300px", // increased height
                  width: "350px", // increased width
                  objectFit: "contain",
                  marginTop: "25vh",
                }}
              />
            </div>

            <div>
              <Globe /> {/* Replace the GIF with the Globe component */}
            </div>
          </div>
        </div>
          <div className='right-column relative'>
            <div className='inner-content h-full flex flex-col bg-white dark:bg-slate-900'>
              <div className='auth-box h-full flex flex-col justify-center'>
                <div className='mobile-logo text-center mb-6 lg:hidden block'>
                  <Link href='/'>
                    <Image
                      src={
                        isDark
                          ? '/assets/images/logo/xlogo-white-removebg-preview.png'
                          : '/assets/images/logo/xlogo-white-removebg-preview.png'
                      }
                      alt=''
                      className='mx-auto'
                      width={100}
                      height={100}
                    />
                  </Link>
                </div>
                <div className='text-center 2xl:mb-10 mb-4'>
                  <div className='text-slate-500 text-base'>
                    Reset your Password
                  </div>
                </div>
                <UpdatePassword />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdatePasswordPage;
