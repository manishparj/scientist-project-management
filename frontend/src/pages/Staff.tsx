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

  // Get the selected project details to get scientistId
  const selectedProject = projects?.find(p => p._id === selectedProjectId);
  // Fix: Get scientist name properly - handle if scientistId is an object or string
  const getScientistName = () => {
    if (!selectedProject) return 'Not assigned';
    const scientistId = selectedProject.scientistId;
    // Check if scientistId is an object with name property
    if (scientistId && typeof scientistId === 'object' && scientistId.name) {
      return scientistId.name;
    }
    // If it's a string ID, we need to find the scientist from the projects data
    if (scientistId && typeof scientistId === 'string') {
      // Try to find scientist from projects list (projects already populated with scientist data)
      const scientist = projects?.find(p => p._id === selectedProjectId)?.scientistId;
      if (scientist && typeof scientist === 'object' && scientist.name) {
        return scientist.name;
      }
      return scientistId; // Return the ID if name not found
    }
    return 'Not assigned';
  };

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
      if (!selectedProjectId) {
        toast.error('Please select a project first');
        return;
      }

      // Get scientistId properly
      let scientistIdValue = null;
      if (selectedProject && selectedProject.scientistId) {
        // If scientistId is an object with _id, use that
        if (typeof selectedProject.scientistId === 'object' && selectedProject.scientistId._id) {
          scientistIdValue = selectedProject.scientistId._id;
        } 
        // If it's a string, use it directly
        else if (typeof selectedProject.scientistId === 'string') {
          scientistIdValue = selectedProject.scientistId;
        }
      }

      if (!scientistIdValue) {
        toast.error('Project scientist information not found');
        return;
      }

      const staffData = {
        ...values,
        doj: values.doj.toISOString(),
        lastDay: values.lastDay ? values.lastDay.toISOString() : undefined,
        projectId: selectedProjectId,
        scientistId: scientistIdValue, // Add scientistId to the staff data
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
    } catch (error: any) {
      console.error('Staff operation error:', error);
      toast.error(error?.data?.message || 'Operation failed');
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
              onChange={(value) => {
                setSelectedProjectId(value);
                setEditingStaff(null);
                setIsModalOpen(false);
              }}
              value={selectedProjectId}
            >
              {projects?.map(p => {
                // Get scientist name safely
                let scientistDisplay = 'No scientist assigned';
                if (p.scientistId) {
                  if (typeof p.scientistId === 'object' && p.scientistId.name) {
                    scientistDisplay = p.scientistId.name;
                  } else if (typeof p.scientistId === 'string') {
                    scientistDisplay = `Scientist ID: ${p.scientistId}`;
                  }
                }
                return (
                  <Option key={p._id} value={p._id}>
                    {p.name} - {p.type} ({scientistDisplay})
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
        </Form>
        
        {selectedProject && (
          <div style={{ marginTop: 12, padding: '8px 12px', background: '#f0f2f5', borderRadius: '4px' }}>
            <Space split={<span>|</span>}>
              <span><strong>Project:</strong> {selectedProject.name}</span>
              <span><strong>Type:</strong> {selectedProject.type}</span>
              <span><strong>Scientist:</strong> {getScientistName()}</span>
            </Space>
          </div>
        )}
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
              {/* Project Info Display */}
              <div style={{ marginBottom: 16, padding: '12px', background: '#f0f2f5', borderRadius: '4px' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div><strong>Project:</strong> {selectedProject?.name}</div>
                  <div><strong>Scientist:</strong> {getScientistName()}</div>
                </Space>
              </div>

              {/* NAME */}
              <div style={{ marginBottom: 16 }}>
                <label>Name *</label>
                <Field name="name">
                  {({ field }: any) => (
                    <Input 
                      {...field} 
                      status={errors.name && touched.name ? 'error' : ''} 
                      placeholder="Enter staff name"
                    />
                  )}
                </Field>
               
              </div>

              {/* DESIGNATION */}
              <div style={{ marginBottom: 16 }}>
                <label>Designation *</label>
                <Field name="designation">
                  {({ field }: any) => (
                    <Input 
                      {...field} 
                      status={errors.designation && touched.designation ? 'error' : ''} 
                      placeholder="Enter designation"
                    />
                  )}
                </Field>
             
              </div>

              {/* DOJ */}
              <div style={{ marginBottom: 16 }}>
                <label>Date of Joining *</label>
                <DatePicker
                  style={{ width: '100%' }}
                  value={values.doj}
                  onChange={(date) => setFieldValue('doj', date)}
                  status={errors.doj && touched.doj ? 'error' : ''}
                  placeholder="Select joining date"
                />
                {errors.doj && touched.doj && (
                  <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>Required</div>
                )}
              </div>

              {/* CURRENTLY WORKING */}
              <div style={{ marginBottom: 16 }}>
                <label>Currently Working *</label>
                <Select
                  value={values.currentlyWorking}
                  onChange={(value) => {
                    setFieldValue('currentlyWorking', value);
                    if (value) setFieldValue('lastDay', null);
                  }}
                  style={{ width: '100%' }}
                >
                  <Option value={true}>Yes</Option>
                  <Option value={false}>No</Option>
                </Select>
              </div>

              {/* LAST DAY */}
              {!values.currentlyWorking && (
                <div style={{ marginBottom: 16 }}>
                  <label>Last Working Day *</label>
                  <DatePicker
                    style={{ width: '100%' }}
                    value={values.lastDay}
                    onChange={(date) => setFieldValue('lastDay', date)}
                    status={errors.lastDay && touched.lastDay ? 'error' : ''}
                    placeholder="Select last working day"
                  />
                  {errors.lastDay && touched.lastDay && (
                    <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errors.lastDay}</div>
                  )}
                </div>
              )}

              {/* MOBILE */}
              <div style={{ marginBottom: 16 }}>
                <label>Mobile *</label>
                <Field name="mobile">
                  {({ field }: any) => (
                    <Input 
                      {...field} 
                      status={errors.mobile && touched.mobile ? 'error' : ''} 
                      placeholder="Enter mobile number"
                    />
                  )}
                </Field>
               
              </div>

              {/* EMAIL */}
              <div style={{ marginBottom: 16 }}>
                <label>Email *</label>
                <Field name="email">
                  {({ field }: any) => (
                    <Input 
                      {...field} 
                      status={errors.email && touched.email ? 'error' : ''} 
                      placeholder="Enter email address"
                      type="email"
                    />
                  )}
                </Field>
               
              </div>

              {/* REMARK */}
              <div style={{ marginBottom: 16 }}>
                <label>Remarks</label>
                <Field name="remark">
                  {({ field }: any) => (
                    <TextArea {...field} rows={3} placeholder="Any additional remarks" />
                  )}
                </Field>
              </div>

              {/* BUTTONS */}
              <Space>
                <Button type="primary" htmlType="submit" loading={isSubmitting}>
                  {editingStaff ? 'Update' : 'Create'}
                </Button>

                <Button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingStaff(null);
                  }}
                >
                  Cancel
                </Button>
              </Space>
            </FormikForm>
          )}
        </Formik>
      </Modal>
    </div>
  );
};

export default Staff;