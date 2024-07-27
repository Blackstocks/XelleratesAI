import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useSelector, useDispatch } from 'react-redux';
import { toggleAddModal, pushProject } from './store';
import Textinput from '@/components/ui/Textinput';
import FileInput from '@/components/ui/Fileinput';
import { useForm } from 'react-hook-form';
import {
  handleInvestorFileUpload,
  insertInvestorDocuments,
} from '@/lib/actions/investorActions';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';
import { toast } from 'react-toastify';

const AddProject = ({ fetchDocuments }) => {
  const { profile, investorSignup } = useCompleteUserDetails();
  const { openProjectModal } = useSelector((state) => state.project);
  const dispatch = useDispatch();
  const userId = profile?.id;
  const investorName = investorSignup?.name;

  const { register, handleSubmit, reset } = useForm();
  const [selectedFiles, setSelectedFiles] = useState({});

  const handleFileChange = (e, name) => {
    const files = e.target.files;
    setSelectedFiles((prevFiles) => ({
      ...prevFiles,
      [name]: files.length > 1 ? Array.from(files) : files[0],
    }));
  };

  const onSubmit = async (data) => {
    const companyName = data.companyName;
    const formData = { companyName };
    const uploadFile = async (file, name) => {
      if (file) {
        const url = await handleInvestorFileUpload(
          file,
          companyName,
          name,
          investorName
        );
        formData[name] = url;
      }
    };

    for (const key in selectedFiles) {
      await uploadFile(selectedFiles[key], key);
    }

    const insertedData = await insertInvestorDocuments(formData, userId);

    if (!insertedData.error) {
      dispatch(pushProject(insertedData));
      dispatch(toggleAddModal(false));
      // toast.info('Added Successfully', {
      //   position: 'top-right',
      //   autoClose: 1500,
      //   hideProgressBar: false,
      //   closeOnClick: true,
      //   pauseOnHover: true,
      //   draggable: true,
      //   progress: undefined,
      //   theme: 'dark',
      // });
      reset();
      setSelectedFiles({});
      fetchDocuments(); // Refetch documents after successful submission
    } else {
      // Add error handling here
      toast.error('Add Failed', {
        position: 'top-right',
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });
    }
  };

  const fileInputs = [
    { name: 'companyLogo', label: 'Company Logo' },
    { name: 'nda', label: 'NDA' },
    { name: 'termsheet', label: 'Termsheet' },
    { name: 'transactionDocuments', label: 'Transaction Documents' },
    {
      name: 'shareSubscriptionAgreement',
      label: 'Share Subscription Agreement',
    },
    { name: 'shareHolderAgreement', label: 'Share Holder Agreement' },
    { name: 'sharePurchaseAgreement', label: 'Share Purchase Agreement' },
    {
      name: 'conditionsPrecedentDocuments',
      label: 'Conditions Precedent Documents',
    },
    { name: 'closingDocuments', label: 'Closing Documents' },
    { name: 'csDocuments', label: 'CS Documents' },
    { name: 'dueDiligenceReport', label: 'Due-Diligence Report' },
    { name: 'misQuarterly', label: 'MIS Quarterly' },
    { name: 'misAnnually', label: 'MIS Annually' },
    { name: 'balanceSheet', label: 'Balance Sheet' },
    { name: 'plStatement', label: 'P&L Statement' },
    { name: 'cashflowStatement', label: 'Cashflow Statement' },
    { name: 'auditedFinancials', label: 'Audited Financials' },
    { name: 'valuationReport', label: 'Valuation Report' },
    { name: 'boardMeetings', label: 'Board Meetings' },
    { name: 'shareholdersMeetings', label: 'Shareholders Meetings' },
    { name: 'boardResolutions', label: 'Board Resolutions' },
  ];

  return (
    <Modal
      className='max-w-none'
      title='Add Documents'
      activeModal={openProjectModal}
      onClose={() => dispatch(toggleAddModal(false))}
    >
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 p-4'>
        <div className=''>
          <Textinput
            className='w-full md:w-fit'
            name='companyName'
            label='Company Name'
            placeholder='Enter Company Name'
            register={register}
          />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {fileInputs.map((input) => (
            <div key={input.name} className='w-full'>
              <FileInput
                name={input.name}
                label={input.label}
                onChange={(e) => handleFileChange(e, input.name)}
                selectedFile={selectedFiles[input.name]}
                register={register}
              />
            </div>
          ))}
        </div>
        <div className='text-right'>
          <button type='submit' className='btn btn-dark'>
            Submit
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddProject;
