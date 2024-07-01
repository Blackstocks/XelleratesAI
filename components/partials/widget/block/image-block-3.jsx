import useUserDetails from '@/hooks/useUserDetails';

const ImageBlock3 = () => {
  const { user, details, loading } = useUserDetails();
  return (
    <div
      className='bg-no-repeat bg-cover bg-center p-5 rounded-[6px] relative'
      style={{
        backgroundImage: `url(/assets/images/all-img/widget-bg-3.png)`,
      }}
    >
      <div>
        <h4 className='text-xl font-medium text-white mb-2'>
          <span className='block font-normal'>Evaluate your business</span>
        </h4>
        <p className='text-sm text-white font-normal'>In only 3 min you can evaluate your company and recieve a report within 24 hours</p>
      </div>
    </div>
  );
};

export default ImageBlock3;
