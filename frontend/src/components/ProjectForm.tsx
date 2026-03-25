import React from 'react';
import {
  Modal, Form, Input, Button, Select, DatePicker, Space,
  message, Checkbox
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Formik, Form as FormikForm, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import dayjs, { Dayjs } from 'dayjs';
import axios from '../utils/axios';

const { Option } = Select;

interface Staff {
  name: string;
  designation: string;
  doj: Dayjs | null;
  currentlyWorking: boolean;
  mobile: string;
  email: string;
  lastWorkingDay?: Dayjs | null;
  remarks?: string;
}

interface FormValues {
  projectName: string;
  projectType: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  status: string;
  staffDetails: Staff[];
}

interface ProjectFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  scientistId?: string;
}

// Custom validation function that safely handles date comparison
const validateDateRange = (startDate: any, endDate: any) => {
  if (!startDate || !endDate) return true;
  try {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    return end.isAfter(start);
  } catch (error) {
    console.error('Date validation error:', error);
    return true;
  }
};

const validationSchema = Yup.object({
  projectName: Yup.string().required('Project name is required'),
  projectType: Yup.string().required('Project type is required'),
  startDate: Yup.mixed().required('Start date is required'),
  endDate: Yup.mixed()
    .required('End date is required')
    .test('is-after', 'End date must be after start date', function(value) {
      const { startDate } = this.parent;
      return validateDateRange(startDate, value);
    }),
  status: Yup.string().required('Status is required'),
  staffDetails: Yup.array().of(
    Yup.object({
      name: Yup.string().required('Staff name is required'),
      designation: Yup.string().required('Designation is required'),
      doj: Yup.mixed().required('Date of joining is required'),
      currentlyWorking: Yup.boolean(),
      mobile: Yup.string()
        .required('Mobile number is required')
        .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      lastWorkingDay: Yup.mixed().when('currentlyWorking', {
        is: false,
        then: (schema) => schema.required('Last working day is required when not currently working'),
        otherwise: (schema) => schema.optional(),
      }),
      remarks: Yup.string(),
    })
  ),
});

