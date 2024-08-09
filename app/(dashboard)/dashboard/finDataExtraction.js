import React, { useState, useEffect } from 'react';
import useCompleteUserDetails from '@/hooks/useCompleteUserDetails';

const FinancialComponent = () => {
  const [state, setState] = useState(null);
  const { companyDocuments } = useCompleteUserDetails();
  const [financials, setFinancials] = useState([]);

  useEffect(() => {
    if (companyDocuments?.mis) {
        console.log("MIS FILE PRESENT");
        exec(`python finDataExtraction.py`, (error, stdout, stderr) => {
            if (error) {
              console.error(`Error executing script: ${error.message}`);
              return;
            }
            if (stderr) {
              console.error(`Script error: ${stderr}`);
              return;
            }
            console.log(`Script output: ${stdout}`);
          });

        fetch('/Users/kush/Files/Data_Science/Intern/Xellerates/XelleratesAI/app/(dashboard)/dashboard/output.json')
            .then(response => response.json())
            .then(data => setFinancials(data.financials))
            .catch(error => console.error('Error fetching financial data:', error));
        
    }
  }, [companyDocuments]);
  

  return <div>{state ? JSON.stringify(state) : 'Loading...'}</div>;
};

export default FinancialComponent;