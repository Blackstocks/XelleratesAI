import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const Dropdowntype = ({
  label = 'Select User Type',
  wrapperClass = 'flex justify-center', // Center the dropdown
  labelClass = 'block w-full px-4 py-2 text-left text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
  classMenuItems = 'mt-2 w-full left-1/2 transform -translate-x-1/2', // Center and full width
  items = [
    { label: 'Startup', value: 'startup' },
    { label: 'Investor', value: 'investor' },
  ],
  classItem = 'px-4 py-2 w-full', // Ensure items take full width
  className = '',
  register,
  name,
  error,
  onSelect,
}) => {
  return (
    <div className={`relative ${wrapperClass}`}>
      <Menu as='div' className={`block w-full ${className}`}>
        <Menu.Button className='block w-full'>
          <div className={labelClass}>{label}</div>
        </Menu.Button>

        <Transition
          as={Fragment}
          enter='transition ease-out duration-100'
          enterFrom='transform opacity-0 scale-95'
          enterTo='transform opacity-100 scale-100'
          leave='transition ease-in duration-75'
          leaveFrom='transform opacity-100 scale-100'
          leaveTo='transform opacity-0 scale-95'
        >
          <Menu.Items
            className={`absolute origin-top border border-slate-100
            rounded bg-white dark:bg-slate-900 dark:border-slate-700 shadow-dropdown z-[9999]
            ${classMenuItems}
            `}
          >
            <div>
              {items.map((item, index) => (
                <Menu.Item key={index}>
                  {({ active }) => (
                    <div
                      className={`${
                        active
                          ? 'bg-slate-100 text-slate-900 dark:bg-slate-600 dark:text-slate-300 dark:bg-opacity-50'
                          : 'text-slate-600 dark:text-slate-300'
                      } block ${classItem}`}
                      onClick={() => onSelect(item.value)}
                    >
                      {item.label}
                    </div>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
      {error && (
        <div className='text-red-600 text-sm mt-1'>{error.message}</div>
      )}
    </div>
  );
};

export default Dropdowntype;
