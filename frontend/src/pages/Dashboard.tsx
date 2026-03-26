import { useState } from 'react';
import { Layout, Menu, Button, message, Modal } from 'antd';
import { LogoutOutlined, ProjectOutlined, TeamOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import ProjectList from '../components/ProjectList';
import StaffManagement from '../components/StaffManagement';
import ProjectForm from '../components/ProjectForm';

const { Header, Content, Sider } = Layout;

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');

  const handleLogout = () => {
    dispatch(logout());
    message.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#001529' }}>
        <h1 style={{ color: 'white', margin: 0 }}>Scientist Management System</h1>
        <Button icon={<LogoutOutlined />} onClick={handleLogout} type="primary" danger>
          Logout
        </Button>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[activeTab]}
            style={{ height: '100%', borderRight: 0 }}
            onClick={({ key }) => setActiveTab(key)}
          >
            <Menu.Item key="projects" icon={<ProjectOutlined />}>
              My Projects
            </Menu.Item>
            <Menu.Item key="staff" icon={<TeamOutlined />} disabled={!selectedProject}>
              Staff Management
            </Menu.Item>
          </Menu>
        </Sider>
        <Content style={{ padding: 24, background: '#fff' }}>
          {activeTab === 'projects' && (
            <div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowProjectForm(true)}
                style={{ marginBottom: 16 }}
              >
                Add New Project
              </Button>
              <ProjectList onSelectProject={setSelectedProject} />
            </div>
          )}
          {activeTab === 'staff' && selectedProject && (
            <StaffManagement projectId={selectedProject} />
          )}
        </Content>
      </Layout>
      <Modal
        title="Add New Project"
        open={showProjectForm}
        onCancel={() => setShowProjectForm(false)}
        footer={null}
        width={800}
      >
        <ProjectForm onSuccess={() => setShowProjectForm(false)} />
      </Modal>
    </Layout>
  );
};

export default Dashboard;