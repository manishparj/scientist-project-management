// frontend/src/pages/Dashboard.tsx
import { Row, Col, Card, Statistic, Table, Tag } from 'antd';
import { UserOutlined, ProjectOutlined, TeamOutlined } from '@ant-design/icons';
import { useGetScientistsQuery, useGetProjectsQuery, useGetStaffByProjectQuery } from '../store/api';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { data: scientists } = useGetScientistsQuery();
  const { data: projects } = useGetProjectsQuery();
  const [allStaff, setAllStaff] = useState<any[]>([]);

  useEffect(() => {
    if (projects) {
      Promise.all(projects.map(p => fetch(`/api/staff/project/${p._id}`).then(res => res.json())))
        .then(results => {
          setAllStaff(results.flat());
        });
    }
  }, [projects]);

  const projectStatusData = projects?.reduce((acc: any, project) => {
    const status = project.status === 'completed' ? 'Completed' : 
                   project.status === 'ongoing' ? 'Ongoing' : 'Yet to Start';
    const existing = acc.find((item: any) => item.name === status);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: status, value: 1 });
    }
    return acc;
  }, []);

  const recentProjects = projects?.slice(-5).map(project => ({
    key: project._id,
    name: project.name,
    type: project.type,
    status: project.status,
    startDate: new Date(project.startDate).toLocaleDateString(),
  }));

  const columns = [
    { title: 'Project Name', dataIndex: 'name', key: 'name' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'completed' ? 'green' : status === 'ongoing' ? 'blue' : 'orange'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    { title: 'Start Date', dataIndex: 'startDate', key: 'startDate' },
  ];

  return (
    <div>
      <h1>Dashboard</h1>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Scientists"
              value={scientists?.length || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Projects"
              value={projects?.length || 0}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Staff"
              value={allStaff.length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Project Status Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#1890ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Recent Projects">
            <Table 
              dataSource={recentProjects} 
              columns={columns} 
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;