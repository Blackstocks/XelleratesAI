'use client';

import React from 'react';

const DownloadReportButton = () => {
  const handleDownload = async () => {
    try {
      const response = await fetch('/api/generate-report');
      if (!response.ok) {
        throw new Error('Failed to fetch the PDF document');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Startup_Evaluation_Report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Error downloading the PDF:', error);
    }
  };

  return (
    <button onClick={handleDownload}>
      Startup Evaluation Report
    </button>
  );
};

export default DownloadReportButton;
