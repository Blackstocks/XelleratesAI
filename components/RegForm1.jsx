'use client';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Textinput from '@/components/ui/Textinput';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '@/lib/supabaseclient';
import Dropdowntype from '@/components/ui/Dropdown1';
import InputGroup from '@/components/ui/InputGroup';
import { handleFileUpload } from '@/lib/actions/insertformdetails';
import PasswordInput from "@/components/partials/passwordInput";
import { v4 as uuidv4 } from 'uuid';

const schema = yup.object({
  name: yup.string().required('Name is Required'),
  companyName: yup.string().required('Company Name is required'),
  email: yup.string().email('Invalid email').required('Email is Required'),
  mobile: yup.string().required('Mobile number is Required').matches(/^[0-9]+$/, 'Mobile number must be numeric'),
  password: yup.string().min(8, 'Password must be at least 8 characters').max(20, "Password shouldn't be more than 20 characters").required('Please enter password'),
  confirmpassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match'),
  user_type: yup.string().required('User type is required'),
  linkedinProfile: yup.string().url('Invalid URL').required('LinkedIn profile is required'),
  investor_id: yup.string().required('Investor selection is required'),
}).required();

const RegForm1 = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userType, setUserType] = useState('Select User Type');
  const [investors, setInvestors] = useState([]);
  const [filteredInvestors, setFilteredInvestors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvestor, setSelectedInvestor] = useState('');

  const { register, formState: { errors }, handleSubmit, setValue } = useForm({
    resolver: yupResolver(schema),
    mode: 'all',
  });

  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        const { data: investorsList, error: investorsError } = await supabase
          .from('profiles')
          .select('id, name, email, company_name, company_logo')
          .eq('user_type', 'investor');

        if (investorsError) {
          console.error('Error fetching investors:', investorsError.message);
          toast.error('Error fetching investors.');
          return;
        }

        setInvestors(investorsList);
        setFilteredInvestors(investorsList);
      } catch (err) {
        console.error('Unexpected error fetching investors:', err);
        toast.error('An unexpected error occurred while fetching investors.');
      }
    };

    fetchInvestors();
  }, []);

  const onSubmit = async (data) => {
    console.log('Submitting data:', data);
    setIsSubmitting(true);

    const logoFile = data?.company_logo && data.company_logo.length > 0 ? data.company_logo[0] : null;

    if (!logoFile) {
      toast.error('Please upload a company logo.');
      setIsSubmitting(false);
      return;
    }

    const companyName = data?.companyName || 'not_mentioned';
    const bucket = 'company-logos';

    try {
      const logoUrl = await handleFileUpload(logoFile, bucket, companyName, 'logo');

      if (!logoUrl) {
        console.error('Error: Failed to upload company logo.');
        toast.error('Failed to upload company logo.');
        setIsSubmitting(false);
        return;
      }

      const { data: existingUsers, error: existingUserError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.email);

      if (existingUserError) {
        console.error('Error checking existing users:', existingUserError.message);
        toast.error(existingUserError.message);
        setIsSubmitting(false);
        return;
      }

      if (existingUsers.length > 0) {
        toast.error('User already registered with this email');
        setIsSubmitting(false);
        return;
      }

      const userId = uuidv4();

      const { data: insertedUser, error: insertError } = await supabase.from('profiles').insert([
        {
          id: userId,
          name: data.name,
          company_name: data.companyName,
          email: data.email,
          mobile: data.mobile,
          user_type: data.user_type,
          linkedin_profile: data.linkedinProfile,
          company_logo: logoUrl,
          role: 'user',
          status: 'approved',
        },
      ]);

      if (insertError) {
        console.error('Error inserting user into profiles:', insertError.message);
        toast.error(insertError.message);
        setIsSubmitting(false);
      } else {
        console.log('Investor ID:', data.investor_id);

        const { data: investorCheck, error: investorCheckError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.investor_id)
          .eq('user_type', 'investor');

        if (investorCheckError || investorCheck.length === 0) {
          console.error('Invalid investor_id:', data.investor_id);
          toast.error('Selected investor does not exist.');
          setIsSubmitting(false);
          return;
        }

        const { data: mappingData, error: mappingError } = await supabase.from('investor_startup_mapping').insert([
          {
            investor_id: data.investor_id,
            startup_id: userId,
            status: 'active',
          },
        ]);

        if (mappingError) {
          console.error('Error mapping investor to startup:', mappingError.message);
          toast.error('Failed to map startup with investor. ' + mappingError.message);
        } else {
          toast.success('Account created and mapped successfully!');
          if (typeof onSuccess === 'function') {
            onSuccess(); // Call onSuccess if it's a function
          } else {
            console.error('onSuccess is not a function!');
          }
        }
      }
    } catch (error) {
      console.error('Unexpected error during form submission:', error);
      toast.error('An unexpected error occurred during form submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectUserType = (value) => {
    setUserType(value.charAt(0).toUpperCase() + value.slice(1));
    setValue('user_type', value);
  };

  const handleSelectInvestor = (investorId, investorName) => {
    setSelectedInvestor(investorName);
    setValue('investor_id', investorId);
    setSearchQuery(investorName);
    setFilteredInvestors([]);
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 0) {
      const filtered = investors.filter((investor) =>
        investor.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredInvestors(filtered);
    } else {
      setFilteredInvestors([]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
      {/* Form fields */}
      <Textinput
        name='name'
        label='Name'
        type='text'
        placeholder='Enter your name'
        register={register}
        error={errors.name}
      />
      <Textinput
        name='companyName'
        label='Company Name'
        type='text'
        placeholder='Enter your company name'
        register={register}
        error={errors.companyName}
      />
      <Textinput
        name='email'
        label='Email'
        type='email'
        placeholder='Enter your email'
        register={register}
        error={errors.email}
      />
      <Textinput
        name='mobile'
        label='Mobile'
        type='text'
        placeholder='Enter your mobile number'
        register={register}
        error={errors.mobile}
      />
      <PasswordInput
        label="Password"
        name="password"
        placeholder='Type your password'
        register={register}
        error={errors.password}
      />
      <PasswordInput
        label="Confirm Password"
        name="confirmpassword"
        placeholder='Type your password'
        register={register}
        error={errors.confirmpassword}
      />
      <Dropdowntype
        label={userType}
        items={[
          { label: 'Startup', value: 'startup' },
          { label: 'Investor', value: 'investor' },
        ]}
        onSelect={handleSelectUserType}
        error={errors.user_type}
      />
      <Textinput
        label='LinkedIn Profile'
        type='url'
        placeholder='https://www.linkedin.com/in/example'
        name='linkedinProfile'
        error={errors.linkedinProfile}
        register={register}
      />
      <div className='mb-6'>
        <InputGroup
          label='Upload Company Logo'
          type='file'
          name='company_logo'
          error={errors.company_logo || null}
          register={register}
          className='border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-2 focus:ring focus:ring-indigo-200 focus:outline-none w-full text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100'
        />
        {errors.company_logo && (
          <p className='text-red-500 text-xs mt-1'>
            {errors.company_logo.message}
          </p>
        )}
      </div>
      <div className='mb-6'>
        <label className='block text-sm font-medium text-gray-700'>Select Investor</label>
        <input
          type='text'
          value={searchQuery}
          onChange={handleSearch}
          placeholder='Search for an investor...'
          className='form-input mt-1 block w-full'
        />
        {searchQuery && filteredInvestors.length > 0 && (
          <ul className='mt-2 border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto'>
            {filteredInvestors.map((investor) => (
              <li
                key={investor.id}
                className='p-2 cursor-pointer flex items-center hover:bg-gray-200'
                onClick={() => handleSelectInvestor(investor.id, investor.name)}
              >
                <img
                  src={investor.company_logo || '/default-logo.png'}
                  alt={investor.company_name}
                  className='h-6 w-6 mr-2 rounded-full'
                />
                <span>{investor.name}</span>
              </li>
            ))}
          </ul>
        )}
        {errors.investor_id && <p className='text-red-500 text-xs mt-1'>{errors.investor_id.message}</p>}
      </div>
      <button
        className='btn btn-dark block w-full text-center'
        type='submit'
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Create an account'}
      </button>
    </form>
  );
};

export default RegForm1;
