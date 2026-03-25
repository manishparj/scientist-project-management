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
  post: string;
  doj: Dayjs | null;
  presentlyWorking: boolean;
  mobile: string;
  email: string;
  lastDate?: Dayjs | null;
}

interface FormValues {
  projectName: string;
  startDate: Dayjs | null;
  tentativeEndDate: Dayjs | null;
  projectType: string;
  staffDetails: Staff[];
}

interface ProjectFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  scientistId?: string;
}

// Custom validation function for dates
const isDateAfter = (startDate: any, endDate: any) => {
  if (!startDate || !endDate) return true;
  try {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    return end.isAfter(start);
  } catch (error) {
    return true;
  }
};

const validationSchema = Yup.object({
  projectName: Yup.string().required('Project name is required'),
  startDate: Yup.mixed().required('Start date is required'),
  tentativeEndDate: Yup.mixed()
    .required('End date is required')
    .test('is-after', 'End date must be after start date', function(value) {
      const { startDate } = this.parent;
      return isDateAfter(startDate, value);
    }),
  projectType: Yup.string().required('Project type is required'),
  staffDetails: Yup.array().of(
    Yup.object({
      name: Yup.string().required('Staff name is required'),
      post: Yup.string().required('Post is required'),
      doj: Yup.mixed().required('Date of joining is required'),
      presentlyWorking: Yup.boolean(),
      mobile: Yup.string()
        .required('Mobile number is required')
        .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      lastDate: Yup.mixed().when('presentlyWorking', {
        is: false,
        then: (schema) => schema.required('Last date is required when not working'),
        otherwise: (schema) => schema.optional(),
      }),
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
    try {
      // Validate required dates
      if (!values.startDate || !values.tentativeEndDate) {
        message.error('Please select both start and end dates');
        setSubmitting(false);
        return;
      }

      // Prepare the payload
      const payload = {
        projectName: values.projectName,
        scientistId,
        startDate: values.startDate.toISOString(),
        tentativeEndDate: values.tentativeEndDate.toISOString(),
        projectType: values.projectType,
        staffDetails: values.staffDetails.map((staff) => ({
          name: staff.name,
          post: staff.post,
          doj: staff.doj ? staff.doj.toISOString() : new Date().toISOString(),
          lastDate: staff.lastDate && !staff.presentlyWorking ? staff.lastDate.toISOString() : undefined,
          presentlyWorking: staff.presentlyWorking,
          mobile: staff.mobile,
          email: staff.email,
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
        onCancel();
      }}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Formik<FormValues>
        initialValues={{
          projectName: '',
          startDate: dayjs(),
          tentativeEndDate: dayjs().add(1, 'year'),
          projectType: 'Research',
          staffDetails: [],
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue, isSubmitting, handleSubmit, resetForm }) => (
          <FormikForm onSubmit={handleSubmit}>
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

            <Space size="large" style={{ width: '100%', marginBottom: 24 }}>
              {/* Start Date */}
              <Field name="startDate">
                {({ field, meta }: any) => (
                  <Form.Item
                    label="Start Date"
                    validateStatus={meta.touched && meta.error ? 'error' : ''}
                    help={meta.touched && meta.error ? meta.error : ''}
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
              <Field name="tentativeEndDate">
                {({ field, meta }: any) => (
                  <Form.Item
                    label="End Date"
                    validateStatus={meta.touched && meta.error ? 'error' : ''}
                    help={meta.touched && meta.error ? meta.error : ''}
                  >
                    <DatePicker
                      value={field.value}
                      onChange={(date) => setFieldValue('tentativeEndDate', date)}
                      format="YYYY-MM-DD"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                )}
              </Field>

              {/* Project Type */}
              <Field name="projectType">
                {({ field, meta }: any) => (
                  <Form.Item
                    label="Project Type"
                    validateStatus={meta.touched && meta.error ? 'error' : ''}
                    help={meta.touched && meta.error ? meta.error : ''}
                  >
                    <Select
                      value={field.value}
                      onChange={(value) => setFieldValue('projectType', value)}
                      style={{ width: 150 }}
                    >
                      <Option value="Research">Research</Option>
                      <Option value="Development">Development</Option>
                      <Option value="Consultancy">Consultancy</Option>
                      <Option value="Training">Training</Option>
                    </Select>
                  </Form.Item>
                )}
              </Field>
            </Space>

            {/* Staff Section */}
            <FieldArray name="staffDetails">
              {({ push, remove, form }) => (
                <div style={{ marginTop: 24 }}>
                  <div style={{ marginBottom: 16 }}>
                    <Button
                      type="dashed"
                      onClick={() => {
                        push({
                          name: '',
                          post: '',
                          doj: dayjs(),
                          presentlyWorking: true,
                          mobile: '',
                          email: '',
                          lastDate: null,
                        });
                      }}
                      icon={<PlusOutlined />}
                    >
                      Add Staff Member
                    </Button>
                  </div>

                  {values.staffDetails.map((staff, index) => {
                    return (
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

                          <Field name={`staffDetails.${index}.post`}>
                            {({ field, meta }: any) => (
                              <Form.Item
                                label="Post"
                                validateStatus={meta.touched && meta.error ? 'error' : ''}
                                help={meta.touched && meta.error ? meta.error : ''}
                              >
                                <Input {...field} placeholder="Post/Designation" />
                              </Form.Item>
                            )}
                          </Field>

                          <Space size="large">
                            <Field name={`staffDetails.${index}.doj`}>
                              {({ field, meta }: any) => (
                                <Form.Item
                                  label="Date of Joining"
                                  validateStatus={meta.touched && meta.error ? 'error' : ''}
                                  help={meta.touched && meta.error ? meta.error : ''}
                                >
                                  <DatePicker
                                    value={field.value}
                                    onChange={(date) => setFieldValue(`staffDetails.${index}.doj`, date)}
                                    format="YYYY-MM-DD"
                                  />
                                </Form.Item>
                              )}
                            </Field>

                            <Field name={`staffDetails.${index}.presentlyWorking`}>
                              {({ field, meta }: any) => (
                                <Form.Item label="Presently Working">
                                  <Checkbox
                                    checked={field.value}
                                    onChange={(e) => {
                                      setFieldValue(`staffDetails.${index}.presentlyWorking`, e.target.checked);
                                      if (e.target.checked) {
                                        setFieldValue(`staffDetails.${index}.lastDate`, null);
                                      }
                                    }}
                                  >
                                    Yes
                                  </Checkbox>
                                </Form.Item>
                              )}
                            </Field>
                          </Space>

                          {!staff.presentlyWorking && (
                            <Field name={`staffDetails.${index}.lastDate`}>
                              {({ field, meta }: any) => (
                                <Form.Item
                                  label="Last Date"
                                  validateStatus={meta.touched && meta.error ? 'error' : ''}
                                  help={meta.touched && meta.error ? meta.error : ''}
                                >
                                  <DatePicker
                                    value={field.value}
                                    onChange={(date) => setFieldValue(`staffDetails.${index}.lastDate`, date)}
                                    format="YYYY-MM-DD"
                                  />
                                </Form.Item>
                              )}
                            </Field>
                          )}

                          <Space size="large">
                            <Field name={`staffDetails.${index}.mobile`}>
                              {({ field, meta }: any) => (
                                <Form.Item
                                  label="Mobile"
                                  validateStatus={meta.touched && meta.error ? 'error' : ''}
                                  help={meta.touched && meta.error ? meta.error : ''}
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
                                >
                                  <Input {...field} placeholder="Email address" />
                                </Form.Item>
                              )}
                            </Field>
                          </Space>
                        </Space>
                      </div>
                    );
                  })}
                </div>
              )}
            </FieldArray>

            <Form.Item style={{ marginTop: 24 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isSubmitting}
                block
                size="large"
              >
                Create Project
              </Button>
            </Form.Item>
          </FormikForm>
        )}
      </Formik>
    </Modal>
  );
};

export default ProjectForm;