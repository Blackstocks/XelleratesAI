'use client';
import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import useUserDetails from '@/hooks/useUserDetails';
import useStartups from '@/hooks/useStartups';
import Modal from '@/components/Modal';
import Loading from '@/app/loading';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Textarea from '@/components/ui/Textarea';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import generateReport from '@/components/report/report-functions';
import useNotificationStatus from '@/hooks/useNotificationStatus';
import { handleStatusChange } from '@/lib/actions/investorActions';
import DocumentViewer from '@/components/portfolio-management/startupStageDocuments1'


const FounderInfoModal = ({selectedStartup, handleCloseModal}) =>{

    const [activeTab, setActiveTab] = useState('startupProfile');
    const [showForm, setShowForm] = useState(false)
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [showFullUSP, setShowFullUSP] = useState(false);
    const handleCloseModal1 = () => {
      setActiveTab('startupProfile');
    };

    console.log("Selected startup in modal: ", selectedStartup);
    const seriesWiseDocuments = ['coi', 'aoa', 'moa', 'pitch_deck'];


    const renderDocumentLink = (label, url) => (
        <li className='flex space-x-3 rtl:space-x-reverse'>
          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
            <Icon icon='heroicons:document' />
          </div>
          <div className='flex-1'>
            <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
              {label}
            </div>
            {url ? (
              <a
                href={url}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 hover:underline'
              >
                View Document
              </a>
            ) : (
              <span className='text-slate-600 dark:text-slate-50'>
                Not Provided
              </span>
            )}
          </div>
        </li>
      );



    return (
    <Modal isOpen={!!selectedStartup} onClose={handleCloseModal}>
        {selectedStartup && (
          <div className='flex flex-col lg:flex-row lg:space-x-4 w-full h-full max-h-[70vh]'>
            {/* Left side */}
            <div className='flex-none lg:w-2/5 p-4 border-r border-gray-300 flex flex-col items-center'>
              <div className='mb-4 flex flex-col items-center'>
                {selectedStartup?.profiles?.company_logo && (
                  <img
                    src={selectedStartup?.profiles?.company_logo}
                    alt={selectedStartup.company_profile?.company_name}
                    className='w-32 h-32 object-contain mb-4'
                  />
                )}
                <h2 className='text-2xl font-bold mb-2 text-center'>
                  {selectedStartup?.company_name || 'N/A'}
                </h2>
              </div>
              <div className='space-y-2 w-full'>
                <button
                  className={`w-full py-2 px-4 border rounded ${
                    activeTab === 'startupProfile'
                      ? 'bg-black-500 text-white'
                      : 'bg-white text-black'
                  }`}
                  onClick={() => {
                    setActiveTab('startupProfile');
                    setShowForm(false);
                  }}
                >
                  Startup Profile
                </button>
                <button
                  className={`w-full py-2 px-4 border rounded ${
                    activeTab === 'founderInfo'
                      ? 'bg-black-500 text-white'
                      : 'bg-white text-black'
                  }`}
                  onClick={() => {
                    setActiveTab('founderInfo');
                    setShowForm(false);
                  }}
                >
                  Founder Information
                </button>
                <button
                  className={`w-full py-2 px-4 border rounded ${
                    activeTab === 'businessDetails'
                      ? 'bg-black-500 text-white'
                      : 'bg-white text-black'
                  }`}
                  onClick={() => setActiveTab('businessDetails')}
                >
                  Business Details
                </button>
                <button
                  className={`w-full py-2 px-4 border rounded ${
                    activeTab === 'fundingInfo'
                      ? 'bg-black-500 text-white'
                      : 'bg-white text-black'
                  }`}
                  onClick={() => setActiveTab('fundingInfo')}
                >
                  Funding Information
                </button>
                <button
                  className={`w-full py-2 px-4 border rounded ${
                    activeTab === 'companyDocuments'
                      ? 'bg-black-500 text-white'
                      : 'bg-white text-black'
                  }`}
                  onClick={() => setActiveTab('companyDocuments')}
                >
                  Company Dcouments
                </button>
                <button
                  className={`w-full py-2 px-4 border rounded ${
                    activeTab === 'CTO_info'
                      ? 'bg-black-500 text-white'
                      : 'bg-white text-black'
                  }`}
                  onClick={() => setActiveTab('CTO_info')}
                >
                  CTO Info
                </button>
                <button
                  className={`w-full py-2 px-4 border rounded ${
                    activeTab === 'Documents'
                      ? 'bg-black-500 text-white'
                      : 'bg-white text-black'
                  }`}
                  onClick={() => setActiveTab('Documents')}
                >
                  Other Documents
                </button>
              </div>
            </div>
            {/* Right side */}
            <div className='flex-1 p-4 overflow-y-scroll'>
              {showForm ? (
                <div className='express-interest-form mt-4'>
                  <Textarea
                    label={'Message to the Startup'}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder='Write your message here'
                    className='w-full p-2 border rounded'
                  ></Textarea>
                  <div className='my-2'>
                    <label className='form-label' htmlFor='date-time-picker1'>
                      Slot 1
                    </label>
                    <Flatpickr
                      value={picker1}
                      data-enable-time
                      id='date-time-picker1'
                      className='form-control py-2'
                      onChange={(date) => setPicker1(date[0])}
                    />
                  </div>
                  <div className='my-2'>
                    <label className='form-label' htmlFor='date-time-picker2'>
                      Slot 2
                    </label>
                    <Flatpickr
                      value={picker2}
                      data-enable-time
                      id='date-time-picker2'
                      className='form-control py-2'
                      onChange={(date) => setPicker2(date[0])}
                    />
                  </div>
                  <div className='my-2'>
                    <label className='form-label' htmlFor='date-time-picker3'>
                      Slot 3
                    </label>
                    <Flatpickr
                      value={picker3}
                      data-enable-time
                      id='date-time-picker3'
                      className='form-control py-2'
                      onChange={(date) => setPicker3(date[0])}
                    />
                  </div>
                  <button
                    className='mr-1rem rounded-md py-2 px-4 border bg-[#14213d] text-white'
                    onClick={() => {
                      handleExpressInterest(
                        selectedStartup?.id,
                        user?.id,
                        message,
                        [picker1, picker2, picker3]
                      );
                    }}
                    disabled={expressLoading}
                  >
                    {expressLoading ? 'Sending...' : 'Send Interest'}
                  </button>

                  <button
                    className='rounded-md py-2 px-4 border bg-[#14213d] text-white'
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  {activeTab === 'startupProfile' && (
                    <div className='space-y-3'>
                      <h3 className='text-2xl font-bold mb-6'>
                        Startup Profile
                      </h3>
                      <div className='grid gap-2 md:gap-3 lg:gap-4 text-gray-700'>
                        {/* Short Description */}
                        <li className='flex space-x-3 rtl:space-x-reverse'>
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:document-text' />
                          </div>
                          <div className='flex-1'>
                            <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                              SHORT DESCRIPTION
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {showFullDescription
                                ? selectedStartup?.short_description
                                : `${selectedStartup?.short_description?.slice(
                                    0,
                                    100
                                  )}...`}
                              {selectedStartup?.short_description?.length >
                                100 && (
                                <button
                                  onClick={() =>
                                    setShowFullDescription(!showFullDescription)
                                  }
                                  className='text-blue-600 hover:underline ml-2'
                                >
                                  {showFullDescription
                                    ? 'Read less'
                                    : 'Read more'}
                                </button>
                              )}
                            </div>
                          </div>
                        </li>

                        {/* Date of Incorporation */}
                        <li className='flex space-x-3 rtl:space-x-reverse'>
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:calendar' />
                          </div>
                          <div className='flex-1'>
                            <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                              DATE OF INCORPORATION
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {selectedStartup?.incorporation_date
                                ? new Date(
                                    selectedStartup.incorporation_date
                                  ).toLocaleDateString()
                                : 'N/A'}
                            </div>
                          </div>
                        </li>

                        {/* Country and State/City */}
                        <li className='flex space-x-3 rtl:space-x-reverse'>
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:map' />
                          </div>
                          <div className='flex-1'>
                            <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                              LOCATION
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {selectedStartup?.country
                                ? JSON.parse(selectedStartup.country).label
                                : 'Not Provided'}
                              , {selectedStartup?.state_city || 'Not Provided'}
                            </div>
                          </div>
                        </li>

                        {/* Office Address */}
                        <li className='flex space-x-3 rtl:space-x-reverse'>
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:building-office' />
                          </div>
                          <div className='flex-1'>
                            <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                              OFFICE ADDRESS
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {selectedStartup?.office_address || 'N/A'}
                            </div>
                          </div>
                        </li>

                        {/* Industry Sector */}
                        <li className='flex space-x-3 rtl:space-x-reverse'>
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:tag' />
                          </div>
                          <div className='flex-1'>
                            <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                              INDUSTRY SECTOR
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {selectedStartup?.industry_sector || 'N/A'}
                            </div>
                          </div>
                        </li>

                        {/* Team Size */}
                        <li className='flex space-x-3 rtl:space-x-reverse'>
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:users' />
                          </div>
                          <div className='flex-1'>
                            <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                              TEAM SIZE
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {selectedStartup?.team_size || 'N/A'}
                            </div>
                          </div>
                        </li>

                        {/* Current Stage */}
                        <li className='flex space-x-3 rtl:space-x-reverse'>
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:chart-bar' />
                          </div>
                          <div className='flex-1'>
                            <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                              CURRENT STAGE
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {selectedStartup?.current_stage || 'N/A'}
                            </div>
                          </div>
                        </li>

                        {/* Target Audience */}
                        <li className='flex space-x-3 rtl:space-x-reverse'>
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:flag' />
                          </div>
                          <div className='flex-1'>
                            <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                              TARGET AUDIENCE
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {selectedStartup?.target_audience || 'N/A'}
                            </div>
                          </div>
                        </li>

                        {/* USP/MOAT */}
                        <li className='flex space-x-3 rtl:space-x-reverse'>
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:light-bulb' />
                          </div>
                          <div className='flex-1'>
                            <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                              USP/MOAT
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {showFullUSP
                                ? selectedStartup?.usp_moat
                                : `${selectedStartup?.usp_moat?.slice(
                                    0,
                                    100
                                  )}...`}
                              {selectedStartup?.usp_moat?.length > 100 && (
                                <button
                                  onClick={() => setShowFullUSP(!showFullUSP)}
                                  className='text-blue-600 hover:underline ml-2'
                                >
                                  {showFullUSP ? 'Read less' : 'Read more'}
                                </button>
                              )}
                            </div>
                          </div>
                        </li>

                        {/* Website */}
                        <li className='flex space-x-3 rtl:space-x-reverse'>
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:globe-alt' />
                          </div>
                          <div className='flex-1'>
                            <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                              WEBSITE
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              <a
                                href={selectedStartup?.company_website}
                                className='text-blue-600 hover:underline'
                                target='_blank'
                                rel='noopener noreferrer'
                              >
                                {selectedStartup?.company_website || 'N/A'}
                              </a>
                            </div>
                          </div>
                        </li>

                        {/* LinkedIn Profile */}
                        <li className='flex space-x-3 rtl:space-x-reverse'>
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:link' />
                          </div>
                          <div className='flex-1'>
                            <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                              LINKEDIN PROFILE
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              <a
                                href={selectedStartup?.linkedin_profile}
                                className='text-blue-600 hover:underline'
                                target='_blank'
                                rel='noopener noreferrer'
                              >
                                {selectedStartup?.linkedin_profile || 'N/A'}
                              </a>
                            </div>
                          </div>
                        </li>

                        {/* Media Presence */}
                        <li className='flex space-x-3 rtl:space-x-reverse'>
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:document' />
                          </div>
                          <div className='flex-1'>
                            <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                              MEDIA PRESENCE
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {selectedStartup?.media || 'N/A'}
                            </div>
                          </div>
                        </li>

                        {/* Social Media Handles */}
                        {selectedStartup?.social_media_handles?.map(
                          (handle, index) => (
                            <li
                              className='flex space-x-3 rtl:space-x-reverse'
                              key={index}
                            >
                              <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                <Icon icon='heroicons:share' />
                              </div>
                              <div className='flex-1'>
                                <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                  {handle.platform || 'Not provided'}
                                </div>
                                <a
                                  href={handle.url || '#'}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='text-base text-slate-600 dark:text-slate-50'
                                >
                                  {handle.url || 'Not provided'}
                                </a>
                              </div>
                            </li>
                          )
                        )}

                        {/* Media Presence Links */}
                        <h3 className='text-lg font-semibold text-slate-700 dark:text-slate-200'>
                          Media Presence Links
                        </h3>
                        {selectedStartup?.media_presence?.map(
                          (presence, index) => (
                            <li
                              className='flex space-x-3 rtl:space-x-reverse'
                              key={index}
                            >
                              <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                <Icon icon='heroicons:newspaper' />
                              </div>
                              <div className='flex-1'>
                                <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                  {presence.platform || 'Not provided'}
                                </div>
                                <a
                                  href={presence.url || '#'}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='text-base text-slate-600 dark:text-slate-50'
                                >
                                  {presence.url || 'Not provided'}
                                </a>
                              </div>
                            </li>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'founderInfo' && (
                <div className='space-y-3'>
                  <h3 className='text-2xl font-bold mb-6'>Founder Details</h3>
                  <div className='grid gap-2 md:gap-3 lg:gap-4 text-gray-700'>
                    {/* Founder Name */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:user' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          FOUNDER NAME
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.founder_information?.founder_name ||
                            'Not provided'}
                        </div>
                      </div>
                    </li>

                    {/* Founder Email */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:envelope' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          FOUNDER EMAIL
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.founder_information
                            ?.founder_email || 'Not provided'}
                        </div>
                      </div>
                    </li>

                    {/* Founder Mobile */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:phone' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          FOUNDER MOBILE
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.founder_information
                            ?.founder_mobile || 'Not provided'}
                        </div>
                      </div>
                    </li>

                    {/* Founder LinkedIn */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:link' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          FOUNDER LINKEDIN
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          <a
                            href={
                              selectedStartup?.founder_information
                                ?.founder_linkedin
                            }
                            className='text-blue-600 hover:underline'
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {selectedStartup?.founder_information
                              ?.founder_linkedin || 'Not provided'}
                          </a>
                        </div>
                      </div>
                    </li>

                    {/* College Name */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:building-library' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          COLLEGE NAME
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.founder_information?.college_name ||
                            'Not provided'}
                        </div>
                      </div>
                    </li>

                    {/* Graduation Year */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:calendar' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          GRADUATION YEAR
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.founder_information
                            ?.graduation_year || 'Not provided'}
                        </div>
                      </div>
                    </li>

                    {/* Advisors Section */}
                    {selectedStartup?.founder_information?.advisors?.map(
                      (advisor, index) => (
                        <li
                          key={index}
                          className='flex space-x-3 rtl:space-x-reverse'
                        >
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:user-group' />
                          </div>
                          <div className='flex-1'>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {`Advisor Name: ${
                                advisor.advisor_name || 'Not provided'
                              }`}
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {`Advisor Email: ${
                                advisor.advisor_email || 'Not provided'
                              }`}
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {`Advisor Mobile: ${
                                advisor.advisor_mobile || 'Not provided'
                              }`}
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {`Advisor LinkedIn: ${
                                advisor.advisor_linkedin || 'Not provided'
                              }`}
                            </div>
                          </div>
                        </li>
                      )
                    )}

                    {/* Co-Founders Section */}
                    {selectedStartup?.founder_information?.co_founders?.map(
                      (coFounder, index) => (
                        <li
                          key={index}
                          className='flex space-x-3 rtl:space-x-reverse'
                        >
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:user-group' />
                          </div>
                          <div className='flex-1'>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {`Co-Founder Name: ${
                                coFounder.co_founder_name || 'Not provided'
                              }`}
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {`Co-Founder Email: ${
                                coFounder.co_founder_email || 'Not provided'
                              }`}
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {`Co-Founder Mobile: ${
                                coFounder.co_founder_mobile || 'Not provided'
                              }`}
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {`Co-Founder LinkedIn: ${
                                coFounder.co_founder_linkedin || 'Not provided'
                              }`}
                            </div>
                          </div>
                        </li>
                      )
                    )}

                    {/* Co-Founder Agreement */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          CO-FOUNDER AGREEMENT
                        </div>
                        <a
                          href={
                            selectedStartup?.founder_information
                              ?.co_founder_agreement || '#'
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-600 hover:underline'
                        >
                          {selectedStartup?.founder_information
                            ?.co_founder_agreement
                            ? 'View Technology Roadmap'
                            : 'Not provided'}
                        </a>
                      </div>
                    </li>
                  </div>
                </div>
              )}

              {activeTab === 'CTO_info' && (
                <div className='space-y-3'>
                  <h3 className='text-2xl font-bold mb-6'>CTO Details</h3>
                  <div className='grid gap-2 md:gap-3 lg:gap-4 text-gray-700'>
                    {/* CTO Name */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:user' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          CTO NAME
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.CTO_info?.cto_name ||
                            'Not provided'}
                        </div>
                      </div>
                    </li>

                    {/* CTO Email */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:envelope' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          EMAIL
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.CTO_info?.cto_email ||
                            'Not provided'}
                        </div>
                      </div>
                    </li>

                    {/* CTO Mobile */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:phone' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          MOBILE NUMBER
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.CTO_info?.cto_mobile ||
                            'Not provided'}
                        </div>
                      </div>
                    </li>

                    {/* CTO LinkedIn */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:link' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          LINKEDIN PROFILE
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          <a
                            href={
                              selectedStartup?.CTO_info?.cto_linkedin || '#'
                            }
                            className='text-blue-600 hover:underline'
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {selectedStartup?.CTO_info?.cto_linkedin ||
                              'Not provided'}
                          </a>
                        </div>
                      </div>
                    </li>

                    {/* Tech Team Size */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:users' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          TECH TEAM SIZE
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.CTO_info?.tech_team_size ||
                            'Not provided'}
                        </div>
                      </div>
                    </li>

                    {/* Mobile App Link (iOS) */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:link' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          MOBILE APP LINK (iOS)
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          <a
                            href={
                              selectedStartup?.CTO_info?.mobile_app_link_ios ||
                              '#'
                            }
                            className='text-blue-600 hover:underline'
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {selectedStartup?.CTO_info?.mobile_app_link_ios ||
                              'Not provided'}
                          </a>
                        </div>
                      </div>
                    </li>

                    {/* Mobile App Link (Android) */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:link' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          MOBILE APP LINK (Android)
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          <a
                            href={
                              selectedStartup?.CTO_info
                                ?.mobile_app_link_android || '#'
                            }
                            className='text-blue-600 hover:underline'
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {selectedStartup?.CTO_info
                              ?.mobile_app_link_android || 'Not provided'}
                          </a>
                        </div>
                      </div>
                    </li>

                    {/* Technology Roadmap */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          TECHNOLOGY ROADMAP
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          <a
                            href={
                              selectedStartup?.CTO_info?.technology_roadmap ||
                              '#'
                            }
                            className='text-blue-600 hover:underline'
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {selectedStartup?.CTO_info?.technology_roadmap
                              ? 'View Technology Roadmap'
                              : 'Not provided'}
                          </a>
                        </div>
                      </div>
                    </li>
                  </div>
                </div>
              )}

              {activeTab === 'businessDetails' && (
                <div className='space-y-3'>
                  <h3 className='text-2xl font-bold mb-6'>Business Details</h3>
                  <div className='grid gap-2 md:gap-3 lg:gap-4 text-gray-700'>
                    {/* Current Traction */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:presentation-chart-line' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          CURRENT TRACTION
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.business_details
                            ?.current_traction || 'N/A'}
                        </div>
                      </div>
                    </li>

                    {/* New Customers */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:user-plus' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          HOW MANY NEW CUSTOMERS YOU OBTAINED IN THE LAST 6
                          MONTHS?
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.business_details?.new_Customers ||
                            'N/A'}
                        </div>
                      </div>
                    </li>

                    {/* Customer Acquisition Cost */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:banknotes' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          WHAT IS YOUR CUSTOMER ACQUISITION COST?
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.business_details
                            ?.customer_AcquisitionCost || 'N/A'}
                        </div>
                      </div>
                    </li>

                    {/* Customer Lifetime Value */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:currency-dollar' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          WHAT IS THE LIFETIME VALUE OF YOUR CUSTOMER?
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.business_details
                            ?.customer_Lifetime_Value || 'N/A'}
                        </div>
                      </div>
                    </li>
                  </div>
                </div>
              )}

              {activeTab === 'fundingInfo' && (
                <div className='space-y-3'>
                  <h3 className='text-2xl font-bold mb-6'>
                    Funding Information
                  </h3>
                  <div className='grid gap-2 md:gap-3 lg:gap-4 text-gray-700'>
                    {/* Total Funding Ask */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:currency-dollar' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          TOTAL FUNDING ASK
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.funding_information
                            ?.total_funding_ask || 'N/A'}
                        </div>
                      </div>
                    </li>

                    {/* Amount Committed */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:banknotes' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          AMOUNT COMMITTED
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.funding_information
                            ?.amount_committed || 'N/A'}
                        </div>
                      </div>
                    </li>

                    {/* Government Grants */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:clipboard-document-check' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          GOVERNMENT GRANTS
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.funding_information
                            ?.government_grants || 'N/A'}
                        </div>
                      </div>
                    </li>

                    {/* Equity Split */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:chart-pie' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          EQUITY SPLIT
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.funding_information?.equity_split ||
                            'N/A'}
                        </div>
                      </div>
                    </li>

                    {/* Fund Utilization */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document-text' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          FUND UTILIZATION
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.funding_information
                            ?.fund_utilization || 'N/A'}
                        </div>
                      </div>
                    </li>

                    {/* ARR */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:chart-bar' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          ARR
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.funding_information?.arr || 'N/A'}
                        </div>
                      </div>
                    </li>

                    {/* MRR */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:chart-bar' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          MRR
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.funding_information?.mrr || 'N/A'}
                        </div>
                      </div>
                    </li>

                    {/* Current Cap Table */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          CURRENT CAP TABLE
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.funding_information
                            ?.current_cap_table ? (
                            <a
                              href={
                                selectedStartup?.funding_information
                                  ?.current_cap_table || '#'
                              }
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-blue-600 hover:underline'
                            >
                              View Document
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </div>
                      </div>
                    </li>

                    {/* Previous Funding Information */}
                    <div className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:banknotes' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 leading-[12px] mb-4'>
                          PREVIOUS FUNDING INFORMATION
                        </div>
                        <div className='overflow-x-auto'>
                          <div className='inline-block min-w-full align-middle'>
                            <div className='overflow-hidden'>
                              <table className='min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700'>
                                <thead className='bg-slate-200 dark:bg-slate-700'>
                                  <tr>
                                    <th scope='col' className='table-th'>
                                      Investor Name
                                    </th>
                                    <th scope='col' className='table-th'>
                                      Firm Name
                                    </th>
                                    <th scope='col' className='table-th'>
                                      Investor Type
                                    </th>
                                    <th scope='col' className='table-th'>
                                      Amount Raised
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className='bg-white divide-y divide-slate-100 dark:bg-slate-900 dark:divide-slate-700'>
                                  {selectedStartup?.funding_information?.previous_funding?.map(
                                    (funding, index) => (
                                      <tr key={index}>
                                        <td className='table-td'>
                                          {funding.investorName ||
                                            'Not provided'}
                                        </td>
                                        <td className='table-td'>
                                          {funding.firmName || 'Not provided'}
                                        </td>
                                        <td className='table-td'>
                                          {funding.investorType ||
                                            'Not provided'}
                                        </td>
                                        <td className='table-td'>
                                          {funding.amountRaised
                                            ? `$${funding.amountRaised}`
                                            : 'Not provided'}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cap Table */}
                    <div className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 leading-[12px] mb-3'>
                          CAP TABLE
                        </div>
                        <div className='overflow-x-auto'>
                          <div className='inline-block min-w-full align-middle'>
                            <div className='overflow-hidden'>
                              <table className='min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700'>
                                <thead className='bg-slate-200 dark:bg-slate-700'>
                                  <tr>
                                    <th scope='col' className='table-th'>
                                      Designation
                                    </th>
                                    <th scope='col' className='table-th'>
                                      Name
                                    </th>
                                    <th scope='col' className='table-th'>
                                      Percentage
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className='bg-white divide-y divide-slate-100 dark:bg-slate-900 dark:divide-slate-700'>
                                  {selectedStartup?.funding_information?.cap_table?.map(
                                    (entry, index) => (
                                      <tr key={index}>
                                        <td className='table-td'>
                                          {entry.designation ||
                                            'Designation not specified'}
                                        </td>
                                        <td className='table-td'>
                                          {entry.firstName ||
                                            'Name not specified'}
                                        </td>
                                        <td className='table-td'>
                                          {entry.percentage
                                            ? `${entry.percentage}%`
                                            : 'Not provided'}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'companyDocuments' && (
                <div className='space-y-3'>
                  <h3 className='text-2xl font-bold mb-6'>Company Documents</h3>
                  <div className='grid gap-2 md:gap-3 lg:gap-4 text-gray-700'>
                    {renderDocumentLink(
                      'Certificate of Incorporation',
                      selectedStartup?.company_documents[0]
                        ?.certificate_of_incorporation
                    )}
                    {renderDocumentLink(
                      'GST Certificate',
                      selectedStartup?.company_documents[0]?.gst_certificate
                    )}
                    {renderDocumentLink(
                      'Trademark',
                      selectedStartup?.company_documents[0]?.trademark
                    )}
                    {renderDocumentLink(
                      'Copyright',
                      selectedStartup?.company_documents[0]?.copyright
                    )}
                    {renderDocumentLink(
                      'Patent',
                      selectedStartup?.company_documents[0]?.patent
                    )}
                    {renderDocumentLink(
                      'Startup India Certificate',
                      selectedStartup?.company_documents[0]
                        ?.startup_india_certificate
                    )}
                    {renderDocumentLink(
                      'Due Diligence Report',
                      selectedStartup?.company_documents[0]
                        ?.due_diligence_report
                    )}
                    {renderDocumentLink(
                      'Business Valuation Report',
                      selectedStartup?.company_documents[0]
                        ?.business_valuation_report
                    )}
                    {renderDocumentLink(
                      'MIS',
                      selectedStartup?.company_documents[0]?.mis
                    )}
                    {renderDocumentLink(
                      'Financial Projections',
                      selectedStartup?.company_documents[0]
                        ?.financial_projections
                    )}
                    {renderDocumentLink(
                      'Balance Sheet',
                      selectedStartup?.company_documents[0]?.balance_sheet
                    )}
                    {renderDocumentLink(
                      'P&L Statement',
                      selectedStartup?.company_documents[0]?.pl_statement
                    )}
                    {renderDocumentLink(
                      'Cashflow Statement',
                      selectedStartup?.company_documents[0]?.cashflow_statement
                    )}
                    {renderDocumentLink(
                      'Pitch Deck',
                      selectedStartup?.company_documents[0]?.pitch_deck
                    )}
                    {renderDocumentLink(
                      'Video Pitch',
                      selectedStartup?.company_documents[0]?.video_pitch
                    )}
                    {renderDocumentLink(
                      'SHA (Previous/Existing Round)',
                      selectedStartup?.company_documents[0]?.sha
                    )}
                    {renderDocumentLink(
                      'Termsheet (Previous/Existing Round)',
                      selectedStartup?.company_documents[0]?.termsheet
                    )}
                    {renderDocumentLink(
                      'Employment Agreement',
                      selectedStartup?.company_documents[0]
                        ?.employment_agreement
                    )}
                    {renderDocumentLink(
                      'MoU',
                      selectedStartup?.company_documents[0]?.mou
                    )}
                    {renderDocumentLink(
                      'NDA',
                      selectedStartup?.company_documents[0]?.nda
                    )}
                  </div>
                </div>
              )}

{activeTab === 'Documents' && (
  <DocumentViewer
    startupId={selectedStartup.id}
    allowedDocumentTypes={seriesWiseDocuments}
  />
)}


            </div>
          </div>
        )}
      </Modal>
    );

} 


export default FounderInfoModal;