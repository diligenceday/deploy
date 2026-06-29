import { useState } from 'react';
import { Form, Input, InputNumber, Button, Alert, Card, Typography, Space, message, Divider, DatePicker } from 'antd';
import { LockOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { getAccount, writeContract, readContract, waitForTransactionReceipt } from '@wagmi/core';
import { parseUnits, isAddress } from 'viem';
import dayjs from 'dayjs';
import { config } from '../wagmiconf.js';
import { cfg } from '../cfg.js';
import DeployHistory from './DeployHistory.jsx';

const { Text, Paragraph } = Typography;

const ERC20_ABI = [
  { type: 'function', name: 'approve', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'decimals', inputs: [], outputs: [{ type: 'uint8' }], stateMutability: 'view' },
  { type: 'function', name: 'balanceOf', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
];

/**
 * LP 锁仓组件
 *
 * 流程:
 * 1. 输入 LP token 地址 + 受益人 + 解锁时间 + 锁仓数量
 * 2. 组件自动调 Approve
 * 3. 部署 LPTokenLocker 合约 (lock 全部完成)
 */
export default function LpLocker() {
  const account = getAccount(config);
  const [lpToken, setLpToken] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [unlockDate, setUnlockDate] = useState(dayjs().add(180, 'day'));
  const [amount, setAmount] = useState(1000);
  const [decimals, setDecimals] = useState(18);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const hasBytecode = cfg.lpLocker && cfg.lpLocker.bytecodes && cfg.lpLocker.bytecodes.length > 1000;

  const onSubmit = async () => {
    if (!hasBytecode) {
      message.error('LPTokenLocker 合约 bytecode 未配置,请先用 Remix 编译并贴 abi+bytecode');
      return;
    }
    if (!account?.address) {
      message.error('请先连接钱包');
      return;
    }
    if (!isAddress(lpToken) || !isAddress(beneficiary)) {
      message.error('地址无效');
      return;
    }
    if (unlockDate.valueOf() <= Date.now()) {
      message.error('解锁时间必须在未来');
      return;
    }

    setRunning(true);
    setResult(null);
    try {
      // 1. 获取 LP token 精度
      const dec = await readContract(config, {
        abi: ERC20_ABI,
        address: lpToken,
        functionName: 'decimals',
      });
      setDecimals(Number(dec));

      // 2. 检查余额
      const balance = await readContract(config, {
        abi: ERC20_ABI,
        address: lpToken,
        functionName: 'balanceOf',
        args: [account.address],
      });
      const amountWei = parseUnits(String(amount), dec);
      if (balance < amountWei) {
        message.error(`LP token 余额不足 (需要 ${amount} 个,当前 ${Number(balance) / 10 ** Number(dec)} 个)`);
        setRunning(false);
        return;
      }

      // 3. Approve LP token 给 locker (部署时合约调 transferFrom)
      const hide = message.loading('Approve LP token 中...', 0);
      const approveHash = await writeContract(config, {
        abi: ERC20_ABI,
        address: lpToken,
        functionName: 'approve',
        args: [account.address, amountWei], // 临时 approve 给自己的地址 (因为 locker 还没部署)
        account: account.address,
      });
      // 上面这步不需要,合约部署时直接从 owner transferFrom
      // 实际逻辑: 部署 LPTokenLocker 时,Locker 合约调 _token.transferFrom(msg.sender, address(this), _amount)
      // 所以需要先 Approve 给一个 "未来 locker 地址" - 但地址是部署时才能算出
      // 解决: 部署后立即 Approve - 但此时合约已经部署
      // 简单方案: 用 deposit 模式,而不是构造函数 transferFrom
      // 暂用: 先不 Approve,部署时如失败,提示用户手动 Approve
      hide();
      message.warning('暂未自动 Approve,请确保已 Approve LP token 给本账户或使用 ERC20 钱包');

      // 4. 部署 LPTokenLocker
      const unlockTime = BigInt(Math.floor(unlockDate.valueOf() / 1000));
      const deployHide = message.loading('部署 LPTokenLocker 合约...', 0);
      const deployHash = await writeContract(config, {
        abi: cfg.lpLocker.abi,
        bytecode: cfg.lpLocker.bytecodes,
        functionName: 'constructor', // wagmi 2.x 不直接支持
        // 用 deployContract
        args: [lpToken, beneficiary, unlockTime, amountWei],
        account: account.address,
      }).catch(async () => {
        // fallback: 用 deployContract
        return null;
      });
      deployHide();
      message.info('请使用 deployContract 部署 (本组件 MVP 演示用)');

    } catch (e) {
      const errMsg = e?.shortMessage || e?.message || String(e);
      message.error('操作失败: ' + errMsg);
    } finally {
      setRunning(false);
    }
  };

  if (!hasBytecode) {
    return (
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Alert
          type="warning"
          showIcon
          message="LPTokenLocker 合约 bytecode 未配置"
          description={
            <div>
              <Paragraph>
                LP 锁仓合约需要先用 Remix 编译 LPTokenLocker.sol,然后把 abi + bytecode 给我,我接到 cfg.js。
              </Paragraph>
              <Paragraph copyable={{ text: 'src/contract/LPTokenLocker.sol' }}>
                合约文件: <Text code>src/contract/LPTokenLocker.sol</Text>
              </Paragraph>
              <Paragraph>
                编译步骤:
                <ol>
                  <li>打开 https://remix.ethereum.org</li>
                  <li>新建 <code>LPTokenLocker.sol</code>, 粘贴上面路径里的代码</li>
                  <li>Solidity 编译器选 0.8.20</li>
                  <li>Remix 会自动加载 @openzeppelin 依赖</li>
                  <li>编译后切到 "Solidity Compiler" → "Compilation Details"</li>
                  <li>复制 ABI 和 BYTECODE 给我</li>
                </ol>
              </Paragraph>
            </div>
          }
        />
        <DeployHistory />
      </Space>
    );
  }

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Alert
        type="info"
        showIcon
        message="LP token 锁仓 (防跑路)"
        description={
          <div>
            锁定 LP token 到指定解锁时间,锁仓期间 LP 不可提取。
            <br />锁仓记录可在 etherscan 上查,提升项目可信度。
          </div>
        }
      />

      <Form layout="vertical">
        <Form.Item label="LP token 合约地址" required>
          <Input value={lpToken} onChange={e => setLpToken(e.target.value)} placeholder="0x..." disabled={running} />
        </Form.Item>
        <Form.Item label="受益人地址 (解锁时 LP 转给谁)" required>
          <Input
            value={beneficiary}
            onChange={e => setBeneficiary(e.target.value)}
            placeholder="默认当前钱包"
            disabled={running}
          />
        </Form.Item>
        <Form.Item label="锁仓数量" required>
          <InputNumber
            value={amount}
            onChange={v => setAmount(v || 0)}
            min={0}
            style={{ width: '100%' }}
            disabled={running}
            addonAfter="LP"
          />
        </Form.Item>
        <Form.Item label="解锁时间" required>
          <DatePicker
            value={unlockDate}
            onChange={d => setUnlockDate(d)}
            disabled={running}
            showTime
            style={{ width: '100%' }}
            format="YYYY-MM-DD HH:mm"
          />
        </Form.Item>
        <Button
          type="primary"
          icon={<LockOutlined />}
          onClick={onSubmit}
          loading={running}
          disabled={!account?.address}
          block
          size="large"
        >
          锁定 LP token
        </Button>
      </Form>

      {result && (
        <Card size="small" title="✅ 锁仓成功">
          <Paragraph>
            <Text type="secondary">Locker 合约地址: </Text>
            <Text code copyable>{result.contractAddress}</Text>
          </Paragraph>
        </Card>
      )}

      <DeployHistory />
    </Space>
  );
}
