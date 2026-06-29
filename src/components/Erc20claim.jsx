import DeployForm from './DeployForm.jsx';

const num = (v) => Math.floor(1 * Number(v || 0));

const fields = [
  // 基础信息
  { name: 'tokenName', label: 'token name 代币名称', type: 'text', required: true, group: '基础信息' },
  { name: 'symbolName', label: 'symbol name 代币符号', type: 'text', required: true },
  { name: 'total', label: 'total 代币发行量', type: 'number', defaultValue: 2000000, required: true },
  { name: 'precision', label: '代币精度', type: 'number', defaultValue: 18, required: true },
  // 买入税率
  { name: 'buyFundFee', label: '营销税率', type: 'number', defaultValue: 1, addonAfter: '%', group: '买入税率' },
  { name: 'buy_burnFee', label: '销毁税率', type: 'number', defaultValue: 1, addonAfter: '%' },
  { name: 'buyReflectFee', label: '回流税率', type: 'number', defaultValue: 1, addonAfter: '%' },
  { name: 'buyLPFee', label: '分红税率', type: 'number', defaultValue: 1, addonAfter: '%' },
  // 卖出税率
  { name: 'sellFundFee', label: '营销税率', type: 'number', defaultValue: 1, addonAfter: '%', group: '卖出税率' },
  { name: 'sell_burnFee', label: '销毁税率', type: 'number', defaultValue: 1, addonAfter: '%' },
  { name: 'sellReflectFee', label: '回流税率', type: 'number', defaultValue: 1, addonAfter: '%' },
  { name: 'sellLPFee', label: '分红税率', type: 'number', defaultValue: 1, addonAfter: '%' },
  // 路由 & 底池
  { name: 'router', label: '合约路由地址', type: 'text', defaultValue: '0x10ED43C718714eb63d5aA57B78B54704E256024E', required: true, group: '链上参数' },
  { name: 'currency', label: '底池代币地址', type: 'text', required: true },
];

// 链上参考地址(给用户复制)
const chainRefs = (
  <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, marginBottom: 12, fontSize: 12, lineHeight: 1.8 }}>
    <div><b>Sepolia:</b> UniswapV2 Router <code>0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008</code> · USDT <code>0x7169D38820dfd117C3FA1f22a697dBA58d90BA06</code></div>
    <div><b>BSC:</b> PancakeRouter <code>0x10ED43C718714eb63d5aA57B78B54704E256024E</code> · BNB <code>0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c</code> · USDT <code>0x55d398326f99059fF775485246999027B3197955</code></div>
    <div><b>ETH:</b> UniswapRouter <code>0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D</code> · WETH <code>0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2</code> · USDT <code>0xdAC17F958D2ee523a2206206994597C13D831ec7</code></div>
  </div>
);

const buildArgs = (v, account) => [
  [v.tokenName, v.symbolName],
  ['0x0000000000000000000000000000000000000000', v.currency, v.router, account],
  [
    Number(v.precision),
    Number(v.total),
    num(v.buyFundFee), num(v.buyLPFee), num(v.buyReflectFee), num(v.buy_burnFee),
    num(v.sellFundFee), num(v.sellLPFee), num(v.sellReflectFee), num(v.sell_burnFee),
    0,
  ],
  [false],
];

export default function Erc20claim() {
  return (
    <div>
      {chainRefs}
      <DeployForm
        abiKey="divident"
        fields={fields}
        buildArgs={buildArgs}
        submitText="创建分红本币"
        typeLabel="分红本币"
      />
    </div>
  );
}
