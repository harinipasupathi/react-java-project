import React, { useState, useEffect } from 'react';
import { Layout, Form, Input, Button, Table, Space, Modal, Typography, notification } from 'antd';
import { DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Content } = Layout;
const { Paragraph, Title } = Typography;

interface TaskExecution {
  startTime: string;
  endTime: string;
  output: string;
}

interface Task {
  id: string;
  name: string;
  owner: string;
  command: string;
  taskExecutions: TaskExecution[];
}

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [execModalVisible, setExecModalVisible] = useState(false);
  const [selectedExecs, setSelectedExecs] = useState<TaskExecution[]>([]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:4000/tasks');
      // 🧠 Fix: Map MongoDB _id to id
      const mappedTasks = res.data.map((task: any) => ({
        ...task,
        id: task._id,
        key: task._id,
      }));
      setTasks(mappedTasks);
    } catch (err) {
      notification.error({ message: 'Error fetching tasks' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const onCreate = async (values: Partial<Task>) => {
    try {
      await axios.post('http://localhost:4000/tasks', values);
      notification.success({ message: 'Task created' });
      form.resetFields();
      fetchTasks();
    } catch {
      notification.error({ message: 'Failed to create task' });
    }
  };

  const onDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:4000/tasks/${id}`);
      notification.success({ message: 'Task deleted' });
      fetchTasks();
    } catch {
      notification.error({ message: 'Failed to delete task' });
    }
  };

  const onRun = async (task: Task) => {
    try {
      await axios.post(`http://localhost:4000/tasks/${task.id}/run`);
      notification.success({ message: 'Command executed' });
      fetchTasks();
    } catch {
      notification.error({ message: 'Execution failed' });
    }
  };

  const showExecutions = (executions: TaskExecution[]) => {
    setSelectedExecs(executions);
    setExecModalVisible(true);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      filterDropdown: ({
        setSelectedKeys,
        confirm,
      }: {
        setSelectedKeys: (selectedKeys: React.Key[]) => void;
        confirm: () => void;
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search Name"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Button onClick={() => confirm()} type="primary" size="small">
            Search
          </Button>
        </div>
      ),
      onFilter: (_: any, record: Task) =>
        record.name.toLowerCase().includes(searchText.toLowerCase()),
    },
    { title: 'Owner', dataIndex: 'owner', key: 'owner' },
    { title: 'Command', dataIndex: 'command', key: 'command', ellipsis: true },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Task) => (
        <Space>
          <Button
            icon={<PlayCircleOutlined />}
            onClick={() => onRun(record)}
            aria-label={`Run command for ${record.name}`}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => onDelete(record.id)}
            aria-label={`Delete ${record.name}`}
          />
          {record.taskExecutions.length > 0 && (
            <Button type="link" onClick={() => showExecutions(record.taskExecutions)}>
              View Logs
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <Content style={{ padding: '0 24px' }}>
        <Title level={2} style={{ marginTop: 24, marginBottom: 24 }}>
          Task Manager
        </Title>
        <SectionForm onCreate={onCreate} form={form} />
        <Table
          columns={columns}
          dataSource={tasks}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
        <Modal
          title="Execution Logs"
          open={execModalVisible}
          onCancel={() => setExecModalVisible(false)}
          footer={<Button onClick={() => setExecModalVisible(false)}>Close</Button>}
        >
          <ul>
            {selectedExecs.map((exec, idx) => (
              <li key={idx} style={{ marginBottom: 16 }}>
                <Title level={5}>
                  Run at {new Date(exec.startTime).toLocaleString()}
                </Title>
                <Paragraph>
                  <strong>Duration: </strong>
                  {new Date(exec.startTime).toLocaleString()} -{' '}
                  {new Date(exec.endTime).toLocaleString()}
                </Paragraph>
                <Paragraph code copyable>
                  {exec.output}
                </Paragraph>
              </li>
            ))}
          </ul>
        </Modal>
      </Content>
    </Layout>
  );
};

// Form Component
const SectionForm: React.FC<{ onCreate: (vals: any) => void; form: any }> = ({
  onCreate,
  form,
}) => (
  <Form
    form={form}
    layout="vertical"
    onFinish={onCreate}
    style={{ marginBottom: 24 }}
  >
    <Title level={4}>Create New Task</Title>
    <Form.Item
      label="Task Name"
      name="name"
      rules={[{ required: true, message: 'Please input task name' }]}
      hasFeedback
    >
      <Input placeholder="Enter name" />
    </Form.Item>

    <Form.Item
      label="Owner"
      name="owner"
      rules={[{ required: true, message: 'Please input owner' }]}
      hasFeedback
    >
      <Input placeholder="Enter owner" />
    </Form.Item>

    <Form.Item
      label="Shell Command"
      name="command"
      rules={[{ required: true, message: 'Please input a command' }]}
      hasFeedback
    >
      <Input placeholder="e.g. ls -la" />
    </Form.Item>

    <Form.Item>
      <Button type="primary" htmlType="submit">
        Create Task
      </Button>
    </Form.Item>
  </Form>
);

export default App;
