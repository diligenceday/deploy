import { useState, useEffect } from 'react';
import { Card, Empty, Tag, Typography, Button, Tooltip, Space } from 'antd';
import { CopyOutlined, LinkOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

const STORAGE_KEY = 'deploy_history_v1';
const MAX_HISTORY = 10;

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_HISTORY)));
  } catch {}
}

export function addToHistory(entry) {
  const list = loadHistory();
  list.unshift({
    id: Date.now(),
    timestamp: Date.now(),
    ...entry,
  });
  saveHistory(list);
  // 触发自定义事件,同页多个组件同步
  window.dispatchEvent(new CustomEvent('deploy-history-update'));
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}秒前`;
  if (s < 3600) return `${Math.floor(s / 60)}分钟前`;
  if (s < 86400) return `${Math.floor(s / 3600)}小时前`;
  return `${Math.floor(s / 86400)}天前`;
}

function shortAddr(addr) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

const TYPE_COLORS = {
  '标准代币': 'blue',
  '分红本币': 'purple',
  '闪贷代币': 'cyan',
  'DAO 治理': 'magenta',
  '黑洞燃烧': 'red',
  'LP 代币': 'gold',
};

export default function DeployHistory({ chainId }) {
  const [history, setHistory] = useState(loadHistory());

  useEffect(() => {
    const onUpdate = () => setHistory(loadHistory());
    window.addEventListener('deploy-history-update', onUpdate);
    return () => window.removeEventListener('deploy-history-update', onUpdate);
  }, []);

  const clearAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  };

  // 链信息
  const getChainName = (cid) => {
    const map = { 1: 'Ethereum', 56: 'BNB Chain', 137: 'Polygon', 42161: 'Arbitrum', 10: 'Optimism', 8453: 'Base', 11155111: 'Sepolia' };
    return map[cid] || `Chain ${cid}`;
  };
  const getChainScan = (cid) => {
    const map = { 1: 'https://etherscan.io', 56: 'https://bscscan.com', 137: 'https://polygonscan.com', 42161: 'https://arbiscan.io', 10: 'https://optimistic.etherscan.io', 8453: 'https://basescan.org', 11155111: 'https://sepolia.etherscan.io' };
    return map[cid] || 'https://etherscan.io';
  };

  return (
    <Card
      size="small"
      title="📜 部署历史 (最近 10 次)"
      extra={history.length > 0 && <Button size="small" type="text" icon={<DeleteOutlined />} onClick={clearAll}>清空</Button>}
      style={{ marginTop: 16 }}
    >
      {history.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="还没有部署记录"
          style={{ padding: '12px 0' }}
        />
      ) : (
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          {history.map((h) => (
            <div
              key={h.id}
              style={{
                padding: '8px 12px',
                background: '#fafafa',
                borderRadius: 4,
                border: '1px solid #f0f0f0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Space size={4}>
                  <Tag color={TYPE_COLORS[h.type] || 'default'} style={{ margin: 0 }}>{h.type}</Tag>
                  <Text type="secondary" style={{ fontSize: 12 }}>{h.name || h.symbol || '未命名'}</Text>
                </Space>
                <Text type="secondary" style={{ fontSize: 11 }}>{timeAgo(h.timestamp)}</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                <Text type="secondary" style={{ width: 50 }}>合约:</Text>
                <Text code copyable={{ tooltips: ['复制', '已复制'] }} style={{ fontSize: 12 }}>
                  {shortAddr(h.contractAddress)}
                </Text>
                {h.contractAddress && h.contractAddress !== '(非合约创建交易)' && (
                  <Tooltip title={`在 ${getChainName(h.chainId)} 浏览器查看`}>
                    <Button
                      size="small"
                      type="text"
                      icon={<LinkOutlined />}
                      onClick={() => window.open(`${getChainScan(h.chainId)}/address/${h.contractAddress}`, '_blank')}
                    />
                  </Tooltip>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, marginTop: 2 }}>
                <Text type="secondary" style={{ width: 50 }}>网络:</Text>
                <Text style={{ fontSize: 12 }}>{getChainName(h.chainId)}</Text>
                {h.txHash && (
                  <Text type="secondary" style={{ fontSize: 11, marginLeft: 'auto' }}>
                    tx: {shortAddr(h.txHash)}
                  </Text>
                )}
              </div>
            </div>
          ))}
        </Space>
      )}
    </Card>
  );
}
