import useUserDetails from '@/hooks/useUserDetails';

const ImageBlock4 = () => {
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
          <span className='block font-normal'>Partnership</span>
        </h4>
        <p className='text-sm text-white font-normal'>Get stratergic partnership support to enrich your products and services</p>
      </div>
    </div>
  );
};

export default ImageBlock4;
