// frontend/src/pages/Projects.tsx
import { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, Space, Popconfirm, Tag, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, ProjectOutlined } from '@ant-design/icons';
import { useGetProjectsQuery, useCreateProjectMutation, useUpdateProjectMutation, useDeleteProjectMutation, useGetScientistsQuery } from '../store/api';
import { Formik, Form as FormikForm, Field } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const projectSchema = Yup.object({
  name: Yup.string().required('Required'),
  type: Yup.string().required('Required'),
  status: Yup.string().required('Required'),
  scientistId: Yup.string().required('Required'),
  dateRange: Yup.array()
    .test('date-range', 'Date range is required', (value) => {
      return value && value[0] && value[1];
    })
});

const Projects = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const { data: projects, isLoading, refetch } = useGetProjectsQuery();
  const { data: scientists } = useGetScientistsQuery();
  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  // Helper function to get scientist details
  const getScientistDetails = (scientistId: any) => {
    if (!scientistId) return { name: 'Not Assigned', designation: '', email: '' };
    
    // If scientistId is an object with name property (populated data)
    if (typeof scientistId === 'object' && scientistId.name) {
      return {
        name: scientistId.name,
        designation: scientistId.designation || '',
        email: scientistId.email || ''
      };
    }
    
    // If scientistId is a string ID, find from scientists list
    if (typeof scientistId === 'string') {
      const scientist = scientists?.find(s => s._id === scientistId);
      if (scientist) {
        return {
          name: scientist.name,
          designation: scientist.designation || '',
          email: scientist.email || ''
        };
      }
    }
    
    return { name: 'Not Assigned', designation: '', email: '' };
  };

  const columns = [
    { 
      title: 'Project Name', 
      dataIndex: 'name', 
      key: 'name',
      width: 200,
      fixed: 'left' as const,
      render: (text: string, record: any) => (
        <Space>
          <Avatar 
            icon={<ProjectOutlined />} 
            style={{ backgroundColor: '#1890ff' }}
            size="small"
          />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      )
    },
    { 
      title: 'Type', 
      dataIndex: 'type', 
      key: 'type',
      width: 150,
      render: (text: string) => (
        <Tag color="geekblue">{text}</Tag>
      )
    },
    {
      title: 'Scientist',
      key: 'scientist',
      width: 250,
      render: (_: any, record: any) => {
        const scientist = getScientistDetails(record.scientistId);
        return (
          <Space direction="vertical" size={0}>
            <Space>
              <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#52c41a' }} />
              <strong>{scientist.name}</strong>
            </Space>
            {scientist.designation && (
              <span style={{ fontSize: '12px', color: '#666', marginLeft: '24px' }}>
                {scientist.designation}
              </span>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={status === 'completed' ? 'green' : status === 'ongoing' ? 'blue' : 'orange'}>
          {status === 'yet_to_start' ? 'Yet to Start' : status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    { 
      title: 'Start Date', 
      dataIndex: 'startDate', 
      key: 'startDate', 
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD') 
    },
    { 
      title: 'End Date', 
      dataIndex: 'endDate', 
      key: 'endDate', 
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD') 
    },
    {
      title: 'Duration',
      key: 'duration',
      width: 120,
      render: (_: any, record: any) => {
        const start = dayjs(record.startDate);
        const end = dayjs(record.endDate);
        const days = end.diff(start, 'day');
        const months = end.diff(start, 'month');
        
        if (months > 0) {
          return <Tag color="cyan">{months} month(s)</Tag>;
        }
        return <Tag color="cyan">{days} day(s)</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Delete Project"
            description="This will also delete all staff associated with this project. Are you sure?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id).unwrap();
      toast.success('Project deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleSubmit = async (values: any, { resetForm }: any) => {
    try {
      const projectData = {
        name: values.name,
        type: values.type,
        status: values.status,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        scientistId: values.scientistId,
      };

      if (editingProject) {
        await updateProject({ id: editingProject._id, ...projectData }).unwrap();
        toast.success('Project updated successfully');
      } else {
        await createProject(projectData).unwrap();
        toast.success('Project created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      setEditingProject(null);
      refetch();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Projects Management</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Add Project
        </Button>
      </div>

      <Table 
        dataSource={projects} 
        columns={columns} 
        loading={isLoading}
        rowKey="_id"
        scroll={{ x: 1300 }}
        pagination={{ 
          pageSize: 10, 
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} projects`
        }}
      />

      <Modal
        title={editingProject ? 'Edit Project' : 'Add New Project'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        footer={null}
        width={600}
      >
        <Formik
          initialValues={{
            name: editingProject?.name || '',
            type: editingProject?.type || '',
            status: editingProject?.status || 'ongoing',
            scientistId: editingProject?.scientistId?._id || editingProject?.scientistId || '',
            dateRange: editingProject ? [dayjs(editingProject.startDate), dayjs(editingProject.endDate)] : null,
          }}
          validationSchema={projectSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, isSubmitting, setFieldValue, values }) => (
            <FormikForm>
              {/* PROJECT NAME */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                  Project Name <span style={{ color: 'red' }}>*</span>
                </label>
                <Field name="name">
                  {({ field }: any) => (
                    <Input 
                      {...field} 
                      status={errors.name && touched.name ? 'error' : ''} 
                      placeholder="Enter project name"
                    />
                  )}
                </Field>
                
              </div>

              {/* TYPE */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                  Project Type <span style={{ color: 'red' }}>*</span>
                </label>
                <Field name="type">
                  {({ field }: any) => (
                    <Input 
                      {...field} 
                      status={errors.type && touched.type ? 'error' : ''} 
                      placeholder="Enter project type (e.g., Research, Development)"
                    />
                  )}
                </Field>
               
              </div>

              {/* STATUS */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                  Status <span style={{ color: 'red' }}>*</span>
                </label>
                <Select
                  value={values.status}
                  onChange={(value) => setFieldValue('status', value)}
                  status={errors.status && touched.status ? 'error' : ''}
                  style={{ width: '100%' }}
                  placeholder="Select project status"
                >
                  <Option value="completed">Completed</Option>
                  <Option value="ongoing">Ongoing</Option>
                  <Option value="yet_to_start">Yet to Start</Option>
                </Select>
             
              </div>

              {/* SCIENTIST */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                  Scientist <span style={{ color: 'red' }}>*</span>
                </label>
                <Select
                  value={values.scientistId}
                  onChange={(value) => setFieldValue('scientistId', value)}
                  status={errors.scientistId && touched.scientistId ? 'error' : ''}
                  style={{ width: '100%' }}
                  placeholder="Select scientist"
                  showSearch
                  optionFilterProp="children"
                >
                  {scientists?.map((s: any) => (
                    <Option key={s._id} value={s._id}>
                      <Space>
                        <Avatar size="small" icon={<UserOutlined />} />
                        <span>{s.name}</span>
                        <span style={{ color: '#666', fontSize: '12px' }}>({s.designation})</span>
                      </Space>
                    </Option>
                  ))}
                </Select>
              
              </div>

              {/* DATE RANGE */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                  Project Duration <span style={{ color: 'red' }}>*</span>
                </label>
                <RangePicker
                  style={{ width: '100%' }}
                  value={values.dateRange as [dayjs.Dayjs | null, dayjs.Dayjs | null]}
                  onChange={(dates) => setFieldValue('dateRange', dates)}
                  status={errors.dateRange && touched.dateRange ? 'error' : ''}
                  placeholder={['Start Date', 'End Date']}
                />
                {errors.dateRange && touched.dateRange && (
                  <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>Date range is required</div>
                )}
              </div>

              {/* BUTTONS */}
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <Space>
                  <Button
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingProject(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit" loading={isSubmitting}>
                    {editingProject ? 'Update Project' : 'Create Project'}
                  </Button>
                </Space>
              </div>
            </FormikForm>
          )}
        </Formik>
      </Modal>
    </div>
  );
};

export default Projects;