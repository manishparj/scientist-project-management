import { useState } from 'react';
import { Table, Button, Modal, Tag, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useGetStaffByProjectQuery, useDeleteStaffMutation } from '../services/staffApi';
import StaffForm from './StaffForm';
import StaffEditForm from './StaffEditForm';
import dayjs from 'dayjs';

const StaffManagement = ({ projectId }: { projectId: string }) => {
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const { data: staff, isLoading, refetch } = useGetStaffByProjectQuery(projectId);
  const [deleteStaff] = useDeleteStaffMutation();

  const handleDelete = async (id: string) => {
    try {
      await deleteStaff(id).unwrap();
      message.success('Staff deleted successfully');
      refetch();
    } catch (error: any) {
      message.error(error.data?.message || 'Failed to delete staff');
    }
  };

  const handleEdit = (staffMember: any) => {
    setEditingStaff(staffMember);
    setShowEditForm(true);
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setEditingStaff(null);
    refetch();
    message.success('Staff updated successfully');
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      key: 'mobile',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'DOJ',
      dataIndex: 'doj',
      key: 'doj',
      render: (date: string) => dayjs(date).format('DD-MM-YYYY'),
    },
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
    {
      title: 'Last Working Day',
      dataIndex: 'lastWorkingDay',
      key: 'lastWorkingDay',
      render: (date: string) => date ? dayjs(date).format('DD-MM-YYYY') : '-',
    },
    {
  title: 'Leaving Reason',
  dataIndex: 'leavingReason',
  key: 'leavingReason',
  ellipsis: true,
  render: (reason: string, record: any) =>
    record.currentlyWorking ? null : (reason || '-'),
},
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete Staff"
            description="Are you sure you want to delete this staff member?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => {
          setEditingStaff(null);
          setShowStaffForm(true);
        }}
        style={{ marginBottom: 16 }}
      >
        Add Staff Member
      </Button>
      <Table
        columns={columns}
        dataSource={staff}
        loading={isLoading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title="Add Staff Member"
        open={showStaffForm}
        onCancel={() => setShowStaffForm(false)}
        footer={null}
        width={600}
      >
        <StaffForm
          projectId={projectId}
          onSuccess={() => {
            setShowStaffForm(false);
            refetch();
          }}
        />
      </Modal>
      <Modal
        title="Edit Staff Member"
        open={showEditForm}
        onCancel={() => {
          setShowEditForm(false);
          setEditingStaff(null);
        }}
        footer={null}
        width={600}
      >
        {editingStaff && (
          <StaffEditForm
            staff={editingStaff}
            projectId={projectId}
            onSuccess={handleEditSuccess}
            onCancel={() => {
              setShowEditForm(false);
              setEditingStaff(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default StaffManagement;