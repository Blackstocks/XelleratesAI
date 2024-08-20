import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';
import Modal from '@/components/Modal'; // Assuming you have a Modal component

const InvestorsList = () => {
  const [investors, setInvestors] = useState([]);
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchInvestors = async () => {
      const { data, error } = await supabase
        .from('investor_signup')
        .select('id, name, email, company_name');
      if (error) {
        console.error(error);
      } else {
        setInvestors(data);
      }
    };
    fetchInvestors();
  }, []);

  const handleInvestorClick = (investor) => {
    setSelectedInvestor(investor);
    setModalOpen(true);
  };

  return (
    <div>
      <h2>Investors</h2>
      <ul>
        {investors.map((investor) => (
          <li key={investor.id} onClick={() => handleInvestorClick(investor)}>
            {investor.name} ({investor.company_name})
          </li>
        ))}
      </ul>

      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <StartupSelectionModal investor={selectedInvestor} onClose={() => setModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
};

export default InvestorsList;
