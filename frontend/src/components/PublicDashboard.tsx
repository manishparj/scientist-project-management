import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Statistic, Row, Col, Tabs, Spin, message } from 'antd';
import { 
  TeamOutlined, 
  ProjectOutlined, 
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import axios from '../utils/axios';
import { Project, User } from '../types';
import dayjs from 'dayjs';

const { TabPane } = Tabs;

const PublicDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [scientists, setScientists] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetchPublicData();
  }, []);

  const fetchPublicData = async () => {
    setLoading(true);
    try {
      const [scientistsRes, projectsRes] = await Promise.all([
        axios.get('/scientists'),
        axios.get('/projects')
      ]);
      setScientists(scientistsRes.data.data);
      setProjects(projectsRes.data.data);
    } catch (error) {
      message.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalScientists: scientists.length,
    totalProjects: projects.length,
    totalStaff: projects.reduce((sum, p) => sum + (p.staffDetails?.length || 0), 0),
    activeProjects: projects.filter(p => p.status === 'ongoing').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    yetToStartProjects: projects.filter(p => p.status === 'yet_to_start').length,
  };

  const projectColumns = [
    { 
      title: 'Project Name', 
      dataIndex: 'projectName', 
      key: 'projectName',
      width: 200,
    },
    { 
      title: 'Scientist', 
      dataIndex: ['scientistId', 'name'], 
      key: 'scientist',
      render: (name: string, record: any) => (
        <div>
          <div>{name}</div>
          <small style={{ color: '#666' }}>{record.scientistId?.designation}</small>
        </div>
      )
    },
    { 
      title: 'Type', 
      dataIndex: 'projectType', 
      key: 'type',
      render: (type: string) => <Tag color="blue">{type}</Tag>
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
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          ongoing: { color: 'processing', text: 'Ongoing', icon: <PlayCircleOutlined /> },
          completed: { color: 'success', text: 'Completed', icon: <CheckCircleOutlined /> },
          yet_to_start: { color: 'default', text: 'Yet to Start', icon: <ClockCircleOutlined /> },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
      }
    },
    { 
      title: 'Staff Count', 
      key: 'staffCount',
      render: (_: any, record: Project) => (
        <Tag color="purple">{record.staffDetails?.length || 0} Members</Tag>
      )
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <Card style={{ marginBottom: 24 }}>
          <h1 style={{ textAlign: 'center', marginBottom: 32 }}>Scientist Management System</h1>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card>
                <Statistic 
                  title="Total Scientists" 
                  value={stats.totalScientists} 
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card>
                <Statistic 
                  title="Total Projects" 
                  value={stats.totalProjects} 
                  prefix={<ProjectOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card>
                <Statistic 
                  title="Total Staff" 
                  value={stats.totalStaff} 
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card>
                <Statistic 
                  title="Active Projects" 
                  value={stats.activeProjects} 
                  prefix={<PlayCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card>
                <Statistic 
                  title="Completed" 
                  value={stats.completedProjects} 
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card>
                <Statistic 
                  title="Yet to Start" 
                  value={stats.yetToStartProjects} 
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
          </Row>
        </Card>

        <Card title="All Projects">
          <Table
            columns={projectColumns}
            dataSource={projects}
            rowKey="_id"
            expandable={{
              expandedRowRender: (record) => (
                <div>
                  <h4>Project Staff Details</h4>
                  <Table
                    dataSource={record.staffDetails}
                    columns={[
                      { title: 'Name', dataIndex: 'name', key: 'name' },
                      { title: 'Designation', dataIndex: 'designation', key: 'designation' },
                      { 
                        title: 'DOJ', 
                        dataIndex: 'doj', 
                        key: 'doj',
                        render: (date: string) => dayjs(date).format('YYYY-MM-DD')
                      },
                      { 
                        title: 'Last Working Day', 
                        dataIndex: 'lastWorkingDay', 
                        key: 'lastWorkingDay',
                        render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-'
                      },
                      { 
                        title: 'Status', 
                        dataIndex: 'currentlyWorking', 
                        key: 'currentlyWorking',
                        render: (working: boolean) => (
                          <Tag color={working ? 'green' : 'red'}>
                            {working ? 'Currently Working' : 'Former Staff'}
                          </Tag>
                        )
                      },
                      { title: 'Mobile', dataIndex: 'mobile', key: 'mobile' },
                      { title: 'Email', dataIndex: 'email', key: 'email' },
                      { title: 'Remarks', dataIndex: 'remarks', key: 'remarks' },
                    ]}
                    rowKey="_id"
                    pagination={false}
                  />
                </div>
              ),
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default PublicDashboard;