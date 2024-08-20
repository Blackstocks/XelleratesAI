import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/partials/Modal/docModal';
import { Controller, useForm } from 'react-hook-form';
import ReactSelect from 'react-select';
import makeAnimated from 'react-select/animated';
import Icon from '@/components/ui/Icon';
import useUserDetails from '@/hooks/useUserDetails';

const animatedComponents = makeAnimated();

const documentTypeOptions = [
  { value: 'co_founder_agreement', label: 'Co-Founder Agreement' },
  { value: 'technology_roadmap', label: 'Technology Roadmap' },
  {
    value: 'certificate_of_incorporation',
    label: 'Certificate of Incorporation',
  },
  { value: 'gst_certificate', label: 'GST Certificate' },
  { value: 'trademark', label: 'Trademark' },
  { value: 'copyright', label: 'Copyright' },
  { value: 'patent', label: 'Patent' },
  { value: 'startup_india_certificate', label: 'Startup India Certificate' },
  { value: 'due_diligence_report', label: 'Due Diligence Report' },
  { value: 'business_valuation_report', label: 'Business Valuation Report' },
  { value: 'mis', label: 'MIS (Management Information System)' },
  { value: 'financial_projections', label: 'Financial Projections' },
  { value: 'balance_sheet', label: 'Balance Sheet' },
  { value: 'pl_statement', label: 'Profit & Loss Statement' },
  { value: 'cashflow_statement', label: 'Cashflow Statement' },
  { value: 'pitch_deck', label: 'Pitch Deck' },
  { value: 'video_pitch', label: 'Video Pitch' },
  { value: 'sha', label: "Shareholders' Agreement (SHA)" },
  { value: 'termsheet', label: 'Term Sheet' },
  { value: 'employment_agreement', label: 'Employment Agreement' },
  { value: 'mou', label: 'Memorandum of Understanding (MOU)' },
  { value: 'nda', label: 'Non-Disclosure Agreement (NDA)' },
];

const DocumentSubmissionModal = ({ id }) => {
  //   console.log('id', id);
  // Ensure `id` is passed as a prop
  const { user } = useUserDetails();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();
  const [buttonText, setButtonText] = useState('Submit');
  const [isLoading, setIsLoading] = useState(false);

  const handleDocumentSubmit = async (data) => {
    const investorId = user?.id;
    const startupId = id; // Ensure correct extraction of the startup ID

    try {
      setIsLoading(true); // Start loading state

      // Map the selected document types to include both value and label
      const documents = data.documentType.map((option) => ({
        value: option.value,
        label: option.label,
      }));

      const response = await fetch('/api/request-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          investorId,
          startupId,
          documents, // Send the documents array with both value and label
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong!');
      }

      console.log('Document request submitted successfully:', result.message);

      setIsLoading(false); // Stop loading state
      setButtonText('Submitted'); // Change button text to "Submitted"
    } catch (error) {
      console.error('Error submitting document request:', error.message);
      setIsLoading(false); // Stop loading state
    }
  };

  return (
    <Modal
      title='Request Document'
      label='Request Document'
      labelClass='btn-outline-dark flex justify-between'
      onClick={() => setIsModalOpen(true)}
      uncontrol
      footerContent={
        <Button
          text={isLoading ? 'Submitting...' : buttonText}
          className='btn-dark'
          onClick={handleSubmit(handleDocumentSubmit)}
        />
      }
    >
      <div className='w-25 text-base text-slate-600 dark:text-slate-300'>
        <div className='mb-4 '>
          <label
            className='form-label block uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'
            htmlFor='documentType'
          >
            <Icon
              icon='heroicons:document-text'
              className='inline-block mr-1 text-xl mb-2'
            />
            Request a Document
          </label>
          <Controller
            name='documentType'
            control={control}
            defaultValue={[]} // Ensure default value is an empty array for a multi-select
            render={({ field }) => {
              return (
                <ReactSelect
                  {...field}
                  isMulti
                  isClearable={false}
                  closeMenuOnSelect={false}
                  components={animatedComponents}
                  options={documentTypeOptions}
                  className='react-select'
                  value={documentTypeOptions.filter((option) =>
                    field.value.some(
                      (selectedValue) => selectedValue.value === option.value
                    )
                  )}
                  onChange={(selectedOptions) =>
                    field.onChange(
                      selectedOptions.map((option) => ({
                        value: option.value,
                        label: option.label,
                      }))
                    )
                  }
                />
              );
            }}
          />

          {errors.documentType && (
            <p className='text-red-500 text-xs italic'>
              {errors.documentType.message}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DocumentSubmissionModal;
