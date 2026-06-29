import DeployForm from './DeployForm.jsx';

const fields = [
  { name: 'tokenName', label: 'token name 代币名称', type: 'text', required: true },
  { name: 'symbolName', label: 'symbol name 代币符号', type: 'text', required: true },
  { name: 'total', label: 'total 代币发行量', type: 'number', defaultValue: 2000000, required: true },
  { name: 'precision', label: '代币精度', type: 'number', defaultValue: 18, required: true },
];

// 对应原 args: [[tokenName,symbolName],[],[precision,total],[]]
const buildArgs = (v) => [
  [v.tokenName, v.symbolName],
  [],
  [Number(v.precision), Number(v.total)],
  [],
];

export default function Erc20() {
  return (
    <DeployForm
      abiKey="erc20"
      fields={fields}
      buildArgs={buildArgs}
      submitText="创建合约代币"
    />
  );
}
