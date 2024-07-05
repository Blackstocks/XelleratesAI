// 'use client';

// import React from 'react';

// const DownloadReportButton = () => {
//   const handleDownload = async () => {
//     try {
//       const response = await fetch('/api/generate-report');
//       if (!response.ok) {
//         throw new Error('Failed to fetch the PDF document');
//       }
//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = 'Startup_Evaluation_Report.pdf';
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//     } catch (error) {
//       console.error('Error downloading the PDF:', error);
//     }
//   };

//   return (
//     <button onClick={handleDownload}>
//       Evaluate my startup
//     </button>
//   );
// };

// export default DownloadReportButton;

'use client';

import React, { useState } from 'react';
import useUserDetails from '@/hooks/useUserDetails';

const SendReportButton = () => {
  const { details } = useUserDetails();
  const [message, setMessage] = useState('');
  console.log(details?.founderInformation?.founder_email);

  const handleSendReport = async () => {
    setMessage('');

    if (!details?.founderInformation?.founder_email) {
      setMessage('Founder Email not found');
      return;
    }

    const response = await fetch('/api/generate-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: details?.founderInformation?.founder_email,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage('Report sent successfully');
    } else {
      setMessage(`Error: ${data.error}`);
    }
  };

  return (
    <div>
      <button onClick={handleSendReport}> Evaluate my startup</button>
      {message && <p>{message}</p>}
    </div>
  );
};
export default SendReportButton;
