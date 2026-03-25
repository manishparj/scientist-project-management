// frontend/src/pages/Dashboard.tsx
import { Row, Col, Card, Statistic, Table, Tag, Space, Badge, Spin, Select, Progress, Tooltip as AntTooltip, Avatar, Divider, Alert, Button, Empty } from 'antd';
import { 
  UserOutlined, 
  ProjectOutlined, 
  TeamOutlined, 
  UserSwitchOutlined,
  BarChartOutlined,
  PieChartOutlined,
  TrophyOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  FlagOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useGetScientistsQuery, useGetProjectsQuery } from '../store/api';
import { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import dayjs from 'dayjs';

const { Option } = Select;

const Dashboard = () => {
  const { data: scientists, isLoading: scientistsLoading } = useGetScientistsQuery();
  const { data: projects, isLoading: projectsLoading } = useGetProjectsQuery();
  
  // State for all staff data
  const [allStaffData, setAllStaffData] = useState<any[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [selectedScientist, setSelectedScientist] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [error, setError] = useState<string>('');

  // Create a map of scientist ID to scientist object for quick lookup
  const scientistMap = useMemo(() => {
    const map = new Map();
    scientists?.forEach(scientist => {
      map.set(scientist._id, scientist);
    });
    return map;
  }, [scientists]);

  // Fetch all staff data
  useEffect(() => {
  const fetchAllStaffData = async () => {
    if (!projects?.length) {
      setAllStaffData([]);
      return;
    }

    setStaffLoading(true);
    setError('');

    try {
      const results = await Promise.allSettled(
        projects.map(async (project) => {
          const res = await fetch(`/api/staff/project/${project._id}`);

          if (!res.ok) throw new Error("Failed");

          const data = await res.json();
          const staffList = Array.isArray(data) ? data : data.data || [];

          const scientistId =
            typeof project.scientistId === "object"
              ? project.scientistId?._id
              : project.scientistId;

          const scientist = scientistMap.get(scientistId);

          return staffList.map((staff: any) => ({
            ...staff,
            projectId: project._id,
            projectName: project.name,
            projectType: project.type,
            projectStatus: project.status,
            scientistId,
            scientistName: scientist?.name || 'Unknown',
            scientistDesignation: scientist?.designation || 'Unknown',
            scientistEmail: scientist?.email || 'Unknown'
          }));
        })
      );

      const allStaff = results
        .filter(r => r.status === "fulfilled")
        .flatMap((r: any) => r.value);

      console.log("FINAL STAFF:", allStaff); // 🔥 DEBUG

      setAllStaffData(allStaff);

      if (!allStaff.length) {
        setError('No staff members found');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch staff data');
    } finally {
      setStaffLoading(false);
    }
  };

  fetchAllStaffData();
}, [projects, scientistMap]);

  // Calculate statistics based on filters
  const statistics = useMemo(() => {
    // Apply filters
    let filteredStaff = [...allStaffData];
    
    // Filter by scientist
    if (selectedScientist !== 'all') {
      filteredStaff = filteredStaff.filter(s => s.scientistName === selectedScientist);
    }
    
    // Filter by project
    if (selectedProject !== 'all') {
      filteredStaff = filteredStaff.filter(s => s.projectName === selectedProject);
    }
    
    // Calculate totals
    const totalScientists = scientists?.length || 0;
    const totalProjects = projects?.length || 0;
    const totalStaff = allStaffData.length;
    const activeStaff = allStaffData.filter(s => s.currentlyWorking === true).length;
    const inactiveStaff = totalStaff - activeStaff;
    const filteredStaffCount = filteredStaff.length;
    
    // Projects by status
    const projectsByStatus = {
      completed: projects?.filter(p => p.status === 'completed').length || 0,
      ongoing: projects?.filter(p => p.status === 'ongoing').length || 0,
      yetToStart: projects?.filter(p => p.status === 'yet_to_start').length || 0
    };
    
    // Staff by project
    const staffByProject = projects?.map(project => {
      const projectStaff = allStaffData.filter(
  s => String(s.projectId) === String(project._id)
);
      return {
        projectId: project._id,
        projectName: project.name,
        totalStaff: projectStaff.length,
        activeStaff: projectStaff.filter(s => s.currentlyWorking === true).length,
        inactiveStaff: projectStaff.filter(s => s.currentlyWorking === false).length,
        staffList: projectStaff
      };
    }) || [];
    
    // Staff by scientist - filter scientists that actually have staff or projects
    const staffByScientist = scientists?.map(scientist => {
      const scientistProjects = projects?.filter(p => p.scientistId === scientist._id) || [];
      const scientistStaff = allStaffData.filter(s => s.scientistId === scientist._id);
      
      return {
        scientistId: scientist._id,
        scientistName: scientist.name,
        scientistDesignation: scientist.designation,
        scientistEmail: scientist.email,
        scientistMobile: scientist.mobile,
        totalProjects: scientistProjects.length,
        projectNames: scientistProjects.map(p => p.name),
        totalStaff: scientistStaff.length,
        activeStaff: scientistStaff.filter(s => s.currentlyWorking === true).length,
        inactiveStaff: scientistStaff.filter(s => s.currentlyWorking === false).length,
        staffList: scientistStaff
      };
    }).filter(s => s.totalProjects > 0 || s.totalStaff > 0) || [];
    
    // Staff by designation
    const staffByDesignation = allStaffData.reduce((acc: any, staff) => {
      const designation = staff.designation;
      if (designation) {
        if (!acc[designation]) {
          acc[designation] = {
            designation,
            count: 0,
            activeCount: 0
          };
        }
        acc[designation].count++;
        if (staff.currentlyWorking) acc[designation].activeCount++;
      }
      return acc;
    }, {});
    
    const staffByDesignationData = Object.values(staffByDesignation);
    
    // Project details with staff info
    const projectDetails = projects?.map(project => {
      const scientistId =
  typeof project.scientistId === "object"
    ? project.scientistId?._id
    : project.scientistId;

const scientist = scientistMap.get(scientistId);
      const projectStaff = allStaffData.filter(
  s => String(s.projectId) === String(project._id)
);
      
      return {
        key: project._id,
        projectName: project.name,
        projectType: project.type,
        status: project.status,
        startDate: project.startDate ? dayjs(project.startDate).format('YYYY-MM-DD') : 'N/A',
        endDate: project.endDate ? dayjs(project.endDate).format('YYYY-MM-DD') : 'N/A',
        scientistName: scientist?.name || 'Not Assigned',
        scientistEmail: scientist?.email || 'N/A',
        scientistDesignation: scientist?.designation || 'N/A',
        totalStaff: projectStaff.length,
        activeStaff: projectStaff.filter(s => s.currentlyWorking === true).length,
        inactiveStaff: projectStaff.filter(s => s.currentlyWorking === false).length,
        staffList: projectStaff
      };
    }) || [];
    
    return {
      totalScientists,
      totalProjects,
      totalStaff,
      activeStaff,
      inactiveStaff,
      filteredStaffCount,
      projectsByStatus,
      staffByProject,
      staffByScientist,
      staffByDesignation: staffByDesignationData,
      projectDetails,
      filteredStaff,
    };
  }, [scientists, projects, allStaffData, selectedScientist, selectedProject, scientistMap]);

  // Colors for charts
  const COLORS = ['#52c41a', '#1890ff', '#faad14'];

  // Loading state
  if (scientistsLoading || projectsLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" tip="Loading dashboard data..." />
      </div>
    );
  }

  // Staff columns for tables
  const staffColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name', width: 150 },
    { title: 'Designation', dataIndex: 'designation', key: 'designation', width: 150 },
    { 
      title: 'Project', 
      dataIndex: 'projectName', 
      key: 'projectName', 
      width: 200,
      render: (text: string) => <Tag color="blue">{text || 'N/A'}</Tag>
    },
    { 
      title: 'Scientist', 
      dataIndex: 'scientistName', 
      key: 'scientistName', 
      width: 150,
      render: (text: string, record: any) => (
        <AntTooltip title={record.scientistDesignation}>
          <Space>
            <Avatar size="small" icon={<UserOutlined />} />
            <span>{text}</span>
          </Space>
        </AntTooltip>
      )
    },
    { 
      title: 'DOJ', 
      dataIndex: 'doj', 
      key: 'doj', 
      width: 110, 
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : 'N/A' 
    },
    {
      title: 'Status',
      dataIndex: 'currentlyWorking',
      key: 'status',
      width: 100,
      render: (working: boolean) => (
        <Tag color={working ? 'green' : 'red'}>
          {working ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    { title: 'Mobile', dataIndex: 'mobile', key: 'mobile', width: 120 },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 180 },
    { title: 'Remark', dataIndex: 'remark', key: 'remark', width: 150, ellipsis: true }
  ];

  // Project status data for charts
  const projectStatusChartData = [
    { name: 'Completed', value: statistics.projectsByStatus.completed },
    { name: 'Ongoing', value: statistics.projectsByStatus.ongoing },
    { name: 'Yet to Start', value: statistics.projectsByStatus.yetToStart }
  ].filter(item => item.value > 0);

  // Staff by scientist data
  const staffByScientistChartData = statistics.staffByScientist.map(s => ({
    name: s.scientistName,
    totalStaff: s.totalStaff,
    activeStaff: s.activeStaff
  }));

  // Staff by project data for chart
  const staffByProjectChartData = statistics.staffByProject
    .filter(p => p.totalStaff > 0)
    .map(p => ({
      name: p.projectName,
      totalStaff: p.totalStaff,
      activeStaff: p.activeStaff
    }));

  return (
    <div>
      <h1>Dashboard Overview</h1>
      
      {/* Error Alert */}
      {error && (
        <Alert
          message="Information"
          description={error}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          closable
          action={
            <Button size="small" type="primary" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          }
        />
      )}
      
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Total Scientists"
              value={statistics.totalScientists}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Total Projects"
              value={statistics.totalProjects}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8 }}>
              <Space split={<span>|</span>} size={4}>
                <span><CheckCircleOutlined style={{ color: '#52c41a' }} /> {statistics.projectsByStatus.completed}</span>
                <span><ClockCircleOutlined style={{ color: '#1890ff' }} /> {statistics.projectsByStatus.ongoing}</span>
                <span><WarningOutlined style={{ color: '#faad14' }} /> {statistics.projectsByStatus.yetToStart}</span>
              </Space>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Total Staff"
              value={statistics.totalStaff}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
            {statistics.totalStaff > 0 && (
              <div style={{ marginTop: 8 }}>
                <Progress 
                  percent={Math.round((statistics.activeStaff / statistics.totalStaff) * 100) || 0} 
                  size="small"
                  strokeColor="#52c41a"
                  format={() => `${statistics.activeStaff} Active`}
                />
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Active Staff"
              value={statistics.activeStaff}
              prefix={<UserSwitchOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix={`/ ${statistics.totalStaff}`}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
              Inactive: {statistics.inactiveStaff}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <label>Filter by Scientist:</label>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={selectedScientist}
              onChange={setSelectedScientist}
              placeholder="Select scientist"
              allowClear
              showSearch
            >
              <Option value="all">All Scientists</Option>
              {scientists?.map(s => (
                <Option key={s._id} value={s.name}>{s.name} ({s.designation})</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12}>
            <label>Filter by Project:</label>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={selectedProject}
              onChange={setSelectedProject}
              placeholder="Select project"
              allowClear
              showSearch
            >
              <Option value="all">All Projects</Option>
              {projects?.map(p => (
                <Option key={p._id} value={p.name}>{p.name}</Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Divider />
        <Row>
          <Col span={24}>
            <div style={{ fontSize: '14px', color: '#666' }}>
              <Space split={<span>|</span>} wrap>
                <span>📊 Total Staff: <strong>{statistics.totalStaff}</strong></span>
                <span>📋 Filtered Staff: <strong>{statistics.filteredStaffCount}</strong></span>
                {selectedScientist !== 'all' && <span>👨‍🔬 Scientist: <strong>{selectedScientist}</strong></span>}
                {selectedProject !== 'all' && <span>📁 Project: <strong>{selectedProject}</strong></span>}
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Charts Row - Project Status, Staff by Scientist, Staff by Project */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <Card title="Project Status Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectStatusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {projectStatusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Staff by Scientist">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={staffByScientistChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalStaff" fill="#1890ff" name="Total Staff" />
                <Bar dataKey="activeStaff" fill="#52c41a" name="Active Staff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Staff by Project">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={staffByProjectChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalStaff" fill="#1890ff" name="Total Staff" />
                <Bar dataKey="activeStaff" fill="#52c41a" name="Active Staff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Staff by Designation Chart */}
      {statistics.staffByDesignation.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <Card title="Staff by Designation">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statistics.staffByDesignation}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="designation" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#1890ff" name="Total Staff" />
                  <Bar dataKey="activeCount" fill="#52c41a" name="Active Staff" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      )}

      {/* Complete Staff Table */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card 
            title={`Complete Staff Details (${statistics.filteredStaffCount} Records)`}
            extra={
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => window.location.reload()}
                loading={staffLoading}
              >
                Refresh
              </Button>
            }
          >
            {statistics.filteredStaff.length === 0 ? (
              <Empty description="No staff data available. Please add staff to projects first." />
            ) : (
              <Table
                dataSource={statistics.filteredStaff}
                columns={staffColumns}
                pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} staff members` }}
                size="middle"
                scroll={{ x: 1200 }}
                rowKey="_id"
                loading={staffLoading}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Scientists Summary Table */}
      {statistics.staffByScientist.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <Card title="Scientists Performance Summary">
              <Table
                dataSource={statistics.staffByScientist}
                columns={[
                  { title: 'Scientist', dataIndex: 'scientistName', key: 'scientistName', width: 200 },
                  { title: 'Designation', dataIndex: 'scientistDesignation', key: 'scientistDesignation', width: 150 },
                  { title: 'Email', dataIndex: 'scientistEmail', key: 'scientistEmail', width: 200 },
                  { title: 'Mobile', dataIndex: 'scientistMobile', key: 'scientistMobile', width: 120 },
                  { title: 'Projects', dataIndex: 'totalProjects', key: 'totalProjects', width: 100, align: 'center' as const },
                  { 
                    title: 'Staff Count', 
                    key: 'staffCount', 
                    width: 150,
                    render: (_: any, record: any) => (
                      <Space>
                        <Badge count={record.totalStaff} showZero color="#1890ff" />
                        <Badge count={record.activeStaff} showZero color="#52c41a" />
                      </Space>
                    )
                  },
                  {
                    title: 'Active Rate',
                    key: 'activeRate',
                    width: 120,
                    render: (_: any, record: any) => {
                      const rate = record.totalStaff > 0 ? Math.round((record.activeStaff / record.totalStaff) * 100) : 0;
                      return <Progress percent={rate} size="small" strokeColor="#52c41a" />
                    }
                  }
                ]}
                expandable={{
                  expandedRowRender: (record) => (
                    <div style={{ padding: '16px', background: '#fafafa' }}>
                      <h4>Projects by {record.scientistName}</h4>
                      <Space wrap>
                        {record.projectNames.map((name: string, idx: number) => (
                          <Tag key={idx} color="blue">{name}</Tag>
                        ))}
                      </Space>
                      <Divider />
                      <h4>Staff Members under {record.scientistName}</h4>
                      <Table
                        dataSource={record.staffList}
                        columns={staffColumns}
                        pagination={false}
                        size="small"
                        scroll={{ x: 1000 }}
                      />
                    </div>
                  ),
                  rowExpandable: (record) => record.staffList.length > 0
                }}
                pagination={{ pageSize: 5 }}
                size="middle"
                scroll={{ x: true }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Projects Table */}
      {statistics.projectDetails.length > 0 && (
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card title="Projects with Staff Details">
              <Table
                dataSource={statistics.projectDetails}
                columns={[
                  { title: 'Project', dataIndex: 'projectName', key: 'projectName', width: 200 },
                  { title: 'Type', dataIndex: 'projectType', key: 'projectType', width: 120 },
                  { title: 'Scientist', dataIndex: 'scientistName', key: 'scientistName', width: 150 },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    width: 120,
                    render: (status: string) => (
                      <Tag color={status === 'completed' ? 'green' : status === 'ongoing' ? 'blue' : 'orange'}>
                        {status === 'completed' ? 'Completed' : status === 'ongoing' ? 'Ongoing' : 'Yet to Start'}
                      </Tag>
                    ),
                  },
                  { title: 'Start Date', dataIndex: 'startDate', key: 'startDate', width: 110 },
                  { title: 'End Date', dataIndex: 'endDate', key: 'endDate', width: 110 },
                  {
                    title: 'Staff',
                    key: 'staff',
                    width: 150,
                    render: (_: any, record: any) => (
                      <Space>
                        <Badge count={record.totalStaff} showZero color="#1890ff" />
                        <Badge count={record.activeStaff} showZero color="#52c41a" />
                      </Space>
                    )
                  }
                ]}
                expandable={{
                  expandedRowRender: (record) => (
                    <div style={{ padding: '16px', background: '#fafafa' }}>
                      <h4>Staff in {record.projectName}</h4>
                      <Table
                        dataSource={record.staffList}
                        columns={staffColumns}
                        pagination={false}
                        size="small"
                        scroll={{ x: 1000 }}
                      />
                    </div>
                  ),
                  rowExpandable: (record) => record.staffList.length > 0
                }}
                pagination={{ pageSize: 10 }}
                size="middle"
                scroll={{ x: 1200 }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Key Insights */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="Key Insights">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <div style={{ padding: '16px', background: '#f0f2f5', borderRadius: '8px', textAlign: 'center' }}>
                  <TrophyOutlined style={{ fontSize: '24px', color: '#faad14' }} />
                  <h3>Top Scientist</h3>
                  <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {statistics.staffByScientist.reduce((max, s) => s.totalStaff > max.totalStaff ? s : max, { scientistName: 'None', totalStaff: 0 }).scientistName}
                  </p>
                  <p>{statistics.staffByScientist.reduce((max, s) => s.totalStaff > max.totalStaff ? s : max, { totalStaff: 0 }).totalStaff} staff members</p>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ padding: '16px', background: '#f0f2f5', borderRadius: '8px', textAlign: 'center' }}>
                  <ProjectOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                  <h3>Largest Project</h3>
                  <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {statistics.staffByProject.reduce((max, p) => p.totalStaff > max.totalStaff ? p : max, { projectName: 'None', totalStaff: 0 }).projectName}
                  </p>
                  <p>{statistics.staffByProject.reduce((max, p) => p.totalStaff > max.totalStaff ? p : max, { totalStaff: 0 }).totalStaff} staff members</p>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ padding: '16px', background: '#f0f2f5', borderRadius: '8px', textAlign: 'center' }}>
                  <TeamOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                  <h3>Staff Distribution</h3>
                  <p>Avg Staff/Project: <strong>{(statistics.totalStaff / statistics.totalProjects || 0).toFixed(1)}</strong></p>
                  <p>Avg Staff/Scientist: <strong>{(statistics.totalStaff / statistics.totalScientists || 0).toFixed(1)}</strong></p>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;