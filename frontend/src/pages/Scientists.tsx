// frontend/src/pages/Scientists.tsx
import { useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useGetScientistsQuery, useCreateScientistMutation, useUpdateScientistMutation, useDeleteScientistMutation } from '../store/api';
import { Formik, Form as FormikForm, Field } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

const scientistSchema = Yup.object({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Minimum 6 characters').required('Required'),
  designation: Yup.string().required('Required'),
  mobile: Yup.string().required('Required'),
});

const Scientists = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScientist, setEditingScientist] = useState<any>(null);
  const { data: scientists, isLoading, refetch } = useGetScientistsQuery();
  const [createScientist] = useCreateScientistMutation();
  const [updateScientist] = useUpdateScientistMutation();
  const [deleteScientist] = useDeleteScientistMutation();

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Designation', dataIndex: 'designation', key: 'designation' },
    { title: 'Mobile', dataIndex: 'mobile', key: 'mobile' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Delete Scientist"
            description="Are you sure you want to delete this scientist?"
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

  const handleEdit = (scientist: any) => {
    setEditingScientist(scientist);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteScientist(id).unwrap();
      toast.success('Scientist deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete scientist');
    }
  };

  const handleSubmit = async (values: any, { resetForm }: any) => {
    try {
      if (editingScientist) {
        await updateScientist({ id: editingScientist._id, ...values }).unwrap();
        toast.success('Scientist updated successfully');
      } else {
        await createScientist(values).unwrap();
        toast.success('Scientist created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      setEditingScientist(null);
      refetch();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>Scientists Management</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Add Scientist
        </Button>
      </div>

      <Table 
        dataSource={scientists} 
        columns={columns} 
        loading={isLoading}
        rowKey="_id"
        scroll={{ x: true }}
      />

      <Modal
        title={editingScientist ? 'Edit Scientist' : 'Add New Scientist'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingScientist(null);
        }}
        footer={null}
        width={600}
      >
        <Formik
          initialValues={{
            name: editingScientist?.name || '',
            email: editingScientist?.email || '',
            password: '',
            designation: editingScientist?.designation || '',
            mobile: editingScientist?.mobile || '',
          }}
          validationSchema={scientistSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, isSubmitting, handleSubmit }) => (
            <FormikForm onSubmit={handleSubmit}>
              <Form layout="vertical">
                <Form.Item 
                  label="Name" 
                  validateStatus={errors.name && touched.name ? 'error' : ''}
                  help={errors.name && touched.name && errors.name}
                >
                  <Field name="name" as={Input} placeholder="Full name" />
                </Form.Item>

                <Form.Item 
                  label="Email" 
                  validateStatus={errors.email && touched.email ? 'error' : ''}
                  help={errors.email && touched.email && errors.email}
                >
                  <Field name="email" as={Input} placeholder="Email address" />
                </Form.Item>

                {!editingScientist && (
                  <Form.Item 
                    label="Password" 
                    validateStatus={errors.password && touched.password ? 'error' : ''}
                    help={errors.password && touched.password && errors.password}
                  >
                    <Field name="password" as={Input.Password} placeholder="Password" />
                  </Form.Item>
                )}

                <Form.Item 
                  label="Designation" 
                  validateStatus={errors.designation && touched.designation ? 'error' : ''}
                  help={errors.designation && touched.designation && errors.designation}
                >
                  <Field name="designation" as={Input} placeholder="Designation" />
                </Form.Item>

                <Form.Item 
                  label="Mobile" 
                  validateStatus={errors.mobile && touched.mobile ? 'error' : ''}
                  help={errors.mobile && touched.mobile && errors.mobile}
                >
                  <Field name="mobile" as={Input} placeholder="Mobile number" />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit" loading={isSubmitting}>
                      {editingScientist ? 'Update' : 'Create'}
                    </Button>
                    <Button onClick={() => {
                      setIsModalOpen(false);
                      setEditingScientist(null);
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

export default Scientists;