import { Formik, Form } from 'formik';
import { Input, Select, DatePicker, Button, InputNumber, message } from 'antd';
import { useUpdateProjectMutation } from '../services/projectApi';
import { projectSchema } from '../utils/validation';
import { Project } from '../types';
import dayjs from 'dayjs';

const { Option } = Select;

interface ProjectEditFormProps {
  project: Project;
  onSuccess: () => void;
  onCancel: () => void;
}

const ProjectEditForm = ({ project, onSuccess, onCancel }: ProjectEditFormProps) => {
  const [updateProject, { isLoading }] = useUpdateProjectMutation();

  const handleSubmit = async (values: any) => {
    try {
      await updateProject({
        id: project._id,
        data: {
          ...values,
          startDate: values.startDate.toISOString(),
          endDate: values.endDate.toISOString(),
        },
      }).unwrap();
      onSuccess();
    } catch (error: any) {
      message.error(error.data?.message || 'Failed to update project');
    }
  };

  return (
    <Formik
      initialValues={{
        projectName: project.projectName,
        projectShortName: project.projectShortName,
        type: project.type,
        status: project.status,
        startDate: dayjs(project.startDate),
        endDate: dayjs(project.endDate),
        allocatedBudget: project.allocatedBudget,
        fundingAgency: project.fundingAgency,
      }}
      validationSchema={projectSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, handleChange, setFieldValue, handleBlur }) => (
        <Form>
          <Input
            placeholder="Project Name"
            name="projectName"
            value={values.projectName}
            onChange={handleChange}
            onBlur={handleBlur}
            style={{ marginBottom: 16 }}
            status={errors.projectName && touched.projectName ? 'error' : ''}
          />
          {errors.projectName && touched.projectName && (
            <div style={{ color: 'red', marginBottom: 8 }}>{errors.projectName}</div>
          )}
          
          <Input
            placeholder="Project Short Name"
            name="projectShortName"
            value={values.projectShortName}
            onChange={handleChange}
            onBlur={handleBlur}
            style={{ marginBottom: 16 }}
            status={errors.projectShortName && touched.projectShortName ? 'error' : ''}
          />
          {errors.projectShortName && touched.projectShortName && (
            <div style={{ color: 'red', marginBottom: 8 }}>{errors.projectShortName}</div>
          )}
          
          <Select
            placeholder="Project Type"
            name="type"
            value={values.type}
            onChange={(value) => setFieldValue('type', value)}
            onBlur={handleBlur}
            style={{ width: '100%', marginBottom: 16 }}
          >
            <Option value="Intramural">Intramural</Option>
            <Option value="Extramural">Extramural</Option>
            <Option value="ICMR">ICMR</Option>
            <Option value="NHRP">NHRP</Option>
          </Select>
          {errors.type && touched.type && (
            <div style={{ color: 'red', marginBottom: 8 }}>{errors.type}</div>
          )}
          
          <Select
            placeholder="Status"
            name="status"
            value={values.status}
            onChange={(value) => setFieldValue('status', value)}
            onBlur={handleBlur}
            style={{ width: '100%', marginBottom: 16 }}
          >
            <Option value="On Going">On Going</Option>
            <Option value="Completed">Completed</Option>
            <Option value="Yet to start">Yet to start</Option>
            <Option value="Cancelled">Cancelled</Option>
            <Option value="Archive">Archive</Option>
          </Select>
          {errors.status && touched.status && (
            <div style={{ color: 'red', marginBottom: 8 }}>{errors.status}</div>
          )}
          
          <DatePicker
            placeholder="Start Date"
            style={{ width: '100%', marginBottom: 16 }}
            onChange={(date) => setFieldValue('startDate', date)}
            value={values.startDate}
          />
          
          <DatePicker
            placeholder="End Date"
            style={{ width: '100%', marginBottom: 16 }}
            onChange={(date) => setFieldValue('endDate', date)}
            value={values.endDate}
          />
          <InputNumber
            placeholder="Allocated Budget"
            style={{ width: '100%', marginBottom: 16 }}
            name="allocatedBudget"
            value={values.allocatedBudget}
            onChange={(value) => setFieldValue('allocatedBudget', value)}
            formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value!.replace(/₹\s?|(,*)/g, '')}
            min={0}
          />
          {errors.allocatedBudget && touched.allocatedBudget && (
            <div style={{ color: 'red', marginBottom: 8 }}>{errors.allocatedBudget}</div>
          )}
          
          <Select
            placeholder="Funding Agency"
            name="fundingAgency"
            value={values.fundingAgency}
            onChange={(value) => setFieldValue('fundingAgency', value)}
            onBlur={handleBlur}
            style={{ width: '100%', marginBottom: 16 }}
          >
            <Option value="ICMR">ICMR</Option>
            <Option value="NHRP">NHRP</Option>
            <Option value="PM-ABHIM">PM-ABHIM</Option>
            <Option value="OTHER">OTHER</Option>
          </Select>
          {errors.fundingAgency && touched.fundingAgency && (
            <div style={{ color: 'red', marginBottom: 8 }}>{errors.fundingAgency}</div>
          )}
          
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={onCancel}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Update Project
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ProjectEditForm;