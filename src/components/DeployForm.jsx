import React, { useState, useMemo } from 'react';
import { Form, Input, InputNumber, Button, Anchor, Modal, Flex, message, Typography } from 'antd';
import { getAccount, deployContract, waitForTransactionReceipt } from '@wagmi/core';
import { getAccount as getAccountWagmi } from '@wagmi/core';
import { config } from '../wagmiconf.js';
import { cfg } from '../cfg.js';
import { addToHistory } from './DeployHistory.jsx';
import DeployHistory from './DeployHistory.jsx';

const { Title } = Typography;

/**
 * DeployForm — 通用合约部署表单
 *
 * 解决问题: Erc20/Erc20claim/Flash/Dao 4 个组件 90% 代码重复
 *
 * props:
 *   abiKey       cfg.js 里的合约 key
 *   fields       Form.Item 字段定义: [{ name, label, type, defaultValue, addonAfter, rules, group }]
 *   buildArgs(values, accountAddress) -> any[]  构造部署 args
 *   submitText   创建按钮文案
 *   typeLabel    历史面板显示的类型 (e.g. '标准代币')
 *   showHistory  是否显示部署历史面板 (默认 true)
 */
function DeployForm({ abiKey, fields, buildArgs, submitText = '创建合约代币', typeLabel, showHistory = true }) {
  const account = getAccountWagmi(config);

  const initialValues = useMemo(() => {
    const o = {};
    fields.forEach(f => { o[f.name] = f.defaultValue ?? ''; });
    return o;
  }, [fields]);
  const [values, setValues] = useState(initialValues);

  const [txHash, setTxHash] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [deploying, setDeploying] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState('');

  const groupedFields = useMemo(() => {
    const groups = [];
    let current = { title: null, fields: [] };
    fields.forEach(f => {
      if (f.group && f.group !== current.title) {
        if (current.fields.length) groups.push(current);
        current = { title: f.group, fields: [f] };
      } else {
        current.fields.push(f);
      }
    });
    if (current.fields.length) groups.push(current);
    return groups;
  }, [fields]);

  const onFieldChange = (name, val) => {
    setValues(v => ({ ...v, [name]: val }));
  };

  const onSubmit = async () => {
    setError('');
    if (!account?.address) {
      message.error('请先连接钱包');
      return;
    }
    for (const f of fields) {
      if (f.required && (values[f.name] === '' || values[f.name] == null)) {
        message.error(`请填写 ${f.label}`);
        return;
      }
    }
    setDeploying(true);
    const hide = message.loading('部署中...', 0);
    try {
      const args = buildArgs(values, account.address);
      const hash = await deployContract(config, {
        abi: cfg[abiKey].abi,
        account: account.address,
        args,
        bytecode: cfg[abiKey].bytecodes,
      });
      setTxHash(hash);
      message.success({ content: '已发送,点击"获取合约地址"等上链', duration: 3 });
    } catch (e) {
      const errMsg = e?.shortMessage || e?.message || String(e);
      setError(errMsg);
      message.error('部署失败: ' + errMsg);
      console.error(e);
    } finally {
      setDeploying(false);
      hide();
    }
  };

  const onPollAddress = async () => {
    if (!txHash) {
      message.warning('请先部署');
      return;
    }
    setPolling(true);
    const hide = message.loading('等待上链...', 0);
    try {
      const receipt = await waitForTransactionReceipt(config, { hash: txHash, timeout: 60_000 });
      const addr = receipt.contractAddress || '(非合约创建交易)';
      setContractAddress(addr);
      setError('');
      // 写入历史 (只在成功拿到合约地址时)
      if (addr !== '(非合约创建交易)') {
        addToHistory({
          type: typeLabel || abiKey,
          name: values.name_ || values.tokenName || '',
          symbol: values.symbol_ || values.symbolName || '',
          contractAddress: addr,
          txHash,
          chainId: account.chainId,
        });
        message.success('已添加到部署历史');
      }
    } catch (e) {
      const errMsg = e?.shortMessage || e?.message || String(e);
      message.error('查询失败: ' + errMsg);
    } finally {
      setPolling(false);
      hide();
    }
  };

  const renderField = (f) => {
    const inputEl = f.type === 'number' ? (
      <InputNumber
        defaultValue={f.defaultValue}
        addonAfter={f.addonAfter}
        style={{ width: '100%' }}
        onChange={(v) => onFieldChange(f.name, v)}
      />
    ) : (
      <Input
        defaultValue={f.defaultValue}
        addonAfter={f.addonAfter}
        onChange={(e) => onFieldChange(f.name, e.target.value)}
      />
    );
    return (
      <Form.Item
        key={f.name}
        label={f.label}
        rules={f.required ? [{ required: true, message: `请填写 ${f.label}` }] : []}
      >
        {inputEl}
      </Form.Item>
    );
  };

  return (
    <>
      <Form layout="vertical">
        {groupedFields.map((g, gi) => (
          <div key={gi}>
            {g.title && <Title level={5} style={{ marginTop: 16, marginBottom: 8, color: '#1677ff' }}>{g.title}</Title>}
            {g.fields.map(renderField)}
          </div>
        ))}

        <Flex justify="space-evenly" style={{ marginTop: 16 }}>
          <Button type="primary" onClick={onSubmit} loading={deploying} disabled={!account?.address}>
            {submitText}
          </Button>
          <Button onClick={onPollAddress} loading={polling} disabled={!txHash}>
            获取合约地址
          </Button>
        </Flex>

        <Modal
          title="部署结果"
          open={Boolean(txHash || error)}
          onOk={() => { setTxHash(''); setContractAddress(''); setError(''); }}
          onCancel={() => { setTxHash(''); setContractAddress(''); setError(''); }}
          okText="关闭"
          cancelButtonProps={{ style: { display: 'none' } }}
        >
          {txHash && <div><b>交易哈希:</b><br /><span style={{ wordBreak: 'break-all' }}>{txHash}</span></div>}
          {contractAddress && (
            <div style={{ marginTop: 12 }}>
              <b>合约地址:</b><br />
              <span style={{ wordBreak: 'break-all' }}>{contractAddress}</span>
            </div>
          )}
          {error && <div style={{ color: '#cf1322' }}><b>错误:</b> {error}</div>}
        </Modal>
      </Form>

      {showHistory && <DeployHistory />}
    </>
  );
}

export default DeployForm;
