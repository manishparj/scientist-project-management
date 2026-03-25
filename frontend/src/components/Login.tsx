import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Formik, Form as FormikForm, Field } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      await login(values.email, values.password);
      message.success('Login successful');
      navigate('/dashboard');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Card title="Scientist Management System" style={{ width: 400 }}>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <FormikForm>
              <Field name="email">
                {({ field }: any) => (
                  <Form.Item
                    validateStatus={touched.email && errors.email ? 'error' : ''}
                    help={touched.email && errors.email}
                  >
                    <Input
                      {...field}
                      prefix={<UserOutlined />}
                      placeholder="Email"
                      size="large"
                    />
                  </Form.Item>
                )}
              </Field>

              <Field name="password">
                {({ field }: any) => (
                  <Form.Item
                    validateStatus={touched.password && errors.password ? 'error' : ''}
                    help={touched.password && errors.password}
                  >
                    <Input.Password
                      {...field}
                      prefix={<LockOutlined />}
                      placeholder="Password"
                      size="large"
                    />
                  </Form.Item>
                )}
              </Field>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={isSubmitting}
                  block
                >
                  Login
                </Button>
              </Form.Item>
            </FormikForm>
          )}
        </Formik>
      </Card>
    </div>
  );
};

export default Login;