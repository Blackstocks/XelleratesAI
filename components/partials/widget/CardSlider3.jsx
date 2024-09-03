"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseclient';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards } from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-cards';

const CardSlider3 = ({ profileId }) => {
  const [cardData, setCardData] = useState([]);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const { data, error } = await supabase
          .from('wallet_payments')
          .select('mode_of_payment, price')
          .eq('startup_id', profileId);

        if (error) {
          console.error('Error fetching payment data:', error.message);
          return;
        }

        if (data && data.length > 0) {
          // Group payments by mode_of_payment and calculate total sum for each
          const paymentSums = data.reduce((acc, payment) => {
            const { mode_of_payment, price } = payment;
            if (mode_of_payment) {
              acc[mode_of_payment] = (acc[mode_of_payment] || 0) + (price || 0);
            }
            return acc;
          }, {});

          // Assign different colors to each card based on mode_of_payment
          const colors = {
            UPI: 'from-[#1EABEC] to-[#3B82F6]', // Example colors
            Paytm: 'from-[#4C33F7] to-[#801FE0]',
            NEFT: 'from-[#FF9838] to-[#F97316]',
            Netbanking: 'from-[#008773] to-[#10B981]',
            Card: 'from-[#E11D48] to-[#F43F5E]', 
          };

          const cards = Object.keys(paymentSums).map((mode, index) => ({
            bg: colors[mode] || 'from-[#1EABEC] to-[#3B82F6]', // Default color if mode not in predefined
            cardNo: mode,
            investmentAmount: paymentSums[mode],
          }));

          setCardData(cards);
        } else {
          setCardData([]);
        }
      } catch (error) {
        console.error('Unexpected error fetching payment data:', error.message);
      }
    };

    if (profileId) {
      fetchPaymentData();
    }
  }, [profileId]);

  if (cardData.length === 0) {
    return <p className="text-center text-gray-500">No payment methods available.</p>;
  }

  return (
    <div className='relative'>
      <Swiper effect={'cards'} grabCursor={true} modules={[EffectCards]}>
        {cardData.map((item, i) => (
          <SwiperSlide key={i}>
            <div
              className={`${item.bg} h-[200px] bg-gradient-to-r relative rounded-md z-[1] p-4 text-white`}
            >
              <div className='mt-[18px] font-semibold text-2xl mb-[17px] text-center'>
                {item.cardNo}
              </div>
              <div className='text-lg text-opacity-75 mb-[2px] text-center'>
                Investment Amount
              </div>
              <div className='text-2xl font-semibold text-center'>
                ${item.investmentAmount}
              </div>
              <div className='text-sm text-center absolute bottom-3 left-1/2 transform -translate-x-1/2'>
                Swipe for more
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CardSlider3;
