import { useState } from 'react';
import { Form, Input, InputNumber, Button, Alert, Card, Typography, Space, message, Divider } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { getAccount, writeContract, readContract, waitForTransactionReceipt } from '@wagmi/core';
import { parseAbi, parseUnits, isAddress } from 'viem';
import { config } from '../wagmiconf.js';
import DeployHistory from './DeployHistory.jsx';

const { Text, Paragraph } = Typography;

// Uniswap V2 / PancakeSwap Router (相同的 addLiquidityETH 接口)
const ROUTER_ABI = parseAbi([
  'function addLiquidityETH(address token, uint256 amountTokenDesired, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) payable returns (uint256 amountToken, uint256 amountETH, uint256 liquidity)',
  'function WETH() view returns (address)',
]);

// 链默认 router
const CHAIN_DEFAULTS = {
  1: { name: 'Ethereum', router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', symbol: 'ETH', scan: 'https://etherscan.io' },
  56: { name: 'BNB Chain', router: '0x10ED43C718714eb63d5aA57B78B54704E256024E', symbol: 'BNB', scan: 'https://bscscan.com' },
  137: { name: 'Polygon', router: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff', symbol: 'MATIC', scan: 'https://polygonscan.com' },
  42161: { name: 'Arbitrum', router: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506', symbol: 'ETH', scan: 'https://arbiscan.io' },
  10: { name: 'Optimism', router: '0x4a7b5DA61326cF712e3010AC1210751C3273e98F', symbol: 'ETH', scan: 'https://optimistic.etherscan.io' },
  8453: { name: 'Base', router: '0x4752ba5DBc23f5dDB5a6e4f88F5B0D8E1F2B6e9A', symbol: 'ETH', scan: 'https://basescan.org' },
  11155111: { name: 'Sepolia', router: '0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008', symbol: 'ETH', scan: 'https://sepolia.etherscan.io' },
};

// ERC20 approve ABI
const ERC20_ABI = parseAbi([
  'function approve(address spender, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
]);

export default function AddLiquidity() {
  const account = getAccount(config);
  const [tokenAddr, setTokenAddr] = useState('');
  const [tokenAmount, setTokenAmount] = useState(1000000);
  const [ethAmount, setEthAmount] = useState(0.1);
  const [slippage, setSlippage] = useState(5); // 5%
  const [router, setRouter] = useState('0x10ED43C718714eb63d5aA57B78B54704E256024E');
  const [decimals, setDecimals] = useState(18);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const chainInfo = CHAIN_DEFAULTS[account?.chainId] || { name: 'Unknown', router: '', symbol: 'ETH', scan: '' };

  const onSubmit = async () => {
    if (!account?.address) {
      message.error('请先连接钱包');
      return;
    }
    if (!isAddress(tokenAddr) || !isAddress(router)) {
      message.error('合约地址无效');
      return;
    }
    setRunning(true);
    setResult(null);
    try {
      // 1. 获取代币精度
      const dec = await readContract(config, {
        abi: ERC20_ABI,
        address: tokenAddr,
        functionName: 'decimals',
      });
      setDecimals(Number(dec));

      // 2. 检查余额
      const balance = await readContract(config, {
        abi: ERC20_ABI,
        address: tokenAddr,
        functionName: 'balanceOf',
        args: [account.address],
      });
      const amountTokenWei = parseUnits(String(tokenAmount), dec);
      if (balance < amountTokenWei) {
        message.error(`代币余额不足 (需要 ${tokenAmount} 个,当前 ${Number(balance) / 10 ** Number(dec)} 个)`);
        setRunning(false);
        return;
      }

      // 3. Approve
      const allowance = await readContract(config, {
        abi: ERC20_ABI,
        address: tokenAddr,
        functionName: 'allowance',
        args: [account.address, router],
      });
      if (allowance < amountTokenWei) {
        const hide = message.loading('Approve 代币授权中...', 0);
        const approveHash = await writeContract(config, {
          abi: ERC20_ABI,
          address: tokenAddr,
          functionName: 'approve',
          args: [router, amountTokenWei],
          account: account.address,
        });
        await waitForTransactionReceipt(config, { hash: approveHash, timeout: 120_000 });
        hide();
        message.success('Approve 完成');
      }

      // 4. addLiquidityETH
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20); // 20 分钟
      const ethWei = parseUnits(String(ethAmount), 18);
      const minToken = amountTokenWei - (amountTokenWei * BigInt(slippage) / 100n);
      const minEth = ethWei - (ethWei * BigInt(slippage) / 100n);

      const hide = message.loading('添加流动性中...', 0);
      const txHash = await writeContract(config, {
        abi: ROUTER_ABI,
        address: router,
        functionName: 'addLiquidityETH',
        args: [
          tokenAddr,
          amountTokenWei,
          minToken,
          minEth,
          account.address,
          deadline,
        ],
        value: ethWei,
        account: account.address,
      });
      const receipt = await waitForTransactionReceipt(config, { hash: txHash, timeout: 300_000 });
      hide();
      message.success('添加流动性成功!');
      setResult({ txHash, receipt });
    } catch (e) {
      const errMsg = e?.shortMessage || e?.message || String(e);
      message.error('添加失败: ' + errMsg);
      console.error(e);
    } finally {
      setRunning(false);
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Alert
        type="info"
        showIcon
        message="自动加流动性 (Uniswap V2 / PancakeSwap)"
        description={
          <div>
            一步完成 Approve + addLiquidityETH,自动获取 LP token。
            <br />当前网络: <Text strong>{chainInfo.name}</Text>,使用 <Text code>{chainInfo.symbol}</Text> 作为配对资产。
            <br />支持链: Ethereum / BNB Chain / Polygon / Arbitrum / Optimism / Base
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
        <Form.Item label="Router 地址 (Uniswap V2 / Pancake)" required tooltip="默认 PancakeSwap Router (BSC)">
          <Input
            value={router}
            onChange={e => setRouter(e.target.value)}
            disabled={running}
          />
        </Form.Item>

        <Divider style={{ margin: '12px 0' }}>添加数量</Divider>

        <Space size={12} style={{ width: '100%' }}>
          <Form.Item label="代币数量" required style={{ flex: 1, marginBottom: 12 }}>
            <InputNumber
              value={tokenAmount}
              onChange={v => setTokenAmount(v || 0)}
              min={0}
              style={{ width: '100%' }}
              disabled={running}
            />
          </Form.Item>
          <Form.Item label={`${chainInfo.symbol} 数量`} required style={{ flex: 1, marginBottom: 12 }}>
            <InputNumber
              value={ethAmount}
              onChange={v => setEthAmount(v || 0)}
              min={0}
              step={0.01}
              style={{ width: '100%' }}
              disabled={running}
            />
          </Form.Item>
          <Form.Item label="滑点 (%)" style={{ width: 100, marginBottom: 12 }}>
            <InputNumber
              value={slippage}
              onChange={v => setSlippage(v || 0)}
              min={0}
              max={50}
              style={{ width: '100%' }}
              disabled={running}
            />
          </Form.Item>
        </Space>

        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={onSubmit}
          loading={running}
          disabled={!account?.address}
          block
          size="large"
        >
          一键添加流动性
        </Button>
      </Form>

      {result && (
        <Card size="small" title="✅ 添加成功">
          <Paragraph copyable={{ text: result.txHash }} style={{ marginBottom: 4 }}>
            <Text type="secondary">交易哈希: </Text>
            <Text code style={{ fontSize: 12 }}>{result.txHash}</Text>
          </Paragraph>
          {chainInfo.scan && (
            <a href={`${chainInfo.scan}/tx/${result.txHash}`} target="_blank" rel="noopener noreferrer">
              在 {chainInfo.name} 浏览器查看 →
            </a>
          )}
        </Card>
      )}

      <DeployHistory />
    </Space>
  );
}
