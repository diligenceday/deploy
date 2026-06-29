import { Layout, Space, Typography } from 'antd';
import { GithubOutlined } from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Text, Link } = Typography;

const CHAINS = [
  { name: 'Ethereum', color: '#627eea' },
  { name: 'BNB Chain', color: '#f0b90b' },
  { name: 'Polygon', color: '#8247e5' },
  { name: 'Arbitrum', color: '#28a0f0' },
  { name: 'Optimism', color: '#ff0420' },
  { name: 'Base', color: '#0052ff' },
];

export default function Footer() {
  return (
    <AntFooter style={{ textAlign: 'center', background: '#fafafa', borderTop: '1px solid #f0f0f0', padding: '20px 24px' }}>
      <Space direction="vertical" size={4}>
        <Space size={6} wrap>
          <Text type="secondary" style={{ fontSize: 12 }}>支持网络:</Text>
          {CHAINS.map(c => (
            <Text key={c.name} style={{ fontSize: 12, color: c.color, fontWeight: 500 }}>● {c.name}</Text>
          ))}
        </Space>
        <Space size={12} style={{ fontSize: 12 }}>
          <Text type="secondary">© 2026 Deploy DApp · 一键部署代币合约</Text>
          <Link href="https://github.com/diligenceday/deploy" target="_blank" style={{ fontSize: 12 }}>
            <GithubOutlined /> GitHub
          </Link>
        </Space>
      </Space>
    </AntFooter>
  );
}
