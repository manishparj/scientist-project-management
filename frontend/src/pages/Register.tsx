import { Formik, Form } from 'formik';
import { Input, Button, Card, message } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, IdcardOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../services/authApi';
import { registerSchema } from '../utils/validation';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [register, { isLoading }] = useRegisterMutation();

  const handleSubmit = async (values: any) => {
    try {
      const result = await register(values).unwrap();
      dispatch(setCredentials({ user: result.user, token: result.token }));
      message.success('Registration successful!');
      navigate('/dashboard');
    } catch (error: any) {
      message.error(error.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <Card title="Scientist Registration" style={{ width: 450 }}>
        <Formik
          initialValues={{
            name: '',
            designation: '',
            mobile: '',
            email: '',
            password: '',
          }}
          validationSchema={registerSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <Input
                prefix={<UserOutlined />}
                placeholder="Full Name"
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                style={{ marginBottom: 16 }}
                status={errors.name && touched.name ? 'error' : ''}
              />
              {errors.name && touched.name && <div style={{ color: 'red', marginBottom: 8 }}>{errors.name}</div>}
              
              <Input
                prefix={<IdcardOutlined />}
                placeholder="Designation"
                name="designation"
                value={values.designation}
                onChange={handleChange}
                onBlur={handleBlur}
                style={{ marginBottom: 16 }}
                status={errors.designation && touched.designation ? 'error' : ''}
              />
              {errors.designation && touched.designation && <div style={{ color: 'red', marginBottom: 8 }}>{errors.designation}</div>}
              
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Mobile Number"
                name="mobile"
                value={values.mobile}
                onChange={handleChange}
                onBlur={handleBlur}
                style={{ marginBottom: 16 }}
                status={errors.mobile && touched.mobile ? 'error' : ''}
              />
              {errors.mobile && touched.mobile && <div style={{ color: 'red', marginBottom: 8 }}>{errors.mobile}</div>}
              
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
                Register
              </Button>
              
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                Already have an account? <a href="/login">Login here</a>
              </div>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
};

export default Register;