import DeployForm from './DeployForm';

// 常用 pair token 地址 (USDT on 主流链)
// BNB Chain USDT = 0x55d398326f99059fF775485246999027B3197955
// Ethereum USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7
// Sepolia USDT = 0x7169D38820dfd117C3FA1f22a697dBA58d90BA06
const fields = [
  {
    name: '_pairToken',
    label: '配对代币合约地址 (USDT 等)',
    type: 'text',
    defaultValue: '0x55d398326f99059fF775485246999027B3197955',
    required: true,
    group: '链上参数',
  },
  { name: 'name_', label: 'LP token 名称', type: 'text', defaultValue: 'My LP Token', required: true },
  { name: 'symbol_', label: 'LP token 符号', type: 'text', defaultValue: 'MLP', required: true },
];

// 构造器: (IERC20 _pairToken, string name_, string symbol_)
const buildArgs = (v) => [v._pairToken, v.name_, v.symbol_];

export default function LpToken() {
  return (
    <div>
      <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', padding: 12, marginBottom: 16, borderRadius: 4, color: '#874d00' }}>
        ⚠️ LP 合约 bytecode 正在重新编译中,当前部署可能失败。
        <br />配对代币推荐: BNB Chain USDT <code>0x55d398326f99059fF775485246999027B3197955</code>
      </div>
      <DeployForm
        abiKey="liquidityToken"
        fields={fields}
        buildArgs={buildArgs}
        submitText="创建 LP 代币"
      />
    </div>
  );
}
