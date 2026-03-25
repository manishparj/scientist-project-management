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
  mobile: Yup.string().required('Mobile number is required'),
});

const ScientistForm: React.FC<ScientistFormProps> = ({ visible, onCancel, onSuccess }) => {
  const handleSubmit = async (values: any) => {
    try {
      await axios.post('/scientists', values);
      message.success('Scientist created successfully');
      onSuccess();
      onCancel();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create scientist');
    }
  };

  return (
    <Modal
      title="Create Scientist Profile"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
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
              {({ field }: any) => (
                <Form.Item
                  label="Name"
                  validateStatus={touched.name && errors.name ? 'error' : ''}
                  help={touched.name && errors.name}
                >
                  <Input {...field} placeholder="Enter scientist name" />
                </Form.Item>
              )}
            </Field>

            <Field name="email">
              {({ field }: any) => (
                <Form.Item
                  label="Email"
                  validateStatus={touched.email && errors.email ? 'error' : ''}
                  help={touched.email && errors.email}
                >
                  <Input {...field} placeholder="Enter email address" />
                </Form.Item>
              )}
            </Field>

            <Field name="password">
              {({ field }: any) => (
                <Form.Item
                  label="Password"
                  validateStatus={touched.password && errors.password ? 'error' : ''}
                  help={touched.password && errors.password}
                >
                  <Input.Password {...field} placeholder="Enter password" />
                </Form.Item>
              )}
            </Field>

            <Field name="designation">
              {({ field }: any) => (
                <Form.Item
                  label="Designation"
                  validateStatus={touched.designation && errors.designation ? 'error' : ''}
                  help={touched.designation && errors.designation}
                >
                  <Input {...field} placeholder="Enter designation" />
                </Form.Item>
              )}
            </Field>

            <Field name="mobile">
              {({ field }: any) => (
                <Form.Item
                  label="Mobile"
                  validateStatus={touched.mobile && errors.mobile ? 'error' : ''}
                  help={touched.mobile && errors.mobile}
                >
                  <Input {...field} placeholder="Enter mobile number" />
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