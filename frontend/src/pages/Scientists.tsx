import { useState } from 'react';
import { Table, Button, Modal, Input, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  useGetScientistsQuery,
  useCreateScientistMutation,
  useUpdateScientistMutation,
  useDeleteScientistMutation
} from '../store/api';
import { Formik, Form as FormikForm, Field } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

const scientistSchema = Yup.object({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().when('$isEdit', {
    is: false,
    then: (schema) => schema.required('Required').min(6, 'Minimum 6 characters'),
    otherwise: (schema) => schema.notRequired(),
  }),
  designation: Yup.string().required('Required'),
  mobile: Yup.string().required('Required'),
});

const Scientists = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScientist, setEditingScientist] = useState<any>(null);

  const { data: scientists } = useGetScientistsQuery();
  const [createScientist] = useCreateScientistMutation();
  const [updateScientist] = useUpdateScientistMutation();
  const [deleteScientist] = useDeleteScientistMutation();

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
      setEditingScientist(null);
      resetForm();
      refetch();

    } catch (error) {
      toast.error('Operation failed');
    }
  };

  return (
    <div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsModalOpen(true)}
      >
        Add Scientist
      </Button>

      <Table
        dataSource={scientists}
  columns={[
    { title: 'Name', dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'designation', dataIndex: 'designation' },
    { title: 'role', dataIndex: 'role' },
    { title: 'mobile', dataIndex: 'mobile' },
  ]}
  rowKey="_id"
      />

      <Modal
        title={editingScientist ? 'Edit Scientist' : 'Add Scientist'}
        open={isModalOpen}
        footer={null}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingScientist(null);
        }}
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
          context={{ isEdit: !!editingScientist }}
        >
          {({ errors, touched, isSubmitting }) => (
            <FormikForm>

              {/* NAME */}
              <div style={{ marginBottom: 16 }}>
                <label>Name</label>
                <Field name="name">
                  {({ field }: any) => (
                    <Input {...field} status={errors.name && touched.name ? 'error' : ''} />
                  )}
                </Field>
               
              </div>

              {/* EMAIL */}
              <div style={{ marginBottom: 16 }}>
                <label>Email</label>
                <Field name="email">
                  {({ field }: any) => (
                    <Input {...field} status={errors.email && touched.email ? 'error' : ''} />
                  )}
                </Field>
             
              </div>

              {/* PASSWORD */}
              {!editingScientist && (
                <div style={{ marginBottom: 16 }}>
                  <label>Password</label>
                  <Field name="password">
                    {({ field }: any) => (
                      <Input.Password
                        {...field}
                        status={errors.password && touched.password ? 'error' : ''}
                      />
                    )}
                  </Field>
                  {errors.password && touched.password && (
                    <div style={{ color: 'red' }}>{errors.password}</div>
                  )}
                </div>
              )}

              {/* DESIGNATION */}
              <div style={{ marginBottom: 16 }}>
                <label>Designation</label>
                <Field name="designation">
                  {({ field }: any) => (
                    <Input {...field} status={errors.designation && touched.designation ? 'error' : ''} />
                  )}
                </Field>
              </div>

              {/* MOBILE */}
              <div style={{ marginBottom: 16 }}>
                <label>Mobile</label>
                <Field name="mobile">
                  {({ field }: any) => (
                    <Input {...field} status={errors.mobile && touched.mobile ? 'error' : ''} />
                  )}
                </Field>
              
              </div>

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

            </FormikForm>
          )}
        </Formik>
      </Modal>
    </div>
  );
};

export default Scientists;