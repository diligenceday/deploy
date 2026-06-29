import DeployForm from './DeployForm.jsx';

const fields = [
  { name: 'tokenName', label: 'token name 代币名称', type: 'text', required: true },
  { name: 'symbolName', label: 'symbol name 代币符号', type: 'text', required: true },
  { name: 'loanfee', label: '闪电贷费率 loanfee', type: 'number', defaultValue: 1, addonAfter: '%%', required: true },
  { name: 'precision', label: '代币精度', type: 'number', defaultValue: 18, required: true },
];

// 对应原 args: [tokenName, symbolName, precision, loanfee]
const buildArgs = (v) => [v.tokenName, v.symbolName, Number(v.precision), Number(v.loanfee)];

export default function Flash() {
  return (
    <DeployForm
      abiKey="flashMint"
      fields={fields}
      buildArgs={buildArgs}
      submitText="创建闪电贷代币"
      typeLabel="闪贷代币"
    />
  );
}
