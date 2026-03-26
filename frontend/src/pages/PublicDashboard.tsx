import { useState, useMemo } from 'react';
import { 
  Card, Table, Tag, Space, Spin, Statistic, Row, Col, 
  Select, Input, Button, Badge, Avatar, Tooltip, Progress, 
  Alert, Typography, Grid, Tabs, Divider, Modal, Descriptions,
  List, Empty
} from 'antd';
import { 
  UserOutlined, ProjectOutlined, TeamOutlined, 
  DollarOutlined, CheckCircleOutlined, CloseCircleOutlined, 
  ClockCircleOutlined, SearchOutlined, EyeOutlined, 
  EyeInvisibleOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { useGetPublicDashboardQuery } from '../services/publicApi';
import { DashboardData } from '../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

const PublicDashboard = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [selectedScientist, setSelectedScientist] = useState<string>('all');
  const [showStats, setShowStats] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [expandedScientistKeys, setExpandedScientistKeys] = useState<string[]>([]);
  const [expandedProjectKeys, setExpandedProjectKeys] = useState<string[]>([]);
  const screens = useBreakpoint();

  const { data: dashboardData, isLoading } = useGetPublicDashboardQuery();

  // Calculate comprehensive statistics
  const statistics = useMemo(() => {
    if (!dashboardData) return null;

    let totalProjects = 0;
    let totalStaff = 0;
    let totalBudget = 0;
    let ongoingProjects = 0;
    let completedProjects = 0;
    let yetToStart = 0;
    let cancelled = 0;
    let archived = 0;
    let activeStaff = 0;
    let leftStaff = 0;
    let totalDuration = 0;
    let totalPendingDuration = 0;
    let totalScientists = dashboardData.length;

    // Project type counts
    const projectTypes = {
      Intramural: 0,
      Extramural: 0,
      ICMR: 0,
      NHRP: 0
    };

    // Funding agency distribution
    const fundingAgencies = {
      ICMR: 0,
      NHRP: 0,
      'PM-ABHIM': 0,
      OTHER: 0
    };

    // Scientist-wise data with full details
    const scientistStats = dashboardData.map(scientist => {
      let scientistProjects = 0;
      let scientistStaff = 0;
      let scientistBudget = 0;
      let scientistOngoing = 0;
      let scientistCompleted = 0;

      scientist.projects.forEach(project => {
        scientistProjects++;
        scientistStaff += project.staff.length;
        scientistBudget += project.allocatedBudget;
        totalDuration += project.duration;
        totalPendingDuration += project.pendingDuration;

        switch(project.status) {
          case 'On Going':
            ongoingProjects++;
            scientistOngoing++;
            break;
          case 'Completed':
            completedProjects++;
            scientistCompleted++;
            break;
          case 'Yet to start':
            yetToStart++;
            break;
          case 'Cancelled':
            cancelled++;
            break;
          case 'Archive':
            archived++;
            break;
        }

        if (project.type in projectTypes) {
          projectTypes[project.type as keyof typeof projectTypes]++;
        }

        if (project.fundingAgency in fundingAgencies) {
          fundingAgencies[project.fundingAgency as keyof typeof fundingAgencies]++;
        }
      });

      totalProjects += scientistProjects;
      totalBudget += scientistBudget;
      totalStaff += scientistStaff;
      activeStaff += scientistStaff;
      
      return {
        scientistId: scientist.scientist.id,
        scientistName: scientist.scientist.name,
        scientistDesignation: scientist.scientist.designation,
        scientistEmail: scientist.scientist.email,
        scientistMobile: scientist.scientist.mobile,
        projects: scientist.projects.map(project => ({
          ...project,
          staffList: project.staff || [] // Ensure staff is always an array
        })),
        projectCount: scientistProjects,
        staffCount: scientistStaff,
        budget: scientistBudget,
        ongoing: scientistOngoing,
        completed: scientistCompleted,
        completionRate: scientistProjects ? ((scientistCompleted / scientistProjects) * 100).toFixed(1) : 0
      };
    });

    leftStaff = totalStaff - activeStaff;

    return {
      totalScientists,
      totalProjects,
      totalStaff,
      totalBudget,
      ongoingProjects,
      completedProjects,
      yetToStart,
      cancelled,
      archived,
      activeStaff,
      leftStaff,
      totalDuration,
      totalPendingDuration,
      averageProjectDuration: totalProjects ? Math.round(totalDuration / totalProjects) : 0,
      averageBudget: totalProjects ? Math.round(totalBudget / totalProjects) : 0,
      completionRate: totalProjects ? ((completedProjects / totalProjects) * 100).toFixed(1) : 0,
      projectTypes,
      fundingAgencies,
      scientistStats
    };
  }, [dashboardData]);

  // Filter scientists data
  const filteredScientists = useMemo(() => {
    if (!statistics?.scientistStats) return [];

    let filtered = [...statistics.scientistStats];

    if (selectedScientist !== 'all') {
      filtered = filtered.filter(s => s.scientistId === selectedScientist);
    }

    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(scientist => {
        const scientistMatch = scientist.scientistName.toLowerCase().includes(searchLower) ||
                              scientist.scientistDesignation.toLowerCase().includes(searchLower);
        
        const projectMatch = scientist.projects.some(project =>
          project.projectName.toLowerCase().includes(searchLower) ||
          project.projectShortName.toLowerCase().includes(searchLower)
        );
        
        const staffMatch = scientist.projects.some(project =>
          project.staffList.some(staff =>
            staff.name.toLowerCase().includes(searchLower) ||
            staff.designation.toLowerCase().includes(searchLower)
          )
        );
        
        return scientistMatch || projectMatch || staffMatch;
      });
    }

    // Filter projects by status
    if (filterStatus !== 'all') {
      filtered = filtered.map(scientist => ({
        ...scientist,
        projects: scientist.projects.filter(project => project.status === filterStatus),
        projectCount: scientist.projects.filter(project => project.status === filterStatus).length
      })).filter(scientist => scientist.projectCount > 0);
    }

    return filtered;
  }, [statistics, selectedScientist, searchText, filterStatus]);

  // Flatten all projects for all projects table
  const allProjects = useMemo(() => {
    if (!dashboardData) return [];
    
    let projects: any[] = [];
    dashboardData.forEach(scientist => {
      scientist.projects.forEach(project => {
        projects.push({
          ...project,
          scientistName: scientist.scientist.name,
          scientistDesignation: scientist.scientist.designation
        });
      });
    });
    
    let filtered = projects;
    if (selectedScientist !== 'all') {
      filtered = filtered.filter(p => p.scientistId === selectedScientist);
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(p => 
        p.projectName.toLowerCase().includes(searchLower) ||
        p.projectShortName.toLowerCase().includes(searchLower) ||
        p.scientistName.toLowerCase().includes(searchLower) ||
        p.type.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [dashboardData, selectedScientist, filterStatus, searchText]);

  // Flatten all staff for all staff table
  const allStaff = useMemo(() => {
    if (!dashboardData) return [];
    
    let staff: any[] = [];
    dashboardData.forEach(scientist => {
      scientist.projects.forEach(project => {
        project.staff.forEach(staffMember => {
          staff.push({
            ...staffMember,
            scientistName: scientist.scientist.name,
            scientistId: scientist.scientist.id,
            projectName: project.projectName,
            projectShortName: project.projectShortName
          });
        });
      });
    });
    
    let filtered = staff;
    if (selectedScientist !== 'all') {
      filtered = filtered.filter(s => s.scientistId === selectedScientist);
    }
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchLower) ||
        s.designation.toLowerCase().includes(searchLower) ||
        s.email.toLowerCase().includes(searchLower) ||
        s.scientistName.toLowerCase().includes(searchLower) ||
        s.projectName.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [dashboardData, selectedScientist, searchText]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'On Going': 'processing',
      'Completed': 'success',
      'Yet to start': 'warning',
      'Cancelled': 'error',
      'Archive': 'default',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      'On Going': <ClockCircleOutlined />,
      'Completed': <CheckCircleOutlined />,
      'Yet to start': <ClockCircleOutlined />,
      'Cancelled': <CloseCircleOutlined />,
      'Archive': <EyeInvisibleOutlined />,
    };
    return icons[status] || <EyeOutlined />;
  };

  const scientistOptions = dashboardData?.map(s => ({
    label: s.scientist.name,
    value: s.scientist.id,
  })) || [];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" tip="Loading dashboard data..." />
      </div>
    );
  }

  // Staff Columns for Project Level Expansion
  const staffColumnsForProject = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <strong>{text}</strong>
        </Space>
      ),
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
      width: 120,
      render: (date: string) => dayjs(date).format('DD-MM-YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'currentlyWorking',
      key: 'currentlyWorking',
      width: 100,
      render: (working: boolean, record: any) => (
        <Space direction="vertical" size={0}>
          <Tag color={working ? 'success' : 'error'} icon={working ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
            {working ? 'Active' : 'Left'}
          </Tag>
          {!working && record.lastWorkingDay && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              Left: {dayjs(record.lastWorkingDay).format('DD-MM-YYYY')}
            </Text>
          )}
        </Space>
      ),
    },
    {
  title: 'Leaving Reason',
  dataIndex: 'leavingReason',
  key: 'leavingReason',
  ellipsis: true,
  render: (reason: string, record: any) =>
    record.currentlyWorking ? null : (reason || '-'),
}
  ];

  // Project Columns for Scientist Level Expansion
  const projectColumnsForScientist = [
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      key: 'projectName',
      render: (text: string, record: any) => (
        <Space direction="vertical" size={0}>
          <strong>{text}</strong>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.projectShortName}</Text>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Timeline',
      key: 'timeline',
      width: 200,
      render: (_: any, record: any) => (
        <Tooltip title={`Start: ${dayjs(record.startDate).format('DD-MM-YYYY')} | End: ${dayjs(record.endDate).format('DD-MM-YYYY')}`}>
          <div>
            <Progress 
              percent={Math.round((record.duration - record.pendingDuration) / record.duration * 100)} 
              size="small"
              status={record.status === 'Completed' ? 'success' : 'active'}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.pendingDuration} days left
            </Text>
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Current Active Staff',
      dataIndex: 'staffCount',
      key: 'staffCount',
      width: 80,
      align: 'center' as const,
      render: (count: number) => <Badge count={count} showZero />,
    },
    {
      title: 'Budget (₹)',
      dataIndex: 'allocatedBudget',
      key: 'allocatedBudget',
      width: 150,
      align: 'right' as const,
      render: (budget: number) => `₹${budget.toLocaleString()}`,
    },
    {
      title: 'Funding',
      dataIndex: 'fundingAgency',
      key: 'fundingAgency',
      width: 100,
      render: (agency: string) => <Tag>{agency}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_: any, record: any) => (
        <Button 
          type="link" 
          size="small"
          icon={<InfoCircleOutlined />}
          onClick={() => {
            setSelectedProject(record);
            setModalVisible(true);
          }}
        >
          Details
        </Button>
      ),
    },
  ];

  // Expanded row renderer for scientists (shows projects)
  const expandedScientistRender = (record: any) => {
    if (!record.projects || record.projects.length === 0) {
      return (
        <div style={{ padding: 24, textAlign: 'center', background: '#fafafa' }}>
          <Empty description="No projects found for this scientist" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      );
    }

    return (
      <Table
        columns={projectColumnsForScientist}
        dataSource={record.projects}
        rowKey="_id"
        pagination={false}
        size="small"
        expandable={{
          expandedRowRender: (projectRecord) => {
            // Check if project has staff
            if (!projectRecord.staffList || projectRecord.staffList.length === 0) {
              return (
                <div style={{ padding: 16, textAlign: 'center', background: '#fafafa' }}>
                  <Empty description="No staff members assigned to this project" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
              );
            }
            // Return staff table for expanded project
            return (
              <div style={{ padding: '8px 16px', background: '#f5f5f5' }}>
                <div style={{ marginBottom: 12 }}>
                  <TeamOutlined /> Staff Members ({projectRecord.staffList.length})
                </div>
                <Table
                  columns={staffColumnsForProject}
                  dataSource={projectRecord.staffList}
                  rowKey="_id"
                  pagination={false}
                  size="small"
                  bordered
                />
              </div>
            );
          },
          rowExpandable: (projectRecord) => projectRecord.staffList && projectRecord.staffList.length > 0,
          expandIconColumnIndex: 0,
        }}
      />
    );
  };

  // Scientist Table Columns
  const scientistColumns = [
    {
      title: 'Scientist',
      dataIndex: 'scientistName',
      key: 'scientistName',
      width: 280,
      render: (text: string, record: any) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Space direction="vertical" size={0}>
            <strong>{text}</strong>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.scientistDesignation}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {record.scientistEmail} | {record.scientistMobile}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Projects',
      dataIndex: 'projectCount',
      key: 'projectCount',
      align: 'center' as const,
      width: 100,
      render: (count: number) => (
        <Tooltip title={`${count} total projects`}>
          <Badge count={count} showZero color="#1890ff" />
        </Tooltip>
      ),
    },
    {
      title: 'Total Staff (Active + Left)',
      dataIndex: 'staffCount',
      key: 'staffCount',
      align: 'center' as const,
      width: 100,
      render: (count: number) => (
        <Tooltip title={`${count} total staff members`}>
          <Badge count={count} showZero color="#52c41a" />
        </Tooltip>
      ),
    },
    {
      title: 'Budget (₹)',
      dataIndex: 'budget',
      key: 'budget',
      align: 'right' as const,
      width: 150,
      render: (budget: number) => (
        <Tooltip title={`Total allocated budget`}>
          <Text strong>₹{budget.toLocaleString()}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Ongoing',
      dataIndex: 'ongoing',
      key: 'ongoing',
      align: 'center' as const,
      width: 100,
      render: (count: number) => (
        <Tooltip title={`${count} ongoing projects`}>
          <Tag color="processing" icon={<ClockCircleOutlined />}>{count}</Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Completed',
      dataIndex: 'completed',
      key: 'completed',
      align: 'center' as const,
      width: 100,
      render: (count: number) => (
        <Tooltip title={`${count} completed projects`}>
          <Tag color="success" icon={<CheckCircleOutlined />}>{count}</Tag>
        </Tooltip>
      ),
    },
  ];

  // All Projects Table Columns
  const projectColumns = [
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200,
      render: (text: string, record: any) => (
        <Space direction="vertical" size={0}>
          <strong>{text}</strong>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.projectShortName}</Text>
        </Space>
      ),
    },
    {
      title: 'Scientist',
      dataIndex: 'scientistName',
      key: 'scientistName',
      width: 150,
      render: (text: string) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Timeline',
      key: 'timeline',
      width: 180,
      render: (_: any, record: any) => (
        <Tooltip title={`Start: ${dayjs(record.startDate).format('DD-MM-YYYY')} | End: ${dayjs(record.endDate).format('DD-MM-YYYY')}`}>
          <div>
            <Progress 
              percent={Math.round((record.duration - record.pendingDuration) / record.duration * 100)} 
              size="small"
              status={record.status === 'Completed' ? 'success' : 'active'}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.pendingDuration} days left
            </Text>
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Current Active Staff',
      dataIndex: 'staffCount',
      key: 'staffCount',
      width: 80,
      align: 'center' as const,
      render: (count: number) => <Badge count={count} showZero />,
    },
    {
      title: 'Budget (₹)',
      dataIndex: 'allocatedBudget',
      key: 'allocatedBudget',
      width: 150,
      align: 'right' as const,
      render: (budget: number) => `₹${budget.toLocaleString()}`,
    },
    {
      title: 'Funding',
      dataIndex: 'fundingAgency',
      key: 'fundingAgency',
      width: 100,
      render: (agency: string) => <Tag>{agency}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_: any, record: any) => (
        <Button 
          type="link" 
          icon={<InfoCircleOutlined />}
          onClick={() => {
            setSelectedProject(record);
            setModalVisible(true);
          }}
        >
          Details
        </Button>
      ),
    },
  ];

  // All Staff Table Columns
  const staffColumns = [
    {
      title: 'Staff Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
    },
    {
      title: 'Scientist',
      dataIndex: 'scientistName',
      key: 'scientistName',
      render: (text: string) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Project',
      dataIndex: 'projectName',
      key: 'projectName',
      ellipsis: true,
      render: (text: string, record: any) => (
        <Tooltip title={text}>
          <Text>{record.projectShortName}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <Text>{record.mobile}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
        </Space>
      ),
    },
    {
      title: 'DOJ',
      dataIndex: 'doj',
      key: 'doj',
      width: 120,
      render: (date: string) => (
        <Tooltip title={dayjs(date).fromNow()}>
          {dayjs(date).format('DD-MM-YYYY')}
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'currentlyWorking',
      key: 'currentlyWorking',
      width: 100,
      render: (working: boolean, record: any) => (
        <Tag color={working ? 'success' : 'error'} icon={working ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
          {working ? 'Active' : 'Left'}
        </Tag>
      ),
    },
    {
      title: 'Last Working Day',
      dataIndex: 'lastWorkingDay',
      key: 'lastWorkingDay',
      width: 120,
      render: (date: string) => date ? dayjs(date).format('DD-MM-YYYY') : '-',
    },
  ];

  return (
    <div style={{ 
      padding: screens.xs ? 12 : 24, 
      background: '#f0f2f5', 
      minHeight: '100vh' 
    }}>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }} wrap>
            <Space>
              <ProjectOutlined style={{ fontSize: 32, color: '#1890ff' }} />
              <Title level={2} style={{ margin: 0 }}>
                Research Projects Dashboard
              </Title>
            </Space>
            <Button
              icon={showStats ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => setShowStats(!showStats)}
            >
              {showStats ? 'Hide' : 'Show'} Statistics
            </Button>
          </Space>
          
          <Paragraph type="secondary">
            Comprehensive overview of all scientists, research projects, and staff members.
            {statistics && ` Currently tracking ${statistics.totalScientists} scientists with ${statistics.totalProjects} projects and ${statistics.totalStaff} staff members.`}
          </Paragraph>
        </Space>
      </Card>

      {/* Statistics Section */}
      {showStats && statistics && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Card hoverable>
                <Statistic
                  title="Total Scientists"
                  value={statistics.totalScientists}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Card hoverable>
                <Statistic
                  title="Total Projects"
                  value={statistics.totalProjects}
                  prefix={<ProjectOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
                <Progress 
                  percent={parseFloat(statistics.completionRate)} 
                  size="small"
                  format={() => `${statistics.completionRate}% completed`}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Card hoverable>
                <Statistic
                  title="Total Staff"
                  value={statistics.totalStaff}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {statistics.activeStaff} active | {statistics.leftStaff} left
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Card hoverable>
                <Statistic
                  title="Total Budget"
                  value={statistics.totalBudget}
                  prefix={<DollarOutlined />}
                  precision={0}
                  valueStyle={{ color: '#fa8c16' }}
                  formatter={(value) => `₹${value?.toLocaleString()}`}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Avg: ₹{statistics.averageBudget.toLocaleString()}/project
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Card hoverable>
                <Statistic
                  title="Ongoing Projects"
                  value={statistics.ongoingProjects}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Card hoverable>
                <Statistic
                  title="Completed"
                  value={statistics.completedProjects}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {statistics.yetToStart} yet to start
                </Text>
              </Card>
            </Col>
          </Row>

          {/* Additional Statistics */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} md={12}>
              <Card title="Project Type Distribution" size="small">
                <Row gutter={[16, 16]}>
                  {Object.entries(statistics.projectTypes).map(([type, count]) => (
                    <Col span={12} key={type}>
                      <Space>
                        <Tag color="blue">{type}</Tag>
                        <strong>{count}</strong>
                        <Text type="secondary">({((count / statistics.totalProjects) * 100).toFixed(1)}%)</Text>
                      </Space>
                      <Progress 
                        percent={(count / statistics.totalProjects) * 100} 
                        size="small" 
                        showInfo={false}
                      />
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Funding Agency Distribution" size="small">
                <Row gutter={[16, 16]}>
                  {Object.entries(statistics.fundingAgencies).map(([agency, count]) => (
                    <Col span={12} key={agency}>
                      <Space>
                        <Tag>{agency}</Tag>
                        <strong>{count}</strong>
                        <Text type="secondary">({((count / statistics.totalProjects) * 100).toFixed(1)}%)</Text>
                      </Space>
                      <Progress 
                        percent={(count / statistics.totalProjects) * 100} 
                        size="small" 
                        showInfo={false}
                      />
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Input
                placeholder="Search scientist, project or staff..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                placeholder="Filter by status"
                style={{ width: '100%' }}
                value={filterStatus}
                onChange={setFilterStatus}
              >
                <Option value="all">All Projects</Option>
                <Option value="On Going">On Going</Option>
                <Option value="Completed">Completed</Option>
                <Option value="Yet to start">Yet to start</Option>
                <Option value="Cancelled">Cancelled</Option>
                <Option value="Archive">Archive</Option>
              </Select>
            </Col>
            <Col xs={24} md={8}>
              <Select
                placeholder="Select scientist"
                style={{ width: '100%' }}
                value={selectedScientist}
                onChange={setSelectedScientist}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.label?.toString() || '').toLowerCase().includes(input.toLowerCase())
                }
                options={scientistOptions}
              />
            </Col>
          </Row>
          
          {searchText && (
            <Alert
              message={`Showing results for "${searchText}"`}
              type="info"
              showIcon
              closable
              onClose={() => setSearchText('')}
            />
          )}
        </Space>
      </Card>

      {/* Tabular Views */}
      <Card>
        <Tabs
          defaultActiveKey="scientists"
          items={[
            {
              key: 'scientists',
              label: (
                <Space>
                  <UserOutlined />
                  Scientists Overview
                  <Badge count={filteredScientists.length} showZero />
                </Space>
              ),
              children: (
                <Table
                  columns={scientistColumns}
                  dataSource={filteredScientists}
                  rowKey="scientistId"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1200 }}
                  expandable={{
                    expandedRowRender: expandedScientistRender,
                    rowExpandable: (record) => record.projects && record.projects.length > 0,
                    expandedRowKeys: expandedScientistKeys,
                    onExpand: (expanded, record) => {
                      if (expanded) {
                        setExpandedScientistKeys([...expandedScientistKeys, record.scientistId]);
                      } else {
                        setExpandedScientistKeys(expandedScientistKeys.filter(key => key !== record.scientistId));
                      }
                    },
                  }}
                />
              ),
            },
            {
              key: 'projects',
              label: (
                <Space>
                  <ProjectOutlined />
                  All Projects
                  <Badge count={allProjects.length} showZero />
                </Space>
              ),
              children: (
                <Table
                  columns={projectColumns}
                  dataSource={allProjects}
                  rowKey="_id"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1200 }}
                />
              ),
            },
            {
              key: 'staff',
              label: (
                <Space>
                  <TeamOutlined />
                  All Staff
                  <Badge count={allStaff.length} showZero />
                </Space>
              ),
              children: (
                <Table
                  columns={staffColumns}
                  dataSource={allStaff}
                  rowKey="_id"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1200 }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Project Details Modal */}
      <Modal
        title="Project Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedProject && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Project Name" span={2}>
                <strong>{selectedProject.projectName}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Short Name">
                {selectedProject.projectShortName}
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                <Tag color="blue">{selectedProject.type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag icon={getStatusIcon(selectedProject.status)} color={getStatusColor(selectedProject.status)}>
                  {selectedProject.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Scientist">
                {selectedProject.scientistName}
              </Descriptions.Item>
              <Descriptions.Item label="Timeline">
                {dayjs(selectedProject.startDate).format('DD-MM-YYYY')} - {dayjs(selectedProject.endDate).format('DD-MM-YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Duration">
                {selectedProject.duration} days
              </Descriptions.Item>
              <Descriptions.Item label="Pending">
                {selectedProject.pendingDuration} days
              </Descriptions.Item>
              <Descriptions.Item label="Budget">
                <strong>₹{selectedProject.allocatedBudget.toLocaleString()}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Funding Agency">
                {selectedProject.fundingAgency}
              </Descriptions.Item>
              <Descriptions.Item label="Staff Count" span={2}>
                <Badge count={selectedProject.staffCount} showZero />
              </Descriptions.Item>
            </Descriptions>
            
            {selectedProject.staffCount > 0 && (
              <>
                <Divider orientation="left">Staff Members</Divider>
                <List
                  dataSource={selectedProject.staff}
                  renderItem={(staff: any) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={staff.name}
                        description={
                          <Space direction="vertical" size={0}>
                            <Text>{staff.designation}</Text>
                            <Text type="secondary">{staff.email} | {staff.mobile}</Text>
                            <Text type="secondary">Joined: {dayjs(staff.doj).format('DD-MM-YYYY')}</Text>
                          </Space>
                        }
                      />
                      <Tag color={staff.currentlyWorking ? 'success' : 'error'}>
                        {staff.currentlyWorking ? 'Active' : 'Left'}
                      </Tag>
                    </List.Item>
                  )}
                />
              </>
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default PublicDashboard;