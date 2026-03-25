import React from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { Formik, Form as FormikForm, Field } from 'formik';
import * as Yup from 'yup';
import axios from '../utils/axios';

interface ScientistFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  designation: Yup.string().required('Designation is required'),
  mobile: Yup.string()
    .required('Mobile number is required')
    .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits'),
});

const ScientistForm: React.FC<ScientistFormProps> = ({ visible, onCancel, onSuccess }) => {
  const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      await axios.post('/scientists', values);
      message.success('Scientist created successfully');
      resetForm();
      onSuccess();
      onCancel();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create scientist');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Create Scientist Profile"
      open={visible}
      onCancel={() => {
        onCancel();
      }}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Formik
        initialValues={{
          name: '',
          email: '',
          password: '',
          designation: '',
          mobile: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <FormikForm>
            <Field name="name">
              {({ field, meta }: any) => (
                <Form.Item
                  label="Name"
                  validateStatus={meta.touched && meta.error ? 'error' : ''}
                  help={meta.touched && meta.error ? meta.error : ''}
                >
                  <Input {...field} placeholder="Enter scientist name" />
                </Form.Item>
              )}
            </Field>

            <Field name="designation">
              {({ field, meta }: any) => (
                <Form.Item
                  label="Designation"
                  validateStatus={meta.touched && meta.error ? 'error' : ''}
                  help={meta.touched && meta.error ? meta.error : ''}
                >
                  <Input {...field} placeholder="Enter designation" />
                </Form.Item>
              )}
            </Field>

            <Field name="mobile">
              {({ field, meta }: any) => (
                <Form.Item
                  label="Mobile"
                  validateStatus={meta.touched && meta.error ? 'error' : ''}
                  help={meta.touched && meta.error ? meta.error : ''}
                >
                  <Input {...field} placeholder="Enter mobile number" />
                </Form.Item>
              )}
            </Field>

            <Field name="email">
              {({ field, meta }: any) => (
                <Form.Item
                  label="Email"
                  validateStatus={meta.touched && meta.error ? 'error' : ''}
                  help={meta.touched && meta.error ? meta.error : ''}
                >
                  <Input {...field} placeholder="Enter email address" />
                </Form.Item>
              )}
            </Field>

            <Field name="password">
              {({ field, meta }: any) => (
                <Form.Item
                  label="Password"
                  validateStatus={meta.touched && meta.error ? 'error' : ''}
                  help={meta.touched && meta.error ? meta.error : ''}
                >
                  <Input.Password {...field} placeholder="Enter password for scientist login" />
                </Form.Item>
              )}
            </Field>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isSubmitting} block>
                Create Scientist
              </Button>
            </Form.Item>
          </FormikForm>
        )}
      </Formik>
    </Modal>
  );
};

export default ScientistForm;