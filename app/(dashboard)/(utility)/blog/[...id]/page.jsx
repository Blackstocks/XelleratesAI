'use client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textinput from '@/components/ui/Textinput';
import Textarea from '@/components/ui/Textarea';
import Icon from '@/components/ui/Icon';
import Link from 'next/link';
import Sidebar from '@/components/partials/blog/Sidebar';

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
];

const BlogDetailsPage = () => {
  return (
    <div>
      <div className='lg:flex flex-wrap blog-posts lg:space-x-5 space-y-5 lg:space-y-0 rtl:space-x-reverse'>
        <div className='flex-none'>
          <div className='lg:max-w-[360px]'>
            <Card>
              <Sidebar />
            </Card>
          </div>
        </div>
        <div className='flex-1'>
          <div className='grid grid-cols-1 gap-5'>
            <Card>
              <div className=' h-[248px] w-full mb-6 '>
                <img
                  src={'/assets/images/all-img/post-1.png'}
                  alt=''
                  className=' w-full h-full  object-cover'
                />
              </div>
              <div className='flex justify-between mb-4'>
                <Link href='#'>
                  <span className='inline-flex leading-5 text-slate-500 dark:text-slate-500 text-sm font-normal'>
                    <Icon
                      icon='heroicons-outline:calendar'
                      className='text-slate-400 dark:text-slate-500 ltr:mr-2 rtl:ml-2 text-lg'
                    />
                    10/02/2021
                  </span>
                </Link>
                <div className='flex space-x-4 rtl:space-x-reverse'>
                  <Link href='#'>
                    <span className='inline-flex leading-5 text-slate-500 dark:text-slate-500 text-sm font-normal'>
                      <Icon
                        icon='heroicons-outline:chat'
                        className='text-slate-400 dark:text-slate-500 ltr:mr-2 rtl:ml-2 text-lg'
                      />
                      3
                    </span>
                  </Link>
                  <Link href='#'>
                    <span className='inline-flex leading-5 text-slate-500 dark:text-slate-500 text-sm font-normal'>
                      <Icon
                        icon='heroicons-outline:share'
                        className='text-slate-400 dark:text-slate-500 ltr:mr-2 rtl:ml-2 text-lg'
                      />
                      4
                    </span>
                  </Link>
                </div>
              </div>
              <h5 className='card-title text-slate-900'>
                <Link href='#'>
                  Unlocking Potential: Why Now Is The Ideal Time To Invest In
                  Startups
                </Link>
              </h5>
              <div className='card-text dark:text-slate-300 mt-4 space-y-4 leading-5 text-slate-600 text-sm border-b border-slate-100 dark:border-slate-700 pb-6'>
                <p>
                  In the ever-evolving landscape of investments, the allure of
                  startups continues to captivate seasoned investors and novices
                  alike. While the allure of startups is perennial, the timing
                  of investment plays a pivotal role in reaping optimal returns.
                  In this article, we delve into why now presents an opportune
                  moment to channel your investments into the startup ecosystem
                  and discern the sectors primed for exponential growth.
                </p>
                <p className='font-bold text-base '>
                  1. Resilience Amid Uncertainty
                </p>
                <p>
                  The global economy has weathered unprecedented storms in
                  recent years, grappling with the ramifications of geopolitical
                  tensions, trade disputes, and the far-reaching impact of the
                  COVID-19 pandemic. Despite these challenges, startups have
                  showcased remarkable resilience, leveraging agility and
                  innovation to navigate turbulent waters. According to recent
                  data from CB Insights, global venture capital funding surged
                  to a record high of $288 billion in 2021, underscoring the
                  robust health of the startup ecosystem.
                </p>
                <p className='font-bold text-base '>
                  2. Technological Advancements Fueling Disruption
                </p>
                <p>
                  The relentless march of technological progress has ushered in
                  an era of unprecedented disruption across industries. Emerging
                  technologies such as artificial intelligence, blockchain, and
                  the Internet of Things have transcended the realm of novelty
                  to become integral drivers of business transformation.
                  Startups at the forefront of technological innovation are
                  poised to capitalize on these seismic shifts, offering
                  investors a gateway to exponential growth potential.
                </p>
                <p className='font-bold text-base '>3. ESG Imperative</p>
                <p>
                  The burgeoning emphasis on environmental, social, and
                  governance (ESG) considerations has permeated the investment
                  landscape, catalyzing a seismic shift in investor priorities.
                  In a survey conducted by Deloitte, 88% of global investors
                  revealed that they now consider ESG factors when making
                  investment decisions. Against this backdrop, startups
                  operating in sectors aligned with sustainability, renewable
                  energy, and social impact are poised to attract heightened
                  investor interest and capitalize on the burgeoning demand for
                  ethical investment opportunities.
                </p>
                <p className='font-extrabold text-base '>
                  Identifying Prime Investment Sectors
                </p>
                <p>
                  While the startup ecosystem teems with opportunities across a
                  myriad of sectors, astute investors must exercise discernment
                  in identifying sectors poised for sustained growth and
                  disruption. Here are three sectors that warrant close
                  scrutiny:
                </p>
                <p className='font-bold text-base '>1. Climate Tech:</p>
                <p>
                  With the specter of climate change looming large, the urgency
                  to transition towards sustainable, eco-friendly solutions has
                  never been more pronounced. Climate tech startups are
                  spearheading this transition, harnessing innovation to
                  mitigate carbon emissions, enhance energy efficiency, and
                  facilitate the transition to renewable energy sources.
                  According to data from PitchBook, investments in climate tech
                  reached a record high of $36 billion in 2021, signaling robust
                  investor appetite for solutions addressing the climate crisis.
                </p>
                <p className='font-bold text-base '>
                  2. Healthcare Innovation:
                </p>
                <p>
                  The healthcare landscape stands on the precipice of
                  transformation, propelled by breakthroughs in biotechnology,
                  telemedicine, and digital health solutions. Startups operating
                  in this domain are revolutionizing healthcare delivery,
                  democratizing access to medical services, and pioneering novel
                  therapies to address unmet medical needs. The global digital
                  health market is projected to surpass $600 billion by 2025,
                  offering a fertile ground for investment in disruptive
                  healthcare startups.
                </p>
                <p className='font-bold text-base '>3. FinTech Disruption:</p>
                <p>
                  The financial services industry is undergoing a seismic
                  upheaval, driven by the proliferation of FinTech startups
                  revolutionizing traditional banking, payments, and lending
                  paradigms. From blockchain-powered cryptocurrencies to
                  AI-driven robo-advisors, FinTech startups are democratizing
                  access to financial services, fostering financial inclusion,
                  and streamlining cumbersome processes. According to Statista,
                  global FinTech investment surged to $110 billion in 2021,
                  underscoring the burgeoning investor interest in this dynamic
                  sector.
                </p>
                <p className='font-extrabold text-base '>Conclusion</p>
                <p>
                  In conclusion, the confluence of technological innovation,
                  shifting investor priorities, and societal imperatives has
                  catalyzed a fertile environment for startup investments. By
                  leveraging the transformative potential of sectors such as
                  Climate Tech, Healthcare Innovation, and FinTech Disruption,
                  investors can position themselves at the vanguard of
                  disruption and drive sustainable value creation. The time to
                  invest in startups has never been more auspicious, and by
                  embracing innovation and foresight, investors can unlock
                  untold opportunities for growth and prosperity in the
                  burgeoning startup ecosystem.
                </p>
              </div>
              <div className='mt-6'>
                <ul className='flex items-center space-x-3 rtl:space-x-reverse'>
                  <li className='dark:text-slate-300'>share:</li>
                  <li>
                    <a href='#'>
                      <img src={'/assets/images/svg/tw.svg'} alt='' />
                    </a>
                  </li>
                  <li>
                    <a href='#'>
                      <img src={'/assets/images/svg/fb.svg'} alt='' />
                    </a>
                  </li>
                  <li>
                    <a href='#'>
                      <img src={'/assets/images/svg/ln.svg'} alt='' />
                    </a>
                  </li>
                  <li>
                    <a href='#'>
                      <img src={'/assets/images/svg/ins.svg'} alt='' />
                    </a>
                  </li>
                </ul>
                {/* <ul className='lg:flex items-center lg:space-x-3 lg:rtl:space-x-reverse mt-4 border-b border-slate-100 dark:border-slate-700 pb-6'>
                  <li className='dark:text-slate-300'>Popular tags:</li>
                  {tags.map((item, i) => (
                    <li key={i}>
                      <Link
                        href='#'
                        className='text-xs font-normal text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-600 py-1 px-3 rounded-full hover:bg-slate-900 hover:text-white transition duration-150'
                      >
                        <span>{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul> */}
                <ul className='comments mt-6 space-y-4'>
                  <li className='block'>
                    <div className='flex'>
                      <div className='flex-none'>
                        <div className='h-[56px] w-[56px] rounded-full ltr:mr-6 rtl:ml-6'>
                          <img
                            src={'/assets/images/post/c1.png'}
                            alt=''
                            className='w-full block h-full object-contain rounded-full'
                          />
                        </div>
                      </div>
                      <div className='flex-1'>
                        <div className='flex flex-wrap justify-between mb-2'>
                          <span className='text-slate-600 text-base dark:text-slate-300 font-normal'>
                            Marvin McKinney
                          </span>

                          <span className='text-sm text-slate-500 dark:text-slate-500 flex space-x-1 rtl:space-x-reverse items-center'>
                            <Icon
                              icon='heroicons:clock'
                              className='text-base'
                            />
                            <span>Oct 09, 2021</span>
                          </span>
                        </div>
                        <p className='text-sm text-slate-500 dark:text-slate-400'>
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit, sed do eiusmod tempor incididun ut lab ore et
                          dolore magna aliqua.
                        </p>
                        <div className='mt-2'>
                          <Link
                            href='#'
                            className='flex space-x-2 items-center dark:text-slate-500 text-xs font-medium rtl:space-x-reverse'
                          >
                            <span>Reply</span>
                            <Icon
                              icon='heroicons:arrow-right-20-solid'
                              className='text-lg'
                            />
                          </Link>
                        </div>
                      </div>
                    </div>
                    <ul className='comments mt-4 pl-8'>
                      <li className='block'>
                        <div className='flex'>
                          <div className='flex-none'>
                            <div className='h-[56px] w-[56px] rounded-full ltr:mr-6 rtl:ml-6'>
                              <img
                                src={'/assets/images/post/c2.png'}
                                alt=''
                                className='w-full block h-full object-contain rounded-full'
                              />
                            </div>
                          </div>
                          <div className='flex-1'>
                            <div className='flex flex-wrap justify-between mb-2'>
                              <span className='text-slate-600 text-base dark:text-slate-300 font-normal'>
                                Marvin McKinney
                              </span>

                              <span className='text-sm text-slate-500 dark:text-slate-500 flex space-x-1 items-center rtl:space-x-reverse'>
                                <Icon
                                  icon='heroicons:clock'
                                  className='text-base'
                                />

                                <span>Oct 09, 2021</span>
                              </span>
                            </div>
                            <p className='text-sm text-slate-500 dark:text-slate-400'>
                              Lorem ipsum dolor sit amet, consectetur adipiscing
                              elit, sed do eiusmod tempor incididun ut lab ore
                              et dolore magna aliqua.
                            </p>
                            <div className='mt-2'>
                              <Link
                                href='#'
                                className='flex space-x-2 items-center dark:text-slate-500 text-xs font-medium rtl:space-x-reverse'
                              >
                                <span>Reply</span>
                                <Icon
                                  icon='heroicons:arrow-right-20-solid'
                                  className='text-lg'
                                />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </li>
                  <li className='block'>
                    <div className='flex'>
                      <div className='flex-none'>
                        <div className='h-[56px] w-[56px] rounded-full ltr:mr-6 rtl:ml-6'>
                          <img
                            src={'/assets/images/post/c3.png'}
                            alt=''
                            className='w-full block h-full object-contain rounded-full'
                          />
                        </div>
                      </div>
                      <div className='flex-1'>
                        <div className='flex flex-wrap justify-between mb-2'>
                          <span className='text-slate-600 text-base dark:text-slate-300 font-normal'>
                            Marvin McKinney
                          </span>

                          <span className='text-sm text-slate-500 dark:text-slate-500 flex space-x-1 items-center rtl:space-x-reverse'>
                            <Icon
                              icon='heroicons:clock'
                              className='text-base'
                            />

                            <span>Oct 09, 2021</span>
                          </span>
                        </div>
                        <p className='text-sm text-slate-500 dark:text-slate-400'>
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit, sed do eiusmod tempor incididun ut lab ore et
                          dolore magna aliqua.
                        </p>
                        <div className='mt-2'>
                          <Link
                            href='#'
                            className='flex space-x-2 items-center dark:text-slate-500 text-xs font-medium rtl:space-x-reverse'
                          >
                            <span>Reply</span>
                            <Icon
                              icon='heroicons:arrow-right-20-solid'
                              className='text-lg'
                            />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
                <div className='post-comments bg-slate-100 dark:bg-slate-900 p-6 rounded-md mt-6'>
                  <h4 className='text-lg font-medium text-slate-500 dark:text-slate-100 mb-4'>
                    Leave a comment
                  </h4>
                  <form action='#'>
                    <div className='grid lg:grid-cols-2 grid-cols-1 gap-3'>
                      <div className='lg:col-span-2'>
                        <Textarea
                          label='Comment'
                          placeholder='writte your comment'
                        />
                      </div>
                      <Textinput
                        label='Full name'
                        placeholder='Full name'
                        type='text'
                      />
                      <Textinput
                        label='Email'
                        placeholder='Email Address'
                        type='email'
                      />
                    </div>
                    <div className='text-right'>
                      <Button
                        text='Post comment'
                        type='submit'
                        className=' btn-dark mt-3 '
                      />
                    </div>
                  </form>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailsPage;
