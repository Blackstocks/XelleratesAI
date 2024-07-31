import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Collapse } from 'react-collapse';
import Icon from '@/components/ui/Icon';
import { toggleActiveChat } from '@/components/partials/app/chat/store';
import { useDispatch } from 'react-redux';
import useMobileMenu from '@/hooks/useMobileMenu';
import Submenu from './Submenu';
import useUserDetails from '@/hooks/useUserDetails';

const Navmenu = ({ menus }) => {
  const router = useRouter();
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const { user } = useUserDetails();
  const role = user?.role;

  const toggleSubmenu = (i) => {
    if (activeSubmenu === i) {
      setActiveSubmenu(null);
    } else {
      setActiveSubmenu(i);
    }
  };

  const locationName = usePathname();
  // const locationName = location.replace('/', '');

  const [mobileMenu, setMobileMenu] = useMobileMenu();
  const dispatch = useDispatch();

  useEffect(() => {
    let submenuIndex = null;
    menus.map((item, i) => {
      if (!item.child) return;
      if (item.link === locationName) {
        submenuIndex = null;
      } else {
        const ciIndex = item.child.findIndex(
          (ci) => ci.childlink === locationName
        );
        if (ciIndex !== -1) {
          submenuIndex = i;
        }
      }
    });

    setActiveSubmenu(submenuIndex);
    dispatch(toggleActiveChat(false));
    if (mobileMenu) {
      setMobileMenu(false);
    }
  }, [router, location]);

  return (
    <>
      <ul>
        {role !== 'super_admin' &&
          menus.map((item, i) => (
            <li
              key={i}
              className={` single-sidebar-menu 
              ${item.child ? 'item-has-children' : ''}
              ${activeSubmenu === i ? 'open' : ''}
              ${locationName === item.link ? 'menu-item-active' : ''}`}
            >
              {!item.child && !item.isHeadr && (
                <Link className='menu-link' href={item.link}>
                  <span className='menu-icon flex-grow-0'>
                    <Icon icon={item.icon} />
                  </span>
                  <div className='text-box flex-grow'>{item.title}</div>
                  {item.badge && (
                    <span className='menu-badge'>{item.badge}</span>
                  )}
                </Link>
              )}
              {item.isHeadr && !item.child && (
                <div className='menulabel'>{item.title}</div>
              )}
              {item.child && (
                <div
                  className={`menu-link ${
                    activeSubmenu === i
                      ? 'parent_active not-collapsed'
                      : 'collapsed'
                  }`}
                  onClick={() => toggleSubmenu(i)}
                >
                  <div className='flex-1 flex items-start'>
                    <span className='menu-icon'>
                      <Icon icon={item.icon} />
                    </span>
                    <div className='text-box'>{item.title}</div>
                  </div>
                  <div className='flex-0'>
                    <div
                      className={`menu-arrow transform transition-all duration-300 ${
                        activeSubmenu === i ? ' rotate-90' : ''
                      }`}
                    >
                      <Icon icon='heroicons-outline:chevron-right' />
                    </div>
                  </div>
                </div>
              )}
              <Submenu
                activeSubmenu={activeSubmenu}
                item={item}
                i={i}
                locationName={locationName}
              />
            </li>
          ))}
        {/* Separate tab */}
        {role === 'super_admin' && (
          <div>
            <li className={`single-sidebar-menu`}>
              <Link className='menu-link' href='/admin/investors'>
                <span className='menu-icon flex-grow-0'>
                  <Icon icon='heroicons-outline:star' />
                </span>
                <div className='text-box flex-grow'>Investors</div>
              </Link>
            </li>

            <li className={`single-sidebar-menu`}>
              <Link className='menu-link' href='/admin/startups'>
                <span className='menu-icon flex-grow-0'>
                  <Icon icon='heroicons-outline:star' />
                </span>
                <div className='text-box flex-grow'>Startups</div>
              </Link>
            </li>
          </div>
        )}
      </ul>
    </>
  );
};

export default Navmenu;
