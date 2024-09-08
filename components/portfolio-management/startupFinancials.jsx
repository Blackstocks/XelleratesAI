import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseclient';
import FinancialChart from '@/components/portfolio-management/financialsChart'
import MixedChart from '@/components/partials/chart/appex-chart/Mixed';
import Card from '@/components/ui/Card';

const StartupFinancials = ({ selectedStartup }) => {
  const [stages, setStages] = useState([]);
  const [selectedStage, setSelectedStage] = useState('');
  const [documentsByStage, setDocumentsByStage] = useState({});
  const [misFilePath, setMisFilePath] = useState('');
  const stageOrder = ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D', 'IPO'];

  useEffect(() => {
    if (selectedStartup) {
      fetchStages(selectedStartup.id);
    }
  }, [selectedStartup]);

  const fetchStages = async (sId) => {

    const {data: profileId} = await supabase
        .from('company_profile')
        .select('profile_id')
        .eq('id', sId);

    console.log('profile id: ', profileId[0].profile_id);

    const { data, error } = await supabase
      .from('company_stage_documents')
      .select('*')
      .eq('startup_id', profileId[0].profile_id);
      

    if (error) {
      console.error('Error fetching documents:', error.message);
    } else {
      const grouped = data.reduce((acc, doc) => {
        acc[doc.stage] = doc;
        return acc;
      }, {});

      const sortedStages = Object.keys(grouped).sort(
        (a, b) => stageOrder.indexOf(a) - stageOrder.indexOf(b)
      );

      setStages(sortedStages);
      setDocumentsByStage(grouped);

      // Set default selected stage if available
      if (sortedStages.length > 0) {
        setSelectedStage(sortedStages[0]);
        setMisFilePath(grouped[sortedStages[0]].mis); // Set the initial MIS file path
      }
    }
  };

  
  console.log("startup stages: ", stages);
  const handleStageChange = (event) => {
    const stage = event.target.value;
    setSelectedStage(stage);
    setMisFilePath(documentsByStage[stage]?.mis || ''); // Update the MIS file path when stage changes
  };

  return (
    <div className={`col-span-12 md:col-span-6 relative ${!selectedStartup ? 'filter grayscale opacity-75' : ''}`}>
      {selectedStartup ? (
        <Card title="Financials">
          <div className="flex justify-end mb-4">
            <select
              value={selectedStage}
              onChange={handleStageChange}
              className="border border-gray-300 rounded-md p-2"
            >
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>
          {/* Render FinancialChart with startupId and misFilePath */}
          <FinancialChart 
            startupId={selectedStartup?.id}
            misFilePath={misFilePath}
          />
        </Card>
      ) : (
        <Card title="Financials">
          <MixedChart />
        </Card>
      )}

      {!selectedStartup && (
        <div className="absolute inset-0 flex items-center justify-center text-center text-gray-900 bg-white bg-opacity-90 z-10">
          <span className="font-semibold">Select your portfolio startup to avail this feature</span>
        </div>
      )}
    </div>
  );
};

export default StartupFinancials;
