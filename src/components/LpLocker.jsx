import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Alert, Card, Typography, Space, message, DatePicker, Steps, Descriptions, Tag } from 'antd';
import { LockOutlined, CheckCircleOutlined, RocketOutlined, DollarOutlined, UnlockOutlined } from '@ant-design/icons';
import { getAccount, writeContract, readContract, waitForTransactionReceipt, deployContract } from '@wagmi/core';
import { parseUnits, isAddress, formatUnits } from 'viem';
import dayjs from 'dayjs';
import { config } from '../wagmiconf.js';
import { cfg } from '../cfg.js';
import { addToHistory } from './DeployHistory.jsx';

const { Text, Paragraph } = Typography;

const ERC20_ABI = [
  { type: 'function', name: 'approve', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'decimals', inputs: [], outputs: [{ type: 'uint8' }], stateMutability: 'view' },
  { type: 'function', name: 'balanceOf', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'allowance', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
];

/**
 * LP 锁仓组件 (deposit 模式)
 *
 * 流程 3 步:
 * 1. 部署 Locker 合约 (不扣款,只存元数据)
 * 2. Owner 调 Approve LP token 给 locker 地址
 * 3. Owner 调 deposit() 完成锁仓
 */
export default function LpLocker() {
  const account = getAccount(config);
  const [lpToken, setLpToken] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [unlockDate, setUnlockDate] = useState(dayjs().add(180, 'day'));
  const [amount, setAmount] = useState(1000);
  const [decimals, setDecimals] = useState(18);
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [lockerAddress, setLockerAddress] = useState('');
  const [result, setResult] = useState(null);

  // 自动填当前钱包为受益人
  useEffect(() => {
    if (account?.address && !beneficiary) {
      setBeneficiary(account.address);
    }
  }, [account?.address]);

  const hasBytecode = cfg.lpLocker && cfg.lpLocker.bytecodes && cfg.lpLocker.bytecodes.length > 1000;

  // Step 1: 部署 locker 合约
  const deployLocker = async () => {
    if (!hasBytecode) {
      message.error('LPTokenLocker 合约 bytecode 未配置');
      return;
    }
    if (!account?.address) {
      message.error('请先连接钱包');
      return;
    }
    if (!isAddress(lpToken)) {
      message.error('LP token 地址无效');
      return;
    }
    if (!isAddress(beneficiary)) {
      message.error('受益人地址无效');
      return;
    }
    if (unlockDate.valueOf() <= Date.now()) {
      message.error('解锁时间必须在未来');
      return;
    }
    if (amount <= 0) {
      message.error('锁仓数量必须 > 0');
      return;
    }

    setRunning(true);
    setResult(null);
    try {
      // 获取 LP token 精度
      const dec = await readContract(config, {
        abi: ERC20_ABI,
        address: lpToken,
        functionName: 'decimals',
      });
      setDecimals(Number(dec));
      const amountWei = parseUnits(String(amount), Number(dec));

      // 部署 locker 合约
      setCurrentStep(0);
      const hide = message.loading('部署 Locker 合约中...', 0);
      const unlockTime = BigInt(Math.floor(unlockDate.valueOf() / 1000));
      const deployHash = await deployContract(config, {
        abi: cfg.lpLocker.abi,
        bytecode: cfg.lpLocker.bytecodes,
        args: [lpToken, beneficiary, unlockTime, amountWei],
        account: account.address,
      });
      const receipt = await waitForTransactionReceipt(config, { hash: deployHash });
      hide();

      // 从 receipt 拿合约地址
      const addr = receipt.contractAddress;
      if (!addr) {
        throw new Error('未获取到 locker 合约地址');
      }
      setLockerAddress(addr);
      message.success('Locker 合约已部署: ' + addr);

      // 保存部署历史
      addToHistory({
        type: 'LP 锁仓',
        name: `Locker @ ${unlockDate.format('YYYY-MM-DD')}`,
        address: addr,
        txHash: deployHash,
        timestamp: Date.now(),
      });

      return { addr, amountWei };
    } catch (e) {
      const errMsg = e?.shortMessage || e?.message || String(e);
      message.error('部署失败: ' + errMsg);
      throw e;
    } finally {
      setRunning(false);
    }
  };

  // Step 2: Approve LP token 给 locker
  const approveLp = async (lockerAddr, amountWei) => {
    setRunning(true);
    try {
      setCurrentStep(1);
      const hide = message.loading('Approve LP token 给 Locker...', 0);
      const approveHash = await writeContract(config, {
        abi: ERC20_ABI,
        address: lpToken,
        functionName: 'approve',
        args: [lockerAddr, amountWei],
        account: account.address,
      });
      await waitForTransactionReceipt(config, { hash: approveHash });
      hide();
      message.success('Approve 成功');
    } catch (e) {
      const errMsg = e?.shortMessage || e?.message || String(e);
      message.error('Approve 失败: ' + errMsg);
      throw e;
    } finally {
      setRunning(false);
    }
  };

  // Step 3: 调 deposit() 完成锁仓
  const callDeposit = async (lockerAddr) => {
    setRunning(true);
    try {
      setCurrentStep(2);
      const hide = message.loading('Deposit 锁仓中...', 0);
      const depositHash = await writeContract(config, {
        abi: cfg.lpLocker.abi,
        address: lockerAddr,
        functionName: 'deposit',
        args: [],
        account: account.address,
      });
      await waitForTransactionReceipt(config, { hash: depositHash });
      hide();
      message.success('锁仓完成!');
      setCurrentStep(3);
      setResult({ lockerAddress: lockerAddr });
    } catch (e) {
      const errMsg = e?.shortMessage || e?.message || String(e);
      message.error('Deposit 失败: ' + errMsg);
      throw e;
    } finally {
      setRunning(false);
    }
  };

  // 一键完整流程
  const onFullLock = async () => {
    try {
      const { addr, amountWei } = await deployLocker();
      await approveLp(addr, amountWei);
      await callDeposit(addr);
    } catch (e) {
      // 单步已提示错误
    }
  };

  // 从中间步骤继续(部署后/Approve 后用户中断,可点继续)
  const resumeFromApprove = async () => {
    if (!lockerAddress) {
      message.warning('请先部署 Locker 合约');
      return;
    }
    try {
      const dec = await readContract(config, {
        abi: ERC20_ABI,
        address: lpToken,
        functionName: 'decimals',
      });
      const amountWei = parseUnits(String(amount), Number(dec));
      await approveLp(lockerAddress, amountWei);
      await callDeposit(lockerAddress);
    } catch (e) {
      // ignore
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Alert
        type="info"
        showIcon
        message="LP token 锁仓 (防跑路)"
        description={
          <div>
            锁定 LP token 到指定解锁时间,锁仓期间 LP 不可提取。锁仓记录可在 etherscan 上查,提升项目可信度。
          </div>
        }
      />

      {!hasBytecode && (
        <Alert type="error" showIcon message="LPTokenLocker 合约 bytecode 未配置" />
      )}

      <Form layout="vertical">
        <Form.Item label="LP token 合约地址" required>
          <Input value={lpToken} onChange={e => setLpToken(e.target.value)} placeholder="0x..." disabled={running || !!lockerAddress} />
        </Form.Item>
        <Form.Item label="受益人地址 (解锁时 LP 转给谁)" required>
          <Input value={beneficiary} onChange={e => setBeneficiary(e.target.value)} placeholder="默认当前钱包" disabled={running || !!lockerAddress} />
        </Form.Item>
        <Form.Item label="锁仓数量" required>
          <InputNumber value={amount} onChange={v => setAmount(v || 0)} min={0} style={{ width: '100%' }} disabled={running || !!lockerAddress} addonAfter="LP" />
        </Form.Item>
        <Form.Item label="解锁时间" required>
          <DatePicker value={unlockDate} onChange={d => setUnlockDate(d)} disabled={running || !!lockerAddress} showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm" />
        </Form.Item>

        <Steps
          size="small"
          current={currentStep}
          items={[
            { title: '部署 Locker', icon: <RocketOutlined /> },
            { title: 'Approve LP', icon: <DollarOutlined /> },
            { title: 'Deposit 锁仓', icon: <LockOutlined /> },
            { title: '完成', icon: <CheckCircleOutlined /> },
          ]}
          style={{ marginBottom: 16 }}
        />

        {!lockerAddress ? (
          <Button type="primary" icon={<LockOutlined />} onClick={onFullLock} loading={running} disabled={!account?.address || !hasBytecode} block size="large">
            一键锁仓 (3 步自动)
          </Button>
        ) : currentStep < 3 ? (
          <Button type="primary" icon={<LockOutlined />} onClick={resumeFromApprove} loading={running} block size="large">
            继续 Approve + Deposit
          </Button>
        ) : (
          <Button type="default" icon={<CheckCircleOutlined />} onClick={() => { setLockerAddress(''); setCurrentStep(0); setResult(null); }} block size="large">
            锁仓完成 - 新建一个
          </Button>
        )}
      </Form>

      {result && (
        <Card size="small" title={<><CheckCircleOutlined style={{ color: '#52c41a' }} /> 锁仓成功</>}>
          <Descriptions size="small" column={1} bordered>
            <Descriptions.Item label="Locker 合约">
              <Text code copyable>{result.lockerAddress}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="LP token">{lpToken}</Descriptions.Item>
            <Descriptions.Item label="受益人">{beneficiary}</Descriptions.Item>
            <Descriptions.Item label="锁仓数量">{amount} LP</Descriptions.Item>
            <Descriptions.Item label="解锁时间">
              <Tag color="blue">{unlockDate.format('YYYY-MM-DD HH:mm')}</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}
    </Space>
  );
}
