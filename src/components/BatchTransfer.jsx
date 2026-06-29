import { useState } from 'react';
import { Form, Input, InputNumber, Button, Alert, Card, Typography, Space, Progress, message } from 'antd';
import { SendOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getAccount, writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { parseAbi, parseUnits, isAddress } from 'viem';
import { config } from '../wagmiconf.js';
import DeployHistory from './DeployHistory.jsx';

const { Text, Paragraph } = Typography;

// ERC20 ABI (只 transfer/balanceOf/decimals 够用)
const ERC20_ABI = parseAbi([
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
]);

/**
 * 批量转账组件
 *
 * 流程:
 * 1. 输入 ERC20 代币地址 + 接收方列表 (每行: address,amount)
 * 2. 循环调用 transfer,带进度条
 * 3. 失败的地址单独记录,可重试
 */
export default function BatchTransfer() {
  const account = getAccount(config);
  const [tokenAddr, setTokenAddr] = useState('');
  const [decimals, setDecimals] = useState(18);
  const [recipients, setRecipients] = useState('0x...,1000\n0x...,2000');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, success: 0, failed: 0 });
  const [results, setResults] = useState([]); // [{addr, amount, status: 'success'|'failed', txHash?, error?}]

  // 解析接收方列表
  const parseRecipients = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    return lines.map(line => {
      const [addr, amount] = line.split(/[,\s]+/);
      return { addr, amount: amount || '0' };
    });
  };

  const onSubmit = async () => {
    if (!account?.address) {
      message.error('请先连接钱包');
      return;
    }
    if (!isAddress(tokenAddr)) {
      message.error('代币合约地址无效');
      return;
    }
    const list = parseRecipients(recipients);
    if (list.length === 0) {
      message.error('请输入至少一个接收方');
      return;
    }
    for (const r of list) {
      if (!isAddress(r.addr)) {
        message.error(`地址无效: ${r.addr}`);
        return;
      }
    }

    setRunning(true);
    setResults([]);
    setProgress({ done: 0, total: list.length, success: 0, failed: 0 });

    const newResults = [];
    for (let i = 0; i < list.length; i++) {
      const r = list[i];
      try {
        const amount = parseUnits(r.amount, decimals);
        const hash = await writeContract(config, {
          abi: ERC20_ABI,
          address: tokenAddr,
          functionName: 'transfer',
          args: [r.addr, amount],
          account: account.address,
        });
        await waitForTransactionReceipt(config, { hash, timeout: 120_000 });
        newResults.push({ ...r, status: 'success', txHash: hash });
        setProgress(p => ({ ...p, done: i + 1, success: p.success + 1 }));
      } catch (e) {
        const errMsg = e?.shortMessage || e?.message || String(e);
        newResults.push({ ...r, status: 'failed', error: errMsg });
        setProgress(p => ({ ...p, done: i + 1, failed: p.failed + 1 }));
      }
      setResults([...newResults]);
    }

    setRunning(false);
    message.success(`批量转账完成: ${newResults.filter(r => r.status === 'success').length}/${list.length} 成功`);
  };

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Alert
        type="info"
        showIcon
        message="批量转账 (空投工具)"
        description={
          <div>
            一次给多个地址转 ERC20 代币。接收方格式: <code>address,amount</code> (每行一个)
            <br />例: <code>0x1234...,100</code> 表示给 0x1234... 转 100 个代币
          </div>
        }
      />

      <Form layout="vertical">
        <Form.Item label="代币合约地址 (ERC20)" required>
          <Input
            value={tokenAddr}
            onChange={e => setTokenAddr(e.target.value)}
            placeholder="0x..."
            disabled={running}
          />
        </Form.Item>
        <Form.Item label="代币精度 (decimals)" required>
          <InputNumber
            value={decimals}
            onChange={v => setDecimals(v || 18)}
            min={0}
            max={36}
            style={{ width: '100%' }}
            disabled={running}
          />
        </Form.Item>
        <Form.Item
          label={
            <Space>
              接收方列表 (每行: address,amount)
            </Space>
          }
          required
        >
          <Input.TextArea
            value={recipients}
            onChange={e => setRecipients(e.target.value)}
            rows={6}
            placeholder={'0x123...,100\n0x456...,200\n0x789...,50'}
            disabled={running}
          />
        </Form.Item>
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={onSubmit}
          loading={running}
          disabled={!account?.address}
          block
        >
          开始批量转账 ({parseRecipients(recipients).length} 笔)
        </Button>
      </Form>

      {progress.total > 0 && (
        <Card size="small" title={`进度: ${progress.done}/${progress.total}`}>
          <Progress
            percent={Math.round((progress.done / progress.total) * 100)}
            status={progress.failed > 0 ? 'exception' : 'active'}
          />
          <Space size={16} style={{ marginTop: 8 }}>
            <Text type="success">✓ 成功: {progress.success}</Text>
            <Text type="danger">✗ 失败: {progress.failed}</Text>
          </Space>
        </Card>
      )}

      {results.length > 0 && (
        <Card size="small" title="转账结果">
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            {results.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                {r.status === 'success' ? (
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                ) : (
                  <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                )}
                <Text code style={{ fontSize: 12 }}>{`${r.addr.slice(0, 8)}...${r.addr.slice(-4)}`}</Text>
                <Text style={{ fontSize: 12 }}>{r.amount}</Text>
                {r.status === 'failed' && (
                  <Text type="danger" style={{ fontSize: 11 }}>{r.error?.slice(0, 50)}</Text>
                )}
              </div>
            ))}
          </Space>
        </Card>
      )}

      <DeployHistory />
    </Space>
  );
}
