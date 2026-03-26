import { Formik, Form } from 'formik';
import { Input, DatePicker, Switch, Button, message } from 'antd';
import { useAddStaffMutation, useUpdateStaffMutation } from '../services/staffApi';
import { staffSchema } from '../utils/validation';
import dayjs from 'dayjs';

const StaffForm = ({ projectId, staff, onSuccess }: { projectId: string; staff?: any; onSuccess: () => void }) => {
  const [addStaff] = useAddStaffMutation();
  const [updateStaff] = useUpdateStaffMutation();

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        doj: values.doj.toISOString(),
        lastWorkingDay: values.lastWorkingDay ? values.lastWorkingDay.toISOString() : undefined,
        projectId,
      };
      
      if (staff) {
        await updateStaff({ id: staff._id, data }).unwrap();
        message.success('Staff updated successfully');
      } else {
        await addStaff(data).unwrap();
        message.success('Staff added successfully');
      }
      onSuccess();
    } catch (error: any) {
      message.error(error.data?.message || 'Operation failed');
    }
  };

  return (
    <Formik
      initialValues={{
        name: staff?.name || '',
        mobile: staff?.mobile || '',
        designation: staff?.designation || '',
        doj: staff?.doj ? dayjs(staff.doj) : null,
        currentlyWorking: staff?.currentlyWorking !== undefined ? staff.currentlyWorking : true,
        lastWorkingDay: staff?.lastWorkingDay ? dayjs(staff.lastWorkingDay) : null,
        email: staff?.email || '',
        leavingReason: staff?.leavingReason || '',
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
          {errors.name && touched.name && <div style={{ color: 'red', marginBottom: 8 }}>{errors.name}</div>}
          
          <Input
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
            placeholder="Designation"
            name="designation"
            value={values.designation}
            onChange={handleChange}
            onBlur={handleBlur}
            style={{ marginBottom: 16 }}
            status={errors.designation && touched.designation ? 'error' : ''}
          />
          {errors.designation && touched.designation && <div style={{ color: 'red', marginBottom: 8 }}>{errors.designation}</div>}
          
          <DatePicker
            placeholder="Date of Joining"
            style={{ width: '100%', marginBottom: 16 }}
            onChange={(date) => setFieldValue('doj', date)}
            value={values.doj}
          />
          {errors.doj && touched.doj && <div style={{ color: 'red', marginBottom: 8 }}>{errors.doj}</div>}
          
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
              {errors.leavingReason && touched.leavingReason && <div style={{ color: 'red', marginBottom: 8 }}>{errors.leavingReason}</div>}
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
          {errors.email && touched.email && <div style={{ color: 'red', marginBottom: 8 }}>{errors.email}</div>}
          
          <Button type="primary" htmlType="submit" block>
            {staff ? 'Update' : 'Add'} Staff Member
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default StaffForm;