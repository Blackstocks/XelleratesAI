import React from 'react';
import Link from 'next/link';
import InputGroup from '@/components/ui/InputGroup';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';

const category = [
  {
    cta: 'All Posts ',
  },
  {
    cta: 'Private Equity ',
  },
  {
    cta: 'Legal Clinic',
  },
  {
    cta: 'Law Firm Management',
  },
  {
    cta: 'Case Study ',
  },
  {
    cta: 'HR ',
  },
  {
    cta: 'Debt Funding',
  },
];
const posts = [
  {
    img: '/assets/images/videos/Blog 1.mp4',
    title:
      'Unlocking Potential: Why Now Is The Ideal Time To Invest In Startups',
    date: '10/05/2024',
  },
  {
    img: '/assets/images/videos/Blog 2.mp4',
    title:
      'The Crucial Role Of Due Diligence In Startup Funding: A Comprehensive Guide',
    date: '10/03/2024',
  },
  {
    img: '/assets/images/videos/Blog 3.mp4',
    title:
      'Empowering Startups: The Role Of Purchase Order (PO) Financing In Fulfilling Orders And Driving Revenue',
    date: '10/02/2024',
  },
];
const tags = [
  {
    title: 'Business',
    link: '#',
  },
  {
    title: 'Consulting',
    link: '#',
  },
  {
    title: 'Photographic',
    link: '#',
  },
  {
    title: 'Investment',
    link: '#',
  },
  {
    title: 'Camera',
    link: '#',
  },
  {
    title: 'Assurance',
    link: '#',
  },
  {
    title: 'Secutity',
    link: '#',
  },
];
const Sidebar = () => {
  return (
    <div className='space-y-5 divide-y divide-slate-100 dark:divide-slate-700 -mx-6'>
      <div className='px-6'>
        <InputGroup
          type='text'
          placeholder='Search....'
          append={
            <Button
              icon='heroicons-outline:search'
              className='btn-dark dark:bg-slate-600'
            />
          }
        />
      </div>
      <div className='pt-4 px-6'>
        <h4 className='text-slate-600 dark:text-slate-300 text-xl font-medium mb-4'>
          Latest Blogs Post
        </h4>
        <ul className='list-item space-y-4'>
          {posts.map((item, i) => (
            <li key={i}>
              <div className='flex space-x-4 rtl:space-x-reverse'>
                <div className='flex-none'>
                  <div className='h-20 w-20'>
                    {/* <img
                      src={item.img}
                      alt=''
                      className='block w-full h-full'
                    /> */}
                    <video
                      src={item.img}
                      alt=''
                      className='w-full h-full object-contain'
                      controls
                    ></video>
                  </div>
                </div>

                <div className='flex-1 flex flex-col'>
                  <h4 className='text-sm text-slate-600 font-regular leading-5 mb-4'>
                    <Link href='#'>{item.title}</Link>.
                  </h4>
                  <span className='text-xs text-slate-400'>
                    <Link href='#'>{item.date}</Link>
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className='pt-4 px-6'>
        <h4 className='text-slate-600 dark:text-slate-300 text-xl font-medium mb-4'>
          Category
        </h4>
        <ul className='list-item space-y-6'>
          {category.map((item, i) => (
            <li key={i}>
              <Link
                href='#'
                className='flex space-x-1 items-start leading-[1] text-sm text-slate-500 dark:text-slate-300 hover:text-slate-900 transition duration-150 rtl:space-x-reverse'
              >
                <span className='text-sm'>
                  <Icon icon='heroicons:chevron-right-solid' />
                </span>
                <span>{item.cta}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {/* <div className='pt-4 px-6'>
        <h4 className='text-slate-600 dark:text-slate-300 text-xl font-medium mb-4'>
          Popular tags
        </h4>
        <ul className='flex flex-wrap'>
          {tags.map((item, i) => (
            <li key={i} className='mr-2 mb-2'>
              <Link
                href={item.link}
                className='text-xs font-normal text-slate-600 bg-slate-100 dark:bg-slate-600 dark:text-slate-300 py-1 px-3 rounded-full hover:bg-slate-900 hover:text-white transition duration-150'
              >
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div> */}
      <div className='mx-6 bg-slate-900 dark:bg-slate-900 text-white rounded-xl p-6 space-y-4'>
        <h4 className='text-xl font-medium text-white'>
          Subscribe to our blog
        </h4>
        <div className='text-sm'>
          Lorem ipsum dolor sit amet, consectet ur adipiscing elit.
        </div>
        <form action='#' className='space-y-4'>
          <input
            type='text'
            placeholder='Enter your email'
            className='form-control py-2 bg-transparent border-secondary-500 text-white placeholder:text-slate-400'
          />
          <button type='button' className='btn btn-light btn-sm w-full'>
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
};

export default Sidebar;
