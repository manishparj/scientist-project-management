import * as Yup from 'yup';

export const registerSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  designation: Yup.string().required('Designation is required'),
  mobile: Yup.string()
    .required('Mobile number is required')
    .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const loginSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

export const projectSchema = Yup.object({
  projectName: Yup.string().required('Project name is required'),
  projectShortName: Yup.string().required('Project short name is required'),
  type: Yup.string().required('Project type is required'),
  status: Yup.string().required('Status is required'),
  startDate: Yup.date().required('Start date is required'),
  endDate: Yup.date()
    .required('End date is required')
    .min(Yup.ref('startDate'), 'End date must be after start date'),
  allocatedBudget: Yup.number()
    .required('Allocated budget is required')
    .positive('Budget must be positive'),
  fundingAgency: Yup.string().required('Funding agency is required'),
});

export const staffSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  mobile: Yup.string()
    .required('Mobile number is required')
    .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits'),
  designation: Yup.string().required('Designation is required'),
  doj: Yup.date().required('Date of joining is required'),
  currentlyWorking: Yup.boolean(),
  lastWorkingDay: Yup.date().when('currentlyWorking', {
    is: false,
    then: (schema) => schema.required('Last working day is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  leavingReason: Yup.string().when('currentlyWorking', {
    is: false,
    then: (schema) => schema.required('Leaving reason is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
});