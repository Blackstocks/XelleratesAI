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
import { toast } from 'react-toastify';

const SendReportButton = () => {
  const { user, details } = useUserDetails();
  const [message, setMessage] = useState('');

  const handleSendReport = async () => {
    setMessage('');
    if (
      details?.type === 'startup' &&
      !details?.founderInformation?.founder_email
    ) {
      toast.error('Email not found', {
        position: 'top-right',
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      });
      return;
    } else if (details?.type === 'investor' && !user?.email) {
      toast.error('Email not found', {
        position: 'top-right',
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      });
    }

    const toastId = toast.loading('Sending report...', {
      position: 'top-right',
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'light',
    });

    try {
      const email =
        details?.type === 'startup'
          ? details?.founderInformation?.founder_email
          : user?.email;
      console.log(email);
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.update(toastId, {
          render: 'Report sent successfully',
          type: 'success',
          isLoading: false,
          autoClose: 1500,
        });
      } else {
        toast.update(toastId, {
          render: `Error: ${data.error}`,
          type: 'error',
          isLoading: false,
          autoClose: 1500,
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: `Error: ${error.message}`,
        type: 'error',
        isLoading: false,
        autoClose: 1500,
      });
    }
  };

  return (
    <div>
      <button onClick={handleSendReport}>Send Report</button>
      {message && <p>{message}</p>}
    </div>
  );
};
export default SendReportButton;
