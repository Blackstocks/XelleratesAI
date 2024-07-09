'use client';
import Link from 'next/link';
import LoginForm1 from '@/components/partials/auth/login-form1';
import useDarkMode from '@/hooks/useDarkMode';
import Globe from '@/components/globe'; // Import the Globe component

const Login = () => {
  const [isDark] = useDarkMode();
  return (
    <>
      <div className='loginwrapper'>
        <div className='lg-inner-column'>
          <div
            className='left-column relative z-[1]'
            style={{ backgroundColor: 'black' }}
          >
            <div className='absolute left-0 2xl:bottom-[-10px] bottom-[-10px] h-full w-full z-[-1]'>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'transparent',
                  height: '10vh',
                }}
              >
                <img
                  src='assets/images/logo/X.gif'
                  alt='Logo'
                  style={{
                    height: '100px', // increased height
                    width: '350px', // increased width
                    objectFit: 'contain',
                    marginTop: '25vh',
                  }}
                />
              </div>

              <div>
                <Globe /> {/* Replace the GIF with the Globe component */}
              </div>
            </div>
          </div>
          <div className='right-column relative'>
            <div className='inner-content h-full flex flex-col bg-white dark:bg-slate-800'>
              <div className='auth-box h-full flex flex-col justify-center'>
                <div className='mobile-logo text-center mb-6 lg:hidden block'>
                  <Link href='/'>
                    <img
                      src={
                        isDark
                          ? '/assets/images/logo/X (8).png'
                          : '/assets/images/logo/X (8).png'
                      }
                      alt=''
                      style={{
                        height: '200px',
                        width: '200px',
                        marginLeft: '80px',
                        marginBottom: '-50px',
                        marginTop: '-50px',
                      }}
                    />
                  </Link>
                </div>
                <div className='text-center 2xl:mb-10 mb-4'>
                  <h4 className='font-medium'>Sign in</h4>
                </div>
                <LoginForm1 />
                <div className='md:max-w-[345px] mx-auto font-normal text-slate-500 dark:text-slate-400 mt-12 uppercase text-sm'>
                  Don’t have an account?{' '}
                  <Link
                    href='/register'
                    className='text-slate-900 dark:text-white font-medium hover:underline'
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
