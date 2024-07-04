'use client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Link from 'next/link';
import Sidebar from '@/components/partials/blog/Sidebar';

const BlogPage = () => {
  return (
    <div className='lg:flex flex-wrap blog-posts lg:space-x-5 space-y-5 lg:space-y-0 rtl:space-x-reverse'>
      <div className='flex-none'>
        <div className='lg:max-w-[360px]'>
          <Card>
            <Sidebar />
          </Card>
        </div>
      </div>
      <div className='flex-1'>
        <div className='grid xl:grid-cols-2 grid-cols-1 gap-5'>
          <div className='xl:col-span-2 col-span-1'>
            <Card>
              <div className=' h-[248px] w-full mb-6 '>
                <video
                  src='/assets/images/videos/Blog 1.mp4'
                  alt=''
                  className='w-full h-full object-cover'
                  controls
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className='flex justify-between mb-4'>
                <Link href='blog/1'>
                  <span className='inline-flex leading-5 text-slate-500 dark:text-slate-400 text-sm font-normal'>
                    <Icon
                      icon='heroicons-outline:calendar'
                      className='text-slate-400 dark:text-slate-400 ltr:mr-2 rtl:ml-2 text-lg'
                    />
                    10/05/2024
                  </span>
                </Link>
                <div className='flex space-x-4 rtl:space-x-reverse'>
                  <Link href='#'>
                    <span className='inline-flex leading-5 text-slate-500 dark:text-slate-400 text-sm font-normal'>
                      <Icon
                        icon='heroicons-outline:chat'
                        className='text-slate-400 dark:text-slate-400 ltr:mr-2 rtl:ml-2 text-lg'
                      />
                      3
                    </span>
                  </Link>
                  <Link href='#'>
                    <span className='inline-flex leading-5 text-slate-500 dark:text-slate-400 text-sm font-normal'>
                      <Icon
                        icon='heroicons-outline:share'
                        className='text-slate-400 dark:text-slate-400 ltr:mr-2 rtl:ml-2 text-lg'
                      />
                      4
                    </span>
                  </Link>
                </div>
              </div>
              <h5 className='card-title text-slate-900'>
                <Link href='blog/1'>
                  Unlocking Potential: Why Now is the Ideal Time to Invest in
                  Startups
                </Link>
              </h5>
              <div className='card-text dark:text-slate-300 mt-4 space-y-4'>
                <p>
                  In the ever-evolving landscape of investments, the allure of
                  startups continues to captivate seasoned investors and novices
                  alike. While the allure of startups is perennial, the timing
                  of investment plays a pivotal role in reaping optimal returns.
                  In this article, we delve into why now presents an opportune
                  moment to channel your investments into the startup ecosystem
                  and discern the sectors primed for exponential growth.
                </p>
                <Button
                  className='btn-outline-dark'
                  text='Read more'
                  link='blog/1'
                />
              </div>
            </Card>
          </div>
          <Card bodyClass='p-0'>
            <div className=' h-[248px] w-full mb-6 '>
              <video
                src='/assets/images/videos/Blog 2.mp4'
                alt=''
                className='w-full h-full object-cover'
                controls
              >
                Your browser does not support the video tag.
              </video>
              {/* <img
                src='/assets/images/videos/Blog 2.mp4'
                alt=''
                className=' w-full h-full  object-cover'
              /> */}
            </div>
            <div className='px-6 pb-6'>
              <div className='flex justify-between mb-4'>
                <div>
                  <h5 className='text-base card-title text-black'>
                    <Link href='#'>
                      The Crucial Role of Due Diligence in Startup Funding: A
                      Comprehensive Guide
                    </Link>
                  </h5>
                </div>
                <Link href='#'>
                  <span className='inline-flex leading-5 text-slate-500 dark:text-slate-400 text-sm font-normal'>
                    <Icon
                      icon='heroicons-outline:calendar'
                      className='text-slate-400 dark:text-slate-400 ltr:mr-2 rtl:ml-2 text-lg'
                    />
                    10/02/2021
                  </span>
                </Link>
              </div>

              <div className='text-sm card-text dark:text-slate-300 mt-4'>
                <p>
                  In the fast-paced startup world, securing funding is crucial
                  for growth, with investors scrutinizing every aspect before
                  committing capital. Due diligence provides investors the
                  confidence and assurance needed to invest in a startup.
                </p>
                <div className='mt-4 space-x-4 rtl:space-x-reverse'>
                  <Link href='#' className='btn-link'>
                    Learn more
                  </Link>
                </div>
              </div>
            </div>
          </Card>
          <Card bodyClass='p-0'>
            <div className=' h-[248px] w-full  '>
              {/* <img
                src='/assets/images/all-img/post-1.png'
                alt=''
                className=' w-full h-full  object-cover'
              /> */}
              <video
                src='/assets/images/videos/Blog 3.mp4'
                alt=''
                className='w-full h-full object-cover'
                controls
              ></video>
            </div>
            <div className='p-6'>
              <div className='flex justify-between mb-4'>
                <div>
                  <h5 className='text-base card-title text-black'>
                    <Link href='#'>
                      Empowering Startups: The Role of Purchase Order (PO)
                      Financing in Fulfilling Orders and Driving Revenue
                    </Link>
                  </h5>
                </div>
                <Link href='#'>
                  <span className='inline-flex leading-5 text-slate-500 dark:text-slate-400 text-sm font-normal'>
                    <Icon
                      icon='heroicons-outline:calendar'
                      className='text-slate-400 dark:text-slate-400 ltr:mr-2 rtl:ml-2 text-lg'
                    />
                    10/02/2021
                  </span>
                </Link>
              </div>

              <div className='text-sm card-text dark:text-slate-300 mt-4'>
                <p>
                  This article delves into the concept of PO financing, its
                  benefits for startups, and its role in accelerating revenue
                  generation amidst the challenges of cash constraints.
                </p>
                <div className='mt-4 space-x-4 rtl:space-x-reverse'>
                  <Link href='#' className='btn-link'>
                    Learn more
                  </Link>
                </div>
              </div>
            </div>
          </Card>
          <Card bodyClass='p-0'>
            <div className=' h-[248px] w-full mb-6 '>
              <video
                src='/assets/images/videos/Blog 4.mp4'
                alt=''
                className='w-full h-full object-cover'
                controls
              ></video>
              {/* <img
                src='/assets/images/all-img/post-1.png'
                alt=''
                className=' w-full h-full  object-cover'
              /> */}
            </div>
            <div className='px-6 pb-6'>
              <div className='flex justify-between mb-4'>
                <div>
                  <h5 className='text-base card-title text-black'>
                    <Link href='#'>
                      Unlocking Growth: The Case for Debt Financing for Startups
                      in India in FY24
                    </Link>
                  </h5>
                </div>
                <Link href='#'>
                  <span className='inline-flex leading-5 text-slate-500 dark:text-slate-400 text-sm font-normal'>
                    <Icon
                      icon='heroicons-outline:calendar'
                      className='text-slate-400 dark:text-slate-400 ltr:mr-2 rtl:ml-2 text-lg'
                    />
                    24/03/2024
                  </span>
                </Link>
              </div>

              <div className='text-sm card-text dark:text-slate-300 mt-4'>
                <p>
                  This article delves into the advantages of debt financing for
                  startups in India, elucidating why it stands out as the
                  optimal option for fueling growth and innovation.
                </p>
                <div className='mt-4 space-x-4 rtl:space-x-reverse'>
                  <Link href='#' className='btn-link'>
                    Learn more
                  </Link>
                </div>
              </div>
            </div>
          </Card>
          <Card bodyClass='p-0'>
            <div className=' h-[248px] w-full  '>
              <video
                src='/assets/images/videos/Blog 5.mp4'
                alt=''
                className='w-full h-full object-cover'
                controls
              ></video>
              {/* <img
                src='/assets/images/all-img/post-1.png'
                alt=''
                className=' w-full h-full  object-cover'
              /> */}
            </div>
            <div className='p-6'>
              <div className='flex justify-between mb-4'>
                <div>
                  <h5 className='text-base card-title text-black'>
                    <Link href='#'>Essentials Of Securing Startup Funding</Link>
                  </h5>
                </div>
                <Link href='#'>
                  <span className='inline-flex leading-5 text-slate-500 dark:text-slate-400 text-sm font-normal'>
                    <Icon
                      icon='heroicons-outline:calendar'
                      className='text-slate-400 dark:text-slate-400 ltr:mr-2 rtl:ml-2 text-lg'
                    />
                    10/02/2021
                  </span>
                </Link>
              </div>

              <div className='text-sm card-text dark:text-slate-300 mt-4'>
                <p>
                  Embarking on the startup funding path requires a solid
                  foundation. It's crucial to have a strong business plan that
                  outlines your vision. A persuasive pitch can make your startup
                  stand out to investors.
                </p>
                <div className='mt-4 space-x-4 rtl:space-x-reverse'>
                  <Link href='#' className='btn-link'>
                    Learn more
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
