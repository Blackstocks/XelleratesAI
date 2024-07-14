import * as yup from 'yup';
export const contactSchema = yup.object().shape({
  mobile: yup.string().required('Mobile number is required'),
  businessDescription: yup
    .string()
    .required('Please provide a brief description of your business'),
});

export const profileSchema = yup.object().shape({
  companyName: yup.string().required('Company name is required'),
  shortDescription: yup.string().required('Short description is required'),
  incorporationDate: yup.date().required('Date of Incorporation is required'),
  country: yup.string().required('Country is required'),
  stateCity: yup.string().required('State, City is required'),
  officeAddress: yup.string().required('Office address is required'),
  pinCode: yup.string().required('Pin code is required'),
  companyWebsite: yup
    .string()
    .url('Invalid URL')
    .required('Company website is required'),
  linkedinProfile: yup
    .string()
    .url('Invalid URL')
    .required('LinkedIn profile is required'),
  companyLogo: yup.mixed().required('Company logo is required'),
  interest_status: yup.string(),
  teamSize: yup.number().required('Team Size is required'),
  currentStage: yup
    .string()
    .required('Current stage of the company is required'),
  targetAudience: yup
    .string()
    .oneOf(
      ['B2C', 'B2B', 'B2B2B', 'D2C', 'B2G', 'B2B2C', 'others'],
      'Invalid Option'
    )
    .required('Target audience is required'),
  media: yup
    .string()
    .oneOf(['Yes', 'No'], 'Invalid Option')
    .required('Select any one of the options'),
  uspMoat: yup.string().required('USP/MOAT is required'),
  industrySector: yup
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
        'Others',
      ],
      'Invalid sector'
    )
    .required('Sectors of interest are required'),
});

export const founderAndEducationSchema = yup.object().shape({
  founderName: yup.string().required('Full name is required'),
  founderEmail: yup
    .string()
    .email('Invalid email')
    .required('Email is required'),
  founderMobile: yup.string().required('Mobile number is required'),
  founderLinkedin: yup
    .string()
    .url('Invalid URL')
    .required('LinkedIn profile is required'),
  cofounderName: yup.string(),
  degreeName: yup.string().required('Degree name is required'),
  collegeName: yup.string().required('College name is required'),
  graduationYear: yup.date().required('Year of graduation is required'),
  listofAdvisers: yup.mixed(),
});

export const cofounderSchema = yup.object().shape({
  cofounderName: yup.string(),
  cofounderEmail: yup.string().email('Invalid email'),
  cofounderMobile: yup.string(),
  cofounderLinkedin: yup.string().url('Invalid URL'),
});

export const businessSchema = yup.object().shape({
  currentTraction: yup.string().required('Current traction is required'),
  newCustomers: yup.number().required('Required'),
  customerAcquisitionCost: yup.number().required('Required'),
  customerLifetimeValue: yup.string().required('Required'),
  // certificateOfIncorporation: yup
  //   .mixed()
  //   .required('Certificate of Incorporation is required'),
  // gstCertificate: yup.mixed().required('GST Certificate is required'),
  // startupIndiaCertificate: yup
  //   .mixed()
  //   .required('Startup India Certificate is required'),
  // dueDiligenceReport: yup.mixed().required('Due Diligence Report is required'),
  // businessValuationReport: yup
  //   .mixed()
  //   .required('Business Valuation Report is required'),

  // currentTraction: yup.string().required('Current traction is required'),
  // mis: yup.mixed().required('MIS is required'),
  // pitchDeck: yup.mixed().required('Pitch Deck is required'),
  // videoPitch: yup.mixed().required('Video Pitch is required'),
});

export const fundingSchema = yup.object().shape({
  previousFunding: yup.boolean(),
  totalFundingAsk: yup.number().required('Total funding ask is required'),
  amountCommitted: yup.number().required('Amount committed so far is required'),
  currentCapTable: yup.mixed().required('Current cap table is required'),
  governmentGrants: yup.string().required('Government grants are required'),
  equitySplit: yup
    .string()
    .required('Equity split among the founders is required'),
  fundUtilization: yup
    .string()
    .required('Fund utilization summary is required'),
  arr: yup.number().required('ARR is required'),
  mrr: yup.number().required('MRR is required'),
  listofAdvisers: yup.mixed().required('List of advisers is required'),
});
export const ctoschema = yup.object().shape({
  ctoName: yup
    .string()
    .required('CTO Full Name is required')
    .matches(/^[a-zA-Z\s]+$/, 'Only letters and spaces are allowed'),
  ctoEmail: yup
    .string()
    .email('Invalid email address')
    .required('CTO Email is required'),
  ctoMobile: yup
    .string()

    .required('CTO Mobile Number is required'),
  ctoLinkedin: yup
    .string()
    .url('Invalid URL')
    .required('CTO LinkedIn Profile is required'),
  techTeamSize: yup
    .number()
    .positive('Size of the Tech Team must be a positive number')
    .integer('Size of the Tech Team must be an integer')
    .required('Size of the Tech Team is required'),
  mobileAppLink: yup.string().url('Invalid URL').nullable(), // Optional field
  technologyRoadmap: yup.mixed().required('Technology Roadmap is required'),
});

export const companyDocumentsSchema = yup.object().shape({
  certificateOfIncorporation: yup
    .mixed()
    .required('Certificate of Incorporation is required'),
  gstCertificate: yup.mixed().required('GST Certificate is required'),
  trademark: yup.mixed().required('Trademark is required'),
  copyright: yup.mixed().required('Copyright is required'),
  patent: yup.mixed().required('Patent is required'),
  startupIndiaCertificate: yup
    .mixed()
    .required('Startup India Certificate is required'),
  dueDiligenceReport: yup.mixed().required('Due-Diligence Report is required'),
  businessValuationReport: yup
    .mixed()
    .required('Business Valuation report is required'),
  mis: yup.mixed().required('MIS is required'),
  financialProjections: yup
    .mixed()
    .required('Financial Projections are required'),
  balanceSheet: yup.mixed().required('Balance Sheet is required'),
  plStatement: yup.mixed().required('P&L Statement is required'),
  cashflowStatement: yup.mixed().required('Cashflow Statement is required'),
  pitchDeck: yup.mixed().required('Pitch Deck is required'),
  videoPitch: yup.mixed().required('Video Pitch is required'),
  sha: yup.mixed().required('SHA (Previous round/ existing round) is required'),
  termsheet: yup
    .mixed()
    .required('Termsheet (previous round/ existing round) is required'),
  employmentAgreement: yup.mixed().required('Employment Agreement is required'),
  mou: yup.mixed().required('MoU is required'),
  nda: yup.mixed().required('NDA is required'),
});
