// frontend/src/pages/Projects.tsx
import { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, Space, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
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
  dateRange: Yup.array().of(Yup.date()).min(2).required('Required'),
});

const Projects = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const { data: projects, isLoading, refetch } = useGetProjectsQuery();
  const { data: scientists } = useGetScientistsQuery();
  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const columns = [
    { title: 'Project Name', dataIndex: 'name', key: 'name' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'completed' ? 'green' : status === 'ongoing' ? 'blue' : 'orange'}>
          {status === 'yet_to_start' ? 'Yet to Start' : status}
        </Tag>
      ),
    },
    { title: 'Start Date', dataIndex: 'startDate', key: 'startDate', render: (date: string) => dayjs(date).format('YYYY-MM-DD') },
    { title: 'End Date', dataIndex: 'endDate', key: 'endDate', render: (date: string) => dayjs(date).format('YYYY-MM-DD') },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Delete Project"
            description="This will also delete all staff associated with this project. Are you sure?"
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
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>Projects Management</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Add Project
        </Button>
      </div>

      <Table 
        dataSource={projects} 
        columns={columns} 
        loading={isLoading}
        rowKey="_id"
        scroll={{ x: true }}
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
              <Form layout="vertical">
                <Form.Item 
                  label="Project Name" 
                  validateStatus={errors.name && touched.name ? 'error' : ''}
                  help={errors.name && touched.name && errors.name}
                >
                  <Field name="name" as={Input} placeholder="Project name" />
                </Form.Item>

                <Form.Item 
                  label="Project Type" 
                  validateStatus={errors.type && touched.type ? 'error' : ''}
                  help={errors.type && touched.type && errors.type}
                >
                  <Field name="type" as={Input} placeholder="Project type" />
                </Form.Item>

                <Form.Item 
                  label="Status" 
                  validateStatus={errors.status && touched.status ? 'error' : ''}
                  help={errors.status && touched.status && errors.status}
                >
                  <Field name="status">
                    {({ field }: any) => (
                      <Select {...field} placeholder="Select status">
                        <Option value="completed">Completed</Option>
                        <Option value="ongoing">Ongoing</Option>
                        <Option value="yet_to_start">Yet to Start</Option>
                      </Select>
                    )}
                  </Field>
                </Form.Item>

                <Form.Item 
                  label="Scientist" 
                  validateStatus={errors.scientistId && touched.scientistId ? 'error' : ''}
                  help={errors.scientistId && touched.scientistId && errors.scientistId}
                >
                  <Field name="scientistId">
                    {({ field }: any) => (
                      <Select {...field} placeholder="Select scientist">
                        {scientists?.map(s => (
                          <Option key={s._id} value={s._id}>{s.name} - {s.designation}</Option>
                        ))}
                      </Select>
                    )}
                  </Field>
                </Form.Item>

                <Form.Item 
                  label="Project Duration" 
                  validateStatus={errors.dateRange && touched.dateRange ? 'error' : ''}
                  help={errors.dateRange && touched.dateRange && 'Required'}
                >
                  <RangePicker 
                    style={{ width: '100%' }}
                    value={values.dateRange}
                    onChange={(dates) => setFieldValue('dateRange', dates)}
                  />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit" loading={isSubmitting}>
                      {editingProject ? 'Update' : 'Create'}
                    </Button>
                    <Button onClick={() => {
                      setIsModalOpen(false);
                      setEditingProject(null);
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

export default Projects;