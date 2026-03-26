import { Formik, Form } from 'formik';
import { Input, Button, Card, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../services/authApi';
import { loginSchema } from '../utils/validation';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (values: any) => {
    try {
      const result = await login(values).unwrap();
      dispatch(setCredentials({ user: result.user, token: result.token }));
      message.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      message.error(error.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <Card title="Scientist Login" style={{ width: 400 }}>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <Input
                prefix={<MailOutlined />}
                placeholder="Email"
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                style={{ marginBottom: 16 }}
                status={errors.email && touched.email ? 'error' : ''}
              />
              {errors.email && touched.email && <div style={{ color: 'red', marginBottom: 8 }}>{errors.email}</div>}
              
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                style={{ marginBottom: 16 }}
                status={errors.password && touched.password ? 'error' : ''}
              />
              {errors.password && touched.password && <div style={{ color: 'red', marginBottom: 8 }}>{errors.password}</div>}
              
              <Button type="primary" htmlType="submit" loading={isLoading} block>
                Login
              </Button>
              
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                Don't have an account? <a href="/register">Register here</a>
              </div>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
};

export default Login;