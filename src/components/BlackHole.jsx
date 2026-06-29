import DeployForm from './DeployForm.jsx';

const fields = [
  { name: 'name_', label: 'token name 代币名称', type: 'text', required: true },
  { name: 'symbol_', label: 'symbol name 代币符号', type: 'text', required: true },
  { name: 'totalSupply_', label: 'total 代币发行量', type: 'number', defaultValue: 1000000, required: true },
  {
    name: 'burnRate_',
    label: '燃烧税率 burnRate',
    type: 'number',
    defaultValue: 100,
    addonAfter: '/10000 (100=1%)',
    required: true,
  },
];

// 构造器: (name_, symbol_, totalSupply_, burnRate_)
const buildArgs = (v) => [
  v.name_,
  v.symbol_,
  Number(v.totalSupply_),
  Number(v.burnRate_),
];

export default function BlackHole() {
  return (
    <DeployForm
      abiKey="blackHole"
      fields={fields}
      buildArgs={buildArgs}
      submitText="创建黑洞燃烧代币"
    />
  );
}