const ProjectForm: React.FC<ProjectFormProps> = ({
  visible,
  onCancel,
  onSuccess,
  scientistId,
}) => {
  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: any) => {
    console.log('handleSubmit called with values:', values); // Debug log
    
    try {
      if (!values.startDate || !values.endDate) {
        message.error('Please select both start and end dates');
        setSubmitting(false);
        return;
      }

      const payload = {
        projectName: values.projectName,
        projectType: values.projectType,
        scientistId,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        status: values.status,
        staffDetails: values.staffDetails.map((staff) => ({
          name: staff.name,
          designation: staff.designation,
          doj: staff.doj ? staff.doj.toISOString() : new Date().toISOString(),
          lastWorkingDay: staff.lastWorkingDay && !staff.currentlyWorking ? staff.lastWorkingDay.toISOString() : undefined,
          currentlyWorking: staff.currentlyWorking,
          mobile: staff.mobile,
          email: staff.email,
          remarks: staff.remarks,
        })),
      };

      console.log('Sending payload:', payload);

      const response = await axios.post('/projects', payload);
      console.log('Response:', response.data);

      message.success('Project created successfully');
      resetForm();
      onSuccess();
      onCancel();
    } catch (error: any) {
      console.error('Error details:', error.response?.data || error.message);
      message.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Add New Project"
      open={visible}
      onCancel={() => {
        console.log('Modal cancelled'); // Debug log
        onCancel();
      }}
      footer={null}
      width={900}
      destroyOnClose
    >
      <Formik<FormValues>
        initialValues={{
          projectName: '',
          projectType: 'Research',
          startDate: dayjs(),
          endDate: dayjs().add(1, 'year'),
          status: 'yet_to_start',
          staffDetails: [],
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue, isSubmitting, handleSubmit, errors, touched }) => {
          console.log('Formik state - isSubmitting:', isSubmitting); // Debug log
          console.log('Form errors:', errors); // Debug log
          
          return (
            <form onSubmit={handleSubmit}>
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                {/* Project Name */}
                <Field name="projectName">
                  {({ field, meta }: any) => (
                    <Form.Item
                      label="Project Name"
                      validateStatus={meta.touched && meta.error ? 'error' : ''}
                      help={meta.touched && meta.error ? meta.error : ''}
                    >
                      <Input {...field} placeholder="Enter project name" />
                    </Form.Item>
                  )}
                </Field>

                <Space size="large" style={{ width: '100%' }}>
                  {/* Project Type */}
                  <Field name="projectType">
                    {({ field, meta }: any) => (
                      <Form.Item
                        label="Project Type"
                        validateStatus={meta.touched && meta.error ? 'error' : ''}
                        help={meta.touched && meta.error ? meta.error : ''}
                        style={{ width: '100%' }}
                      >
                        <Select
                          value={field.value}
                          onChange={(value) => setFieldValue('projectType', value)}
                          style={{ width: '100%' }}
                        >
                          <Option value="Research">Research</Option>
                          <Option value="Development">Development</Option>
                          <Option value="Consultancy">Consultancy</Option>
                          <Option value="Training">Training</Option>
                        </Select>
                      </Form.Item>
                    )}
                  </Field>

                  {/* Status */}
                  <Field name="status">
                    {({ field, meta }: any) => (
                      <Form.Item
                        label="Status"
                        validateStatus={meta.touched && meta.error ? 'error' : ''}
                        help={meta.touched && meta.error ? meta.error : ''}
                        style={{ width: '100%' }}
                      >
                        <Select
                          value={field.value}
                          onChange={(value) => setFieldValue('status', value)}
                          style={{ width: '100%' }}
                        >
                          <Option value="yet_to_start">Yet to Start</Option>
                          <Option value="ongoing">Ongoing</Option>
                          <Option value="completed">Completed</Option>
                        </Select>
                      </Form.Item>
                    )}
                  </Field>
                </Space>

                <Space size="large" style={{ width: '100%' }}>
                  {/* Start Date */}
                  <Field name="startDate">
                    {({ field, meta }: any) => (
                      <Form.Item
                        label="Start Date"
                        validateStatus={meta.touched && meta.error ? 'error' : ''}
                        help={meta.touched && meta.error ? meta.error : ''}
                        style={{ width: '100%' }}
                      >
                        <DatePicker
                          value={field.value}
                          onChange={(date) => setFieldValue('startDate', date)}
                          format="YYYY-MM-DD"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    )}
                  </Field>

                  {/* End Date */}
                  <Field name="endDate">
                    {({ field, meta }: any) => (
                      <Form.Item
                        label="End Date"
                        validateStatus={meta.touched && meta.error ? 'error' : ''}
                        help={meta.touched && meta.error ? meta.error : ''}
                        style={{ width: '100%' }}
                      >
                        <DatePicker
                          value={field.value}
                          onChange={(date) => setFieldValue('endDate', date)}
                          format="YYYY-MM-DD"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    )}
                  </Field>
                </Space>

                {/* Staff Section */}
                <FieldArray name="staffDetails">
                  {({ push, remove, form }) => (
                    <div>
                      <div style={{ marginBottom: 16 }}>
                        <Button
                          type="dashed"
                          onClick={() => {
                            push({
                              name: '',
                              designation: '',
                              doj: dayjs(),
                              currentlyWorking: true,
                              mobile: '',
                              email: '',
                              lastWorkingDay: null,
                              remarks: '',
                            });
                          }}
                          icon={<PlusOutlined />}
                        >
                          Add Staff Member
                        </Button>
                      </div>

                      {values.staffDetails.map((staff, index) => (
                        <div 
                          key={index} 
                          style={{ 
                            marginBottom: 24, 
                            padding: 16, 
                            border: '1px solid #d9d9d9', 
                            borderRadius: 8,
                            position: 'relative'
                          }}
                        >
                          <Button
                            danger
                            onClick={() => remove(index)}
                            icon={<DeleteOutlined />}
                            style={{ position: 'absolute', top: 16, right: 16 }}
                            size="small"
                          >
                            Remove
                          </Button>

                          <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <Field name={`staffDetails.${index}.name`}>
                              {({ field, meta }: any) => (
                                <Form.Item
                                  label="Name"
                                  validateStatus={meta.touched && meta.error ? 'error' : ''}
                                  help={meta.touched && meta.error ? meta.error : ''}
                                >
                                  <Input {...field} placeholder="Staff name" />
                                </Form.Item>
                              )}
                            </Field>

                            <Field name={`staffDetails.${index}.designation`}>
                              {({ field, meta }: any) => (
                                <Form.Item
                                  label="Designation"
                                  validateStatus={meta.touched && meta.error ? 'error' : ''}
                                  help={meta.touched && meta.error ? meta.error : ''}
                                >
                                  <Input {...field} placeholder="Staff designation" />
                                </Form.Item>
                              )}
                            </Field>

                            <Space size="large" style={{ width: '100%' }}>
                              <Field name={`staffDetails.${index}.doj`}>
                                {({ field, meta }: any) => (
                                  <Form.Item
                                    label="Date of Joining"
                                    validateStatus={meta.touched && meta.error ? 'error' : ''}
                                    help={meta.touched && meta.error ? meta.error : ''}
                                    style={{ width: '100%' }}
                                  >
                                    <DatePicker
                                      value={field.value}
                                      onChange={(date) => setFieldValue(`staffDetails.${index}.doj`, date)}
                                      format="YYYY-MM-DD"
                                      style={{ width: '100%' }}
                                    />
                                  </Form.Item>
                                )}
                              </Field>

                              <Field name={`staffDetails.${index}.currentlyWorking`}>
                                {({ field, meta }: any) => (
                                  <Form.Item label="Currently Working" style={{ width: '100%' }}>
                                    <Checkbox
                                      checked={field.value}
                                      onChange={(e) => {
                                        setFieldValue(`staffDetails.${index}.currentlyWorking`, e.target.checked);
                                        if (e.target.checked) {
                                          setFieldValue(`staffDetails.${index}.lastWorkingDay`, null);
                                        }
                                      }}
                                    >
                                      Yes
                                    </Checkbox>
                                  </Form.Item>
                                )}
                              </Field>
                            </Space>

                            {!staff.currentlyWorking && (
                              <Field name={`staffDetails.${index}.lastWorkingDay`}>
                                {({ field, meta }: any) => (
                                  <Form.Item
                                    label="Last Working Day"
                                    validateStatus={meta.touched && meta.error ? 'error' : ''}
                                    help={meta.touched && meta.error ? meta.error : ''}
                                  >
                                    <DatePicker
                                      value={field.value}
                                      onChange={(date) => setFieldValue(`staffDetails.${index}.lastWorkingDay`, date)}
                                      format="YYYY-MM-DD"
                                      style={{ width: '100%' }}
                                    />
                                  </Form.Item>
                                )}
                              </Field>
                            )}

                            <Space size="large" style={{ width: '100%' }}>
                              <Field name={`staffDetails.${index}.mobile`}>
                                {({ field, meta }: any) => (
                                  <Form.Item
                                    label="Mobile"
                                    validateStatus={meta.touched && meta.error ? 'error' : ''}
                                    help={meta.touched && meta.error ? meta.error : ''}
                                    style={{ width: '100%' }}
                                  >
                                    <Input {...field} placeholder="Mobile number" />
                                  </Form.Item>
                                )}
                              </Field>

                              <Field name={`staffDetails.${index}.email`}>
                                {({ field, meta }: any) => (
                                  <Form.Item
                                    label="Email"
                                    validateStatus={meta.touched && meta.error ? 'error' : ''}
                                    help={meta.touched && meta.error ? meta.error : ''}
                                    style={{ width: '100%' }}
                                  >
                                    <Input {...field} placeholder="Email address" />
                                  </Form.Item>
                                )}
                              </Field>
                            </Space>

                            <Field name={`staffDetails.${index}.remarks`}>
                              {({ field, meta }: any) => (
                                <Form.Item
                                  label="Remarks"
                                  validateStatus={meta.touched && meta.error ? 'error' : ''}
                                  help={meta.touched && meta.error ? meta.error : ''}
                                >
                                  <Input.TextArea {...field} placeholder="Any remarks" rows={2} />
                                </Form.Item>
                              )}
                            </Field>
                          </Space>
                        </div>
                      ))}
                    </div>
                  )}
                </FieldArray>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={isSubmitting}
                    block
                    size="large"
                    onClick={() => {
                      console.log('Button clicked, triggering form submit'); // Debug log
                    }}
                  >
                    Create Project
                  </Button>
                </Form.Item>
              </Space>
            </form>
          );
        }}
      </Formik>
    </Modal>
  );
};

export default ProjectForm;