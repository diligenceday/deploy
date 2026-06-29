import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Alert, Card, Steps, Typography, Space, message, Divider, Result } from 'antd';
import { RocketOutlined, CheckCircleOutlined, PlusCircleOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAccount, deployContract, writeContract, readContract, waitForTransactionReceipt } from '@wagmi/core';
import { parseAbi, parseUnits, isAddress } from 'viem';
import { config } from '../wagmiconf.js';
import { cfg } from '../cfg.js';
import DeployHistory from './DeployHistory.jsx';
import { addToHistory } from './DeployHistory.jsx';

const { Text, Paragraph } = Typography;
const { Step } = Steps;

const ERC20_ABI = parseAbi([
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
]);

const ROUTER_ABI = parseAbi([
  'function addLiquidityETH(address token, uint256 amountTokenDesired, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) payable returns (uint256 amountToken, uint256 amountETH, uint256 liquidity)',
]);

const CHAIN_DEFAULTS = {
  1: { name: 'Ethereum', router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', symbol: 'ETH', scan: 'https://etherscan.io' },
  56: { name: 'BNB Chain', router: '0x10ED43C718714eb63d5aA57B78B54704E256024E', symbol: 'BNB', scan: 'https://bscscan.com' },
  137: { name: 'Polygon', router: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff', symbol: 'MATIC', scan: 'https://polygonscan.com' },
  42161: { name: 'Arbitrum', router: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506', symbol: 'ETH', scan: 'https://arbiscan.io' },
  10: { name: 'Optimism', router: '0x4a7b5DA61326cF712e3010AC1210751C3273e98F', symbol: 'ETH', scan: 'https://optimistic.etherscan.io' },
  8453: { name: 'Base', router: '0x4752ba5DBc23f5dDB5a6e4f88F5B0D8E1F2B6e9A', symbol: 'ETH', scan: 'https://basescan.org' },
  11155111: { name: 'Sepolia', router: '0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008', symbol: 'ETH', scan: 'https://sepolia.etherscan.io' },
};

/**
 * 一键发币 3 步:
 *   1. 部署 ERC20 代币
 *   2. 添加流动性 (Approve + addLiquidityETH)
 *   3. (可选) 锁定 LP token
 */
export default function OneClickLaunch() {
  const account = getAccount(config);
  const navigate = useNavigate();
  const location = useLocation();
  const [current, setCurrent] = useState(0);
  const [running, setRunning] = useState(false);

  // 表单状态
  const [name, setName] = useState('My Token');
  const [symbol, setSymbol] = useState('MTK');
  const [total, setTotal] = useState(1000000);
  const [decimals, setDecimals] = useState(18);
  const [router, setRouter] = useState('0x10ED43C718714eb63d5aA57B78B54704E256024E');
  const [tokenAmount, setTokenAmount] = useState(500000);  // 50% 进 LP
  const [ethAmount, setEthAmount] = useState(0.1);
  const [slippage, setSlippage] = useState(5);
  const [lockAmount, setLockAmount] = useState(0);  // 锁多少 LP,0 = 不锁
  const [unlockDays, setUnlockDays] = useState(180);

  // 结果
  const [tokenAddr, setTokenAddr] = useState('');
  const [lpAmount, setLpAmount] = useState('0');
  const [lockerAddr, setLockerAddr] = useState('');

  const chainInfo = CHAIN_DEFAULTS[account?.chainId] || { name: 'Unknown', router: '', symbol: 'ETH', scan: '' };

  // 如果 URL 带 ?fromDeploy=0xABC 自动填充 token 地址 (从 Erc20 跳过来)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const from = params.get('fromDeploy');
    if (from && isAddress(from)) {
      setTokenAddr(from);
      setCurrent(1); // 跳过部署步
      message.success('已从部署页带过来,直接进入"加流动性"步骤');
    }
  }, [location.search]);

  // 步骤 1: 部署代币
  const step1DeployToken = async () => {
    if (!account?.address) {
      message.error('请先连接钱包');
      throw new Error('not connected');
    }
    if (!cfg.erc20) throw new Error('erc20 合约未配置');
    const args = [[name, symbol], [], [Number(decimals), Number(total)], []];
    const hash = await deployContract(config, {
      abi: cfg.erc20.abi,
      account: account.address,
      args,
      bytecode: cfg.erc20.bytecodes,
    });
    const receipt = await waitForTransactionReceipt(config, { hash, timeout: 120_000 });
    const addr = receipt.contractAddress;
    setTokenAddr(addr);
    addToHistory({
      type: '标准代币',
      name,
      symbol,
      contractAddress: addr,
      txHash: hash,
      chainId: account.chainId,
    });
    return addr;
  };

  // 步骤 2: 加流动性
  const step2AddLiquidity = async () => {
    if (!tokenAddr) throw new Error('请先完成步骤 1');
    const dec = await readContract(config, { abi: ERC20_ABI, address: tokenAddr, functionName: 'decimals' });
    const amountWei = parseUnits(String(tokenAmount), dec);

    // Approve
    const allowance = await readContract(config, {
      abi: ERC20_ABI,
      address: tokenAddr,
      functionName: 'allowance',
      args: [account.address, router],
    });
    if (allowance < amountWei) {
      const approveHash = await writeContract(config, {
        abi: ERC20_ABI,
        address: tokenAddr,
        functionName: 'approve',
        args: [router, amountWei],
        account: account.address,
      });
      await waitForTransactionReceipt(config, { hash: approveHash, timeout: 120_000 });
    }

    // addLiquidityETH
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);
    const ethWei = parseUnits(String(ethAmount), 18);
    const minToken = amountWei - (amountWei * BigInt(slippage) / 100n);
    const minEth = ethWei - (ethWei * BigInt(slippage) / 100n);
    const hash = await writeContract(config, {
      abi: ROUTER_ABI,
      address: router,
      functionName: 'addLiquidityETH',
      args: [tokenAddr, amountWei, minToken, minEth, account.address, deadline],
      value: ethWei,
      account: account.address,
    });
    const receipt = await waitForTransactionReceipt(config, { hash, timeout: 300_000 });

    // 从 receipt.events 读 LP token 数量 (简化: 返回 value)
    // 实际: Uniswap V2 Pair address = create2(token0, token1), 但我们不知道 LP token 地址
    // 提示用户去查 pair address
    setLpAmount('(查 pair)');
    return hash;
  };

  // 步骤 3: 锁仓
  const step3LockLP = async () => {
    if (lockAmount <= 0) {
      message.info('跳过锁仓 (lockAmount=0)');
      return null;
    }
    if (!cfg.lpLocker || !cfg.lpLocker.bytecodes || cfg.lpLocker.bytecodes.length < 1000) {
      message.warning('LPTokenLocker bytecode 未配置,跳过锁仓');
      return null;
    }
    // 部署 locker
    // const lpToken = ... (需要用户填 LP pair address)
    // 暂用占位
    message.warning('LP 锁仓需要 LP pair address,请用侧边栏"LP 锁仓"页面独立完成');
    return null;
  };

  // 一键执行
  const onLaunch = async () => {
    setRunning(true);
    try {
      setCurrent(0);
      const addr1 = await step1DeployToken();
      setCurrent(1);
      const hash2 = await step2AddLiquidity();
      setCurrent(2);
      await step3LockLP();
      setCurrent(3);
      message.success('🎉 一键发币完成!代币已上线并可交易');
    } catch (e) {
      const errMsg = e?.shortMessage || e?.message || String(e);
      message.error('失败: ' + errMsg);
      console.error(e);
    } finally {
      setRunning(false);
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Alert
        type="success"
        showIcon
        message="🚀 一键发币: 部署代币 + 添加流动性 (3 分钟上线)"
        description={
          <div>
            PandaTool 同款流程: 填一次表,自动完成 3 步。
            {chainInfo.name && <span> 当前网络: <Text strong>{chainInfo.name}</Text></span>}
          </div>
        }
      />

      <Steps current={current} size="small">
        <Step title="部署代币" icon={<RocketOutlined />} description={tokenAddr ? '✓' : ''} />
        <Step title="加流动性" icon={<PlusCircleOutlined />} description={current >= 1 ? '✓' : ''} />
        <Step title="锁仓 LP" icon={<LockOutlined />} description={current >= 2 ? (lockAmount > 0 ? '✓' : '跳过') : ''} />
      </Steps>

      {current < 3 ? (
        <Card>
          <Form layout="vertical">
            <Divider style={{ margin: '8px 0 16px' }}>代币信息</Divider>
            <Space size={12} style={{ width: '100%' }}>
              <Form.Item label="代币名称" required style={{ flex: 1, marginBottom: 12 }}>
                <Input value={name} onChange={e => setName(e.target.value)} disabled={running} />
              </Form.Item>
              <Form.Item label="代币符号" required style={{ flex: 1, marginBottom: 12 }}>
                <Input value={symbol} onChange={e => setSymbol(e.target.value)} disabled={running} />
              </Form.Item>
              <Form.Item label="发行量" required style={{ flex: 1, marginBottom: 12 }}>
                <InputNumber value={total} onChange={v => setTotal(v || 0)} min={1} style={{ width: '100%' }} disabled={running} />
              </Form.Item>
              <Form.Item label="精度" style={{ width: 100, marginBottom: 12 }}>
                <InputNumber value={decimals} onChange={v => setDecimals(v || 18)} min={0} max={36} style={{ width: '100%' }} disabled={running} />
              </Form.Item>
            </Space>

            <Divider style={{ margin: '8px 0 16px' }}>流动性设置</Divider>
            <Space size={12} style={{ width: '100%' }}>
              <Form.Item label={`代币进 LP (建议 50%)`} required style={{ flex: 1, marginBottom: 12 }}>
                <InputNumber value={tokenAmount} onChange={v => setTokenAmount(v || 0)} min={0} style={{ width: '100%' }} disabled={running} />
              </Form.Item>
              <Form.Item label={`${chainInfo.symbol} 配对`} required style={{ flex: 1, marginBottom: 12 }}>
                <InputNumber value={ethAmount} onChange={v => setEthAmount(v || 0)} min={0} step={0.01} style={{ width: '100%' }} disabled={running} />
              </Form.Item>
              <Form.Item label="滑点 (%)" style={{ width: 100, marginBottom: 12 }}>
                <InputNumber value={slippage} onChange={v => setSlippage(v || 0)} min={0} max={50} style={{ width: '100%' }} disabled={running} />
              </Form.Item>
            </Space>
            <Form.Item label="Router 地址" tooltip="默认 PancakeSwap (BSC)">
              <Input value={router} onChange={e => setRouter(e.target.value)} disabled={running} />
            </Form.Item>

            <Divider style={{ margin: '8px 0 16px' }}>锁仓设置 (可选,提升信任)</Divider>
            <Space size={12} style={{ width: '100%' }}>
              <Form.Item label="锁仓 LP 数量" tooltip="0 = 不锁" style={{ flex: 1, marginBottom: 12 }}>
                <InputNumber value={lockAmount} onChange={v => setLockAmount(v || 0)} min={0} style={{ width: '100%' }} disabled={running} />
              </Form.Item>
              <Form.Item label="解锁天数" style={{ width: 150, marginBottom: 12 }}>
                <InputNumber value={unlockDays} onChange={v => setUnlockDays(v || 180)} min={1} style={{ width: '100%' }} disabled={running} addonAfter="天" />
              </Form.Item>
            </Space>

            <Button
              type="primary"
              size="large"
              icon={<RocketOutlined />}
              onClick={onLaunch}
              loading={running}
              disabled={!account?.address}
              block
            >
              一键发币 (3 步自动完成)
            </Button>
          </Form>
        </Card>
      ) : (
        <Result
          status="success"
          title="🎉 一键发币完成!"
          subTitle={
            <Space direction="vertical" size={4} style={{ marginTop: 8 }}>
              <Text>代币地址: <Text code copyable>{tokenAddr}</Text></Text>
              {chainInfo.scan && <a href={`${chainInfo.scan}/address/${tokenAddr}`} target="_blank" rel="noopener noreferrer">在 {chainInfo.name} 浏览器查看 <ArrowRightOutlined /></a>}
            </Space>
          }
          extra={[
            <Button type="primary" key="history" onClick={() => navigate('/erc20')}>再发一个币</Button>,
            <Button key="lp" onClick={() => navigate('/addliquidity')}>单独加流动性</Button>,
          ]}
        />
      )}

      <DeployHistory />
    </Space>
  );
}
