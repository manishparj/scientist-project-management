import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Table, Button, Space, Tag, Statistic, Row, Col, Tabs, Avatar, message } from 'antd';
import { 
  UserOutlined, 
  ProjectOutlined, 
  DashboardOutlined, 
  LogoutOutlined,
  PlusOutlined,
  TeamOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import ScientistForm from './ScientistForm';
import ProjectForm from './ProjectForm';
import axios from '../utils/axios';
import { Project, User } from '../types';
import dayjs from 'dayjs';

const { Header, Sider, Content } = Layout;
const { TabPane } = Tabs;

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [scientistModal, setScientistModal] = useState(false);
  const [projectModal, setProjectModal] = useState(false);
  const [scientists, setScientists] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user?.role === 'superadmin') {
        const scientistsRes = await axios.get('/scientists');
        setScientists(scientistsRes.data.data);
      }
      const projectsRes = await axios.get('/projects');
      setProjects(projectsRes.data.data);
    } catch (error) {
      message.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const scientistColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Designation', dataIndex: 'designation', key: 'designation' },
    { title: 'Mobile', dataIndex: 'mobile', key: 'mobile' },
    {
      title: 'Projects',
      key: 'projects',
      render: (_: any, record: User) => {
        const scientistProjects = projects.filter(p => p.scientistId._id === record._id);
        return <Tag color="blue">{scientistProjects.length} Projects</Tag>;
      }
    },
  ];

  const projectColumns = [
  { title: 'Project Name', dataIndex: 'projectName', key: 'projectName' },
  { 
    title: 'Scientist', 
    dataIndex: ['scientistId', 'name'], 
    key: 'scientist' 
  },
  { 
    title: 'Start Date', 
    dataIndex: 'startDate', 
    key: 'startDate',
    render: (date: string) => dayjs(date).format('YYYY-MM-DD')
  },
  { 
    title: 'End Date', 
    dataIndex: 'endDate', 
    key: 'endDate',
    render: (date: string) => dayjs(date).format('YYYY-MM-DD')
  },
  { 
    title: 'Type', 
    dataIndex: 'projectType', 
    key: 'type',
    render: (type: string) => <Tag color="green">{type}</Tag>
  },
  { 
    title: 'Status', 
    dataIndex: 'status', 
    key: 'status',
    render: (status: string) => {
      const statusColors = {
        ongoing: 'processing',
        completed: 'success',
        yet_to_start: 'default'
      };
      const statusText = {
        ongoing: 'Ongoing',
        completed: 'Completed',
        yet_to_start: 'Yet to Start'
      };
      return <Tag color={statusColors[status as keyof typeof statusColors]}>
        {statusText[status as keyof typeof statusText]}
      </Tag>;
    }
  },
  { 
    title: 'Staff Count', 
    key: 'staffCount',
    render: (_: any, record: Project) => record.staffDetails?.length || 0
  },
];

  const stats = {
  totalScientists: scientists.length,
  totalProjects: projects.length,
  totalStaff: projects.reduce((sum, p) => sum + (p.staffDetails?.length || 0), 0),
  activeProjects: projects.filter(p => p.status === 'ongoing').length,
};

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark">
        <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
          <Avatar size={64} icon={<UserOutlined />} />
          <h3 style={{ color: 'white', marginTop: 10 }}>{user?.name}</h3>
          <p style={{ color: '#aaa', fontSize: 12 }}>{user?.role === 'superadmin' ? 'Super Admin' : 'Scientist'}</p>
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['dashboard']}>
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            Dashboard
          </Menu.Item>
          {user?.role === 'superadmin' && (
            <Menu.Item key="scientists" icon={<TeamOutlined />}>
              Scientists
            </Menu.Item>
          )}
          <Menu.Item key="projects" icon={<ProjectOutlined />}>
            Projects
          </Menu.Item>
          <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logout}>
            Logout
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Scientist Management System</h2>
          {user?.role === 'superadmin' && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setScientistModal(true)}>
              Add Scientist
            </Button>
          )}
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setProjectModal(true)}>
            Add Project
          </Button>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic title="Total Scientists" value={stats.totalScientists} prefix={<TeamOutlined />} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="Total Projects" value={stats.totalProjects} prefix={<ProjectOutlined />} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="Total Staff" value={stats.totalStaff} prefix={<UserOutlined />} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="Active Projects" value={stats.activeProjects} prefix={<FileTextOutlined />} />
              </Card>
            </Col>
          </Row>

          <Tabs defaultActiveKey="projects">
            {user?.role === 'superadmin' && (
              <TabPane tab="Scientists" key="scientists">
                <Table
                  columns={scientistColumns}
                  dataSource={scientists}
                  rowKey="_id"
                  loading={loading}
                />
              </TabPane>
            )}
            <TabPane tab="Projects" key="projects">
              <Table
                columns={projectColumns}
                dataSource={projects}
                rowKey="_id"
                loading={loading}
                expandable={{
                  expandedRowRender: (record) => (
                    <div style={{ margin: 0 }}>
                      <h4>Project Staff</h4>
                      <Table
                        dataSource={record.staffDetails}
                        columns={[
                          { title: 'Name', dataIndex: 'name', key: 'name' },
                          { title: 'Post', dataIndex: 'post', key: 'post' },
                          { 
                            title: 'DOJ', 
                            dataIndex: 'doj', 
                            key: 'doj',
                            render: (date: string) => dayjs(date).format('YYYY-MM-DD')
                          },
                          { 
                            title: 'Last Date', 
                            dataIndex: 'lastDate', 
                            key: 'lastDate',
                            render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-'
                          },
                          { 
                            title: 'Presently Working', 
                            dataIndex: 'presentlyWorking', 
                            key: 'presentlyWorking',
                            render: (working: boolean) => (
                              <Tag color={working ? 'green' : 'red'}>
                                {working ? 'Yes' : 'No'}
                              </Tag>
                            )
                          },
                          { title: 'Mobile', dataIndex: 'mobile', key: 'mobile' },
                          { title: 'Email', dataIndex: 'email', key: 'email' },
                        ]}
                        rowKey="_id"
                        pagination={false}
                      />
                    </div>
                  ),
                }}
              />
            </TabPane>
          </Tabs>
        </Content>
      </Layout>

      <ScientistForm
        visible={scientistModal}
        onCancel={() => setScientistModal(false)}
        onSuccess={fetchData}
      />

      <ProjectForm
        visible={projectModal}
        onCancel={() => setProjectModal(false)}
        onSuccess={fetchData}
        scientistId={user?.role === 'scientist' ? user._id : undefined}
      />
    </Layout>
  );
};

export default Dashboard;