import * as yup from 'yup';

export const investorSignupSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  mobile: yup.string().required('Mobile number is required'),
  usertype: yup
    .string()
    .oneOf(
      ['VC', 'Angel Fund', 'Angel Investor', 'Syndicate'],
      'Invalid type of investor'
    )
    .required('Type of investor is required'),
  investmentThesis: yup.string().required('Investment thesis is required'),
  chequeSize: yup.string().required('Cheque size is required'),
  sectors: yup
    .string()
    .oneOf(
      [
        'Agriculture and Allied Sectors',
        'Manufacturing',
        'Services',
        'Energy',
        'Infrastructure',
        'Retail and E-commerce',
        'Banking and Insurance',
        'Mining and Minerals',
        'Food Processing',
        'Textiles and Apparel',
        'Automotive',
        'Chemical and Fertilizers',
        'Pharmaceuticals and Biotechnology',
        'Media and Entertainment',
        'Tourism and Hospitality',
        'Education and Training',
        'Healthcare',
        'Telecommunications',
        'Logistics and Supply Chain',
        'Aerospace and Defense',
        'Environmental Services',
        'Fashion and Lifestyle',
        'Financial Technology (Fintech)',
        'Sports and Recreation',
        'Human Resources',
      ],
      'Invalid sector'
    )
    .required('Sectors of interest are required'),
  investmentStage: yup
    .string()
    .oneOf(
      [
        'Pre Seed',
        'Seed',
        'Pre-Series',
        'Series A',
        'Series B',
        'Series C & Beyond',
      ],
      'Invalid investment stage'
    )
    .required('Stage of investment is required'),
});
