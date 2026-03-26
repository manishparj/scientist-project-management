import { Formik, Form } from 'formik';
import { Input, DatePicker, Switch, Button, message } from 'antd';
import { useUpdateStaffMutation } from '../services/staffApi';
import { staffSchema } from '../utils/validation';
import dayjs from 'dayjs';

const StaffEditForm = ({ staff, projectId, onSuccess, onCancel }: any) => {
  const [updateStaff] = useUpdateStaffMutation();

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        doj: values.doj.toISOString(),
        lastWorkingDay: values.lastWorkingDay ? values.lastWorkingDay.toISOString() : undefined,
        projectId,
      };
      
      await updateStaff({ id: staff._id, data }).unwrap();
      onSuccess();
    } catch (error: any) {
      message.error(error.data?.message || 'Failed to update staff');
    }
  };

  return (
    <Formik
      initialValues={{
        name: staff.name,
        mobile: staff.mobile,
        designation: staff.designation,
        doj: dayjs(staff.doj),
        currentlyWorking: staff.currentlyWorking,
        lastWorkingDay: staff.lastWorkingDay ? dayjs(staff.lastWorkingDay) : null,
        email: staff.email,
        leavingReason: staff.leavingReason || '',
      }}
      validationSchema={staffSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, handleChange, setFieldValue, handleBlur }) => (
        <Form>
          <Input
            placeholder="Name"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            style={{ marginBottom: 16 }}
            status={errors.name && touched.name ? 'error' : ''}
          />
          
          <Input
            placeholder="Mobile Number"
            name="mobile"
            value={values.mobile}
            onChange={handleChange}
            onBlur={handleBlur}
            style={{ marginBottom: 16 }}
            status={errors.mobile && touched.mobile ? 'error' : ''}
          />
          
          <Input
            placeholder="Designation"
            name="designation"
            value={values.designation}
            onChange={handleChange}
            onBlur={handleBlur}
            style={{ marginBottom: 16 }}
            status={errors.designation && touched.designation ? 'error' : ''}
          />
          
          <DatePicker
            placeholder="Date of Joining"
            style={{ width: '100%', marginBottom: 16 }}
            onChange={(date) => setFieldValue('doj', date)}
            value={values.doj}
          />
          
          <div style={{ marginBottom: 16 }}>
            <Switch
              checked={values.currentlyWorking}
              onChange={(checked) => setFieldValue('currentlyWorking', checked)}
              checkedChildren="Working"
              unCheckedChildren="Left"
            />
            <span style={{ marginLeft: 8 }}>Currently Working</span>
          </div>
          
          {!values.currentlyWorking && (
            <>
              <DatePicker
                placeholder="Last Working Day"
                style={{ width: '100%', marginBottom: 16 }}
                onChange={(date) => setFieldValue('lastWorkingDay', date)}
                value={values.lastWorkingDay}
              />
              {errors.lastWorkingDay && touched.lastWorkingDay && <div style={{ color: 'red', marginBottom: 8 }}>{errors.lastWorkingDay}</div>}
              
              <Input.TextArea
                placeholder="Leaving Reason"
                name="leavingReason"
                value={values.leavingReason}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={3}
                style={{ marginBottom: 16 }}
                status={errors.leavingReason && touched.leavingReason ? 'error' : ''}
              />
            </>
          )}
          
          <Input
            placeholder="Email"
            name="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            style={{ marginBottom: 16 }}
            status={errors.email && touched.email ? 'error' : ''}
          />
          
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={onCancel}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Update Staff Member
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default StaffEditForm;