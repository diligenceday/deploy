import DeployForm from './DeployForm.jsx';

const fields = [
  { name: 'tokenfee', label: 'token fee 代币入会费用', type: 'text', defaultValue: '100000000000', addonAfter: 'wei', required: true },
];

// 对应原 args: [tokenfee]
const buildArgs = (v) => [v.tokenfee];

export default function Dao() {
  return (
    <DeployForm
      abiKey="BaseDao"
      fields={fields}
      buildArgs={buildArgs}
      submitText="创建 Dao 治理代币"
      typeLabel="DAO 治理"
    />
  );
}
