import { useState } from 'react';
import { Table, Tag, Button, Space, Popconfirm, message, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import { useGetProjectsQuery, useDeleteProjectMutation, useUpdateProjectMutation } from '../services/projectApi';
import { Project } from '../types';
import dayjs from 'dayjs';
import ProjectEditForm from './ProjectEditForm';

const ProjectList = ({ onSelectProject }: { onSelectProject: (id: string) => void }) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { data: projects, isLoading, refetch } = useGetProjectsQuery();
  const [deleteProject] = useDeleteProjectMutation();
  const [updateProject] = useUpdateProjectMutation();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'On Going': 'green',
      'Completed': 'blue',
      'Yet to start': 'orange',
      'Cancelled': 'red',
      'Archive': 'default',
    };
    return colors[status] || 'default';
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id).unwrap();
      message.success('Project deleted successfully');
      refetch();
    } catch (error: any) {
      message.error(error.data?.message || 'Failed to delete project');
    }
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setEditModalVisible(true);
  };

  const handleUpdateSuccess = () => {
    setEditModalVisible(false);
    setSelectedProject(null);
    refetch();
    message.success('Project updated successfully');
  };

  const columns = [
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: 'Short Name',
      dataIndex: 'projectShortName',
      key: 'projectShortName',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => dayjs(date).format('DD-MM-YYYY'),
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => dayjs(date).format('DD-MM-YYYY'),
    },
    {
      title: 'Duration (Days)',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Pending (Days)',
      dataIndex: 'pendingDuration',
      key: 'pendingDuration',
    },
    {
      title: 'Staff Count',
      dataIndex: 'staffCount',
      key: 'staffCount',
    },
    {
      title: 'Budget',
      dataIndex: 'allocatedBudget',
      key: 'allocatedBudget',
      render: (budget: number) => `₹${budget.toLocaleString()}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Project) => (
        <Space>
          <Button
            icon={<TeamOutlined />}
            onClick={() => onSelectProject(record._id)}
          >
            Staff
          </Button>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Project"
            description="Are you sure you want to delete this project?"
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
    <>
      <Table
        columns={columns}
        dataSource={projects}
        loading={isLoading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />
      
      <Modal
        title="Edit Project"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedProject(null);
        }}
        footer={null}
        width={800}
      >
        {selectedProject && (
          <ProjectEditForm
            project={selectedProject}
            onSuccess={handleUpdateSuccess}
            onCancel={() => {
              setEditModalVisible(false);
              setSelectedProject(null);
            }}
          />
        )}
      </Modal>
    </>
  );
};

export default ProjectList;