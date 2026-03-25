// frontend/src/pages/Staff.tsx
import { useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, Space, Popconfirm, Tag, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useGetProjectsQuery, useGetStaffByProjectQuery, useCreateStaffMutation, useUpdateStaffMutation, useDeleteStaffMutation } from '../store/api';
import { Formik, Form as FormikForm, Field } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const staffSchema = Yup.object({
  name: Yup.string().required('Required'),
  designation: Yup.string().required('Required'),
  doj: Yup.date().required('Required'),
  currentlyWorking: Yup.boolean(),
  lastDay: Yup.date().when('currentlyWorking', {
    is: false,
    then: (schema) => schema.required('Required when not working'),
    otherwise: (schema) => schema.nullable(),
  }),
  mobile: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  remark: Yup.string(),
});

const Staff = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  
  const { data: projects } = useGetProjectsQuery();
  const { data: staff, isLoading, refetch } = useGetStaffByProjectQuery(selectedProjectId, {
    skip: !selectedProjectId,
  });
  const [createStaff] = useCreateStaffMutation();
  const [updateStaff] = useUpdateStaffMutation();
  const [deleteStaff] = useDeleteStaffMutation();

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Designation', dataIndex: 'designation', key: 'designation' },
    { title: 'DOJ', dataIndex: 'doj', key: 'doj', render: (date: string) => dayjs(date).format('YYYY-MM-DD') },
    {
      title: 'Status',
      dataIndex: 'currentlyWorking',
      key: 'currentlyWorking',
      render: (working: boolean) => (
        <Tag color={working ? 'green' : 'red'}>
          {working ? 'Working' : 'Left'}
        </Tag>
      ),
    },
    { title: 'Mobile', dataIndex: 'mobile', key: 'mobile' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Delete Staff"
            description="Are you sure you want to delete this staff member?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEdit = (staff: any) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStaff(id).unwrap();
      toast.success('Staff deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete staff');
    }
  };

  const handleSubmit = async (values: any, { resetForm }: any) => {
    try {
      const staffData = {
        ...values,
        doj: values.doj.toISOString(),
        lastDay: values.lastDay ? values.lastDay.toISOString() : undefined,
        projectId: selectedProjectId,
      };

      if (editingStaff) {
        await updateStaff({ id: editingStaff._id, ...staffData }).unwrap();
        toast.success('Staff updated successfully');
      } else {
        await createStaff(staffData).unwrap();
        toast.success('Staff added successfully');
      }
      setIsModalOpen(false);
      resetForm();
      setEditingStaff(null);
      refetch();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  return (
    <div>
      <h1>Staff Management</h1>
      
      <Card style={{ marginBottom: 16 }}>
        <Form layout="inline">
          <Form.Item label="Select Project" style={{ width: '100%' }}>
            <Select
              placeholder="Choose a project to view staff"
              style={{ width: '100%' }}
              onChange={setSelectedProjectId}
              value={selectedProjectId}
            >
              {projects?.map(p => (
                <Option key={p._id} value={p._id}>{p.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Card>

      {selectedProjectId && (
        <>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
              Add Staff Member
            </Button>
          </div>

          <Table 
            dataSource={staff} 
            columns={columns} 
            loading={isLoading}
            rowKey="_id"
            scroll={{ x: true }}
          />
        </>
      )}

      <Modal
        title={editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingStaff(null);
        }}
        footer={null}
        width={600}
      >
        <Formik
          initialValues={{
            name: editingStaff?.name || '',
            designation: editingStaff?.designation || '',
            doj: editingStaff ? dayjs(editingStaff.doj) : null,
            currentlyWorking: editingStaff?.currentlyWorking ?? true,
            lastDay: editingStaff?.lastDay ? dayjs(editingStaff.lastDay) : null,
            mobile: editingStaff?.mobile || '',
            email: editingStaff?.email || '',
            remark: editingStaff?.remark || '',
          }}
          validationSchema={staffSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, isSubmitting, setFieldValue, values }) => (
            <FormikForm>
              <Form layout="vertical">
                <Form.Item 
                  label="Name" 
                  validateStatus={errors.name && touched.name ? 'error' : ''}
                  help={errors.name && touched.name && errors.name}
                >
                  <Field name="name" as={Input} placeholder="Full name" />
                </Form.Item>

                <Form.Item 
                  label="Designation" 
                  validateStatus={errors.designation && touched.designation ? 'error' : ''}
                  help={errors.designation && touched.designation && errors.designation}
                >
                  <Field name="designation" as={Input} placeholder="Designation" />
                </Form.Item>

                <Form.Item 
                  label="Date of Joining" 
                  validateStatus={errors.doj && touched.doj ? 'error' : ''}
                  help={errors.doj && touched.doj && 'Required'}
                >
                  <DatePicker 
                    style={{ width: '100%' }}
                    value={values.doj}
                    onChange={(date) => setFieldValue('doj', date)}
                  />
                </Form.Item>

                <Form.Item 
                  label="Currently Working" 
                  validateStatus={errors.currentlyWorking && touched.currentlyWorking ? 'error' : ''}
                >
                  <Select
                    value={values.currentlyWorking}
                    onChange={(value) => {
                      setFieldValue('currentlyWorking', value);
                      if (value) {
                        setFieldValue('lastDay', null);
                      }
                    }}
                  >
                    <Option value={true}>Yes</Option>
                    <Option value={false}>No</Option>
                  </Select>
                </Form.Item>

                {!values.currentlyWorking && (
                  <Form.Item 
                    label="Last Working Day" 
                    validateStatus={errors.lastDay && touched.lastDay ? 'error' : ''}
                    help={errors.lastDay && touched.lastDay && errors.lastDay}
                  >
                    <DatePicker 
                      style={{ width: '100%' }}
                      value={values.lastDay}
                      onChange={(date) => setFieldValue('lastDay', date)}
                    />
                  </Form.Item>
                )}

                <Form.Item 
                  label="Mobile" 
                  validateStatus={errors.mobile && touched.mobile ? 'error' : ''}
                  help={errors.mobile && touched.mobile && errors.mobile}
                >
                  <Field name="mobile" as={Input} placeholder="Mobile number" />
                </Form.Item>

                <Form.Item 
                  label="Email" 
                  validateStatus={errors.email && touched.email ? 'error' : ''}
                  help={errors.email && touched.email && errors.email}
                >
                  <Field name="email" as={Input} placeholder="Email address" />
                </Form.Item>

                <Form.Item label="Remarks">
                  <Field name="remark" as={TextArea} rows={3} placeholder="Any remarks" />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit" loading={isSubmitting}>
                      {editingStaff ? 'Update' : 'Create'}
                    </Button>
                    <Button onClick={() => {
                      setIsModalOpen(false);
                      setEditingStaff(null);
                    }}>
                      Cancel
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </FormikForm>
          )}
        </Formik>
      </Modal>
    </div>
  );
};

export default Staff;