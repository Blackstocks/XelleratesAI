import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Collapse } from 'react-collapse';
import { BriefcaseIcon, CurrencyDollarIcon, UserIcon } from '@heroicons/react/24/outline';
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
    menus.forEach((item, i) => {
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
  }, [router, locationName]);

  return (
    <>
      <ul>
        {role !== 'super_admin' &&
          menus.map((item, i) => (
            <li
              key={i}
              className={`single-sidebar-menu 
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
                  } ${activeSubmenu === i ? 'active-link' : ''}`}
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
              <Collapse isOpened={activeSubmenu === i}>
                <ul className='submenu'>
                  {item.child?.map((subItem, j) => (
                    <li key={j}>
                      <Link className={`submenu-link ${locationName === subItem.childlink ? 'active-submenu-link' : ''}`} href={subItem.childlink}>
                        <span className="dot">&#8226;</span> {subItem.childtitle}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Collapse>
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
            
            {/* New Tabs */}
            <li className={`single-sidebar-menu`}>
              <div className='menu-link' onClick={() => toggleSubmenu('investor-tools')}>
                <span className='menu-icon flex-grow-0'>
                  <BriefcaseIcon className='h-5 w-5' />
                </span>
                <div className='text-box flex-grow'>Investor Tools</div>
                <div className={`menu-arrow transform transition-all duration-300 ${activeSubmenu === 'investor-tools' ? ' rotate-90' : ''}`}>
                  <Icon icon='heroicons-outline:chevron-right' />
                </div>
              </div>
              <Collapse isOpened={activeSubmenu === 'investor-tools'}>
                <ul className='submenu'>
                  <li>
                    <Link className='submenu-link' href='/admin/investor-tools/curated-dealflow'>
                      <span className="dot">&#8226;</span> Curated Dealflow
                    </Link>
                  </li>
                  <li>
                    <Link className='submenu-link' href='/admin/investor-tools/document-management'>
                      <span className="dot">&#8226;</span> Doc Management
                    </Link>
                  </li>
                  <li>
                    <Link className='submenu-link' href='/admin/investor-tools/syndicate'>
                      <span className="dot">&#8226;</span> Syndicate
                    </Link>
                  </li>
                  <li>
                    <Link className='submenu-link' href='/admin/investor-tools/portfolio-management'>
                      <span className="dot">&#8226;</span> Portfolio Management
                    </Link>
                  </li>
                  <li>
                    <Link className='submenu-link' href='/admin/investor-tools/valuate-startup'>
                      <span className="dot">&#8226;</span> Valuate a Startup
                    </Link>
                  </li>
                  <li>
                    <Link className='submenu-link' href='/admin/investor-tools/post-term-sheet'>
                      <span className="dot">&#8226;</span> Post Term Sheet
                    </Link>
                  </li>
                </ul>
              </Collapse>
            </li>

            <li className={`single-sidebar-menu`}>
              <div className='menu-link' onClick={() => toggleSubmenu('startup-tools')}>
                <span className='menu-icon flex-grow-0'>
                  <UserIcon className='h-5 w-5' />
                </span>
                <div className='text-box flex-grow'>Startup Tools</div>
                <div className={`menu-arrow transform transition-all duration-300 ${activeSubmenu === 'startup-tools' ? ' rotate-90' : ''}`}>
                  <Icon icon='heroicons-outline:chevron-right' />
                </div>
              </div>
              <Collapse isOpened={activeSubmenu === 'startup-tools'}>
                <ul className='submenu'>
                  <li>
                    <Link className='submenu-link' href='/admin/startup-tools/investment-readiness'>
                      <span className="dot">&#8226;</span> Investment Readiness
                    </Link>
                  </li>
                  <li>
                    <Link className='submenu-link' href='/admin/startup-tools/diy-pitch-deck'>
                      <span className="dot">&#8226;</span> DIY Pitch Deck
                    </Link>
                  </li>
                  <li>
                    <Link className='submenu-link' href='/admin/startup-tools/financial-insights'>
                      <span className="dot">&#8226;</span> Financial Insights
                    </Link>
                  </li>
                  <li>
                    <Link className='submenu-link' href='/admin/startup-tools/fundraising'>
                      <span className="dot">&#8226;</span> Fundraising
                    </Link>
                  </li>
                  <li>
                    <Link className='submenu-link' href='/admin/startup-tools/legal-help-desk'>
                      <span className="dot">&#8226;</span> Legal Help Desk
                    </Link>
                  </li>
                  <li>
                    <Link className='submenu-link' href='/admin/startup-tools/connect-with-incubators'>
                      <span className="dot">&#8226;</span> Connect with Incub
                    </Link>
                  </li>
                </ul>
              </Collapse>
            </li>

            <li className={`single-sidebar-menu`}>
              <Link className='menu-link' href='/admin/revenue'>
                <span className='menu-icon flex-grow-0'>
                  <CurrencyDollarIcon className='h-5 w-5' />
                </span>
                <div className='text-box flex-grow'>Revenue</div>
              </Link>
            </li>
          </div>
        )}
      </ul>

      <style jsx>{`
        .logo-container {
          text-align: center;
          margin-bottom: 1rem;
          margin-top: -0.75rem;
        }
        .logo {
          max-width: 150px;
          height: auto;
        }
        .submenu {
          padding-left: 1.5rem;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          background-color: #f9fafb;
          border-left: 2px solid #e5e7eb;
          margin-left: 1rem;
          border-radius: 0.25rem;
        }
        .submenu-link {
          font-size: 13px;
          line-height: 1.8;
          display: flex;
          align-items: center;
          padding: 0.4rem 1rem;
          margin: 0.2rem 0;
          color: #4b5563;
          border-radius: 0.25rem;
          transition: background-color 0.2s, color 0.2s;
        }
        .submenu-link:hover {
          background-color: #e5e7eb;
          color: #1f2937;
        }
        .submenu-link .dot {
          margin-right: 0.5rem;
          font-size: 1rem;
          color: #6b7280;
        }
        .submenu-link.active-submenu-link {
          background-color: #000;
          color: #fff;
        }
        .single-sidebar-menu {
          margin: 0.5rem 0;
        }
        .menu-link {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          transition: background-color 0.2s, color 0.2s;
        }
        .menu-link:hover {
          background-color: #e5e7eb;
          color: #1f2937;
        }
        .menu-icon {
          margin-right: 0.75rem;
        }
        .text-box {
          flex-grow: 1;
          font-size: 15px;
          font-weight: 500;
          color: #374151;
        }
        .menu-arrow {
          margin-left: auto;
        }
        .submenu .menu-arrow {
          display: none;
        }
        .active-link {
          background-color: #000;
          color: #fff;
        }
      `}</style>
    </>
  );
};

export default Navmenu;
