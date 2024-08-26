import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition, Combobox } from '@headlessui/react';
import Icon from '@/components/ui/Icon';

const placeholderTexts = [
  'Investment Readiness',
  'Pitch Deck',
  'Financial Insights',
  'Fundraising',
  'Legal Help Desk',
  'Connect with Incubators',
];

const SearchModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [letterIndex, setLetterIndex] = useState(0);
  const [isRevealing, setIsRevealing] = useState(true);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (pause) {
        return;
      }

      if (isRevealing) {
        setPlaceholder(
          (prev) =>
            prev + (placeholderTexts[placeholderIndex][letterIndex] || '')
        );
        setLetterIndex((prev) => prev + 1);
        if (letterIndex === placeholderTexts[placeholderIndex].length - 1) {
          setPause(true);
          setTimeout(() => {
            setPause(false);
            setIsRevealing(false);
          }, 1000); // Pause at the end of the text for 1 second
        }
      } else {
        setPlaceholder((prev) => prev.slice(0, -1));
        setLetterIndex((prev) => prev - 1);
        if (letterIndex === 0) {
          setPause(true);
          setTimeout(() => {
            setPause(false);
            setIsRevealing(true);
            setPlaceholderIndex((prev) => (prev + 1) % placeholderTexts.length);
          }, 500); // Pause before starting the next text for 0.5 seconds
        }
      }
    }, 100); // Adjust the speed of animation here

    return () => clearInterval(interval);
  }, [letterIndex, isRevealing, pause, placeholderIndex]);

  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);

  const searchList = [
    { id: 1, name: 'What is Dashcode?' },
    { id: 2, name: 'Our Services' },
    { id: 3, name: 'Our Team' },
    { id: 4, name: 'Our Clients' },
    { id: 5, name: 'Our Partners' },
    { id: 6, name: 'Our Blog' },
    { id: 7, name: 'Our Contact' },
  ];

  const filteredsearchList = searchList.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div>
        <button
          className='flex items-center xl:text-sm text-lg xl:text-slate-400 text-slate-800 dark:text-slate-300 px-1 space-x-3 rtl:space-x-reverse'
          onClick={openModal}
          aria-label='Search'
        >
          <Icon icon='heroicons-outline:search' />
          <span className='xl:inline-block hidden'>Search... </span>
        </button>
      </div>

      <Transition show={isOpen} as={Fragment}>
        <Dialog
          as='div'
          className='fixed inset-0 z-[9999] overflow-y-auto p-4 md:pt-[25vh] pt-20'
          onClose={closeModal}
        >
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-slate-950/60 backdrop-filter backdrop-blur-sm backdrop-brightness-10' />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0 scale-95'
            enterTo='opacity-100 scale-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100 scale-100'
            leaveTo='opacity-0 scale-95'
          >
            <Dialog.Panel>
              <Combobox>
                <div className='relative'>
                  <div className='relative mx-auto max-w-xl rounded-md bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-gray-500-500 dark:ring-light divide-y divide-gray-500-300 dark:divide-light'>
                    <div className='flex bg-white dark:bg-slate-900 px-3 rounded-md py-3 items-center'>
                      <div className='flex-0 text-slate-700 dark:text-slate-300 ltr:pr-2 rtl:pl-2 text-lg'>
                        <Icon icon='heroicons-outline:search' />
                      </div>
                      <div className='relative flex-1'>
                        <Combobox.Input
                          className='bg-transparent outline-none focus:outline-none border-none w-full dark:placeholder:text-slate-300 dark:text-slate-200'
                          placeholder={`Search ${placeholder}`}
                          onChange={(event) => setQuery(event.target.value)}
                        />
                        <div className='absolute top-0 right-0 h-full flex items-center'>
                          <div className='dot blink'></div>
                        </div>
                      </div>
                    </div>
                    <Transition
                      leave='transition ease-in duration-100'
                      leaveFrom='opacity-100'
                      leaveTo='opacity-0'
                    >
                      <Combobox.Options className='max-h-40 overflow-y-auto text-sm py-2'>
                        {filteredsearchList.length === 0 && query !== '' && (
                          <div className='text-base py-2 px-4'>
                            <p className='text-slate-500 text-base dark:text-white'>
                              No result found
                            </p>
                          </div>
                        )}

                        {filteredsearchList.map((item, i) => (
                          <Combobox.Option key={i}>
                            {({ active }) => (
                              <div
                                className={`px-4 text-[15px] font-normal capitalize py-2 ${
                                  active
                                    ? 'bg-slate-950 dark:bg-slate-600 dark:bg-opacity-60 text-white'
                                    : 'text-slate-900 dark:text-white'
                                }`}
                              >
                                <span>{item.name}</span>
                              </div>
                            )}
                          </Combobox.Option>
                        ))}
                      </Combobox.Options>
                    </Transition>
                  </div>
                </div>
              </Combobox>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
      <style jsx>{`
        .blink {
          width: 5px;
          height: 5px;
          background-color: currentColor;
          border-radius: 50%;
          margin-left: 2px;
          animation: blink-animation 1s steps(5, start) infinite;
        }

        @keyframes blink-animation {
          to {
            visibility: hidden;
          }
        }
      `}</style>
    </>
  );
};

export default SearchModal;
