import { Form,Input,InputNumber ,Button} from "antd";
import { getWalletClient,getConnections } from '@wagmi/core'
import {config} from "../wagmiconf.js";
import {cfg} from "../cfg.js";
import { getAccount } from '@wagmi/core'
import { deployContract } from '@wagmi/core'
import { Message } from "antd";
import { Modal ,List, Flex} from "antd";
import React, { useState } from 'react';
import { getTransaction,getTransactionReceipt } from '@wagmi/core'

const layout = {
  labelCol: {
    // span: 4,
  },
  wrapperCol: {
    // span: 4,
  },
  maxWidth:{
  	// maxWidth:30
  }
};

function Flash() {

  // const connections = getConnections(config)
  // const walletClient = getWalletClient(config)
  const account = getAccount(config);
  const [tokenName, setTokenName] = useState("");
  const [symbolName, setSymbolName] = useState("");
  const [loanfee,setLoanfee]=useState(1);
  const [precision,setPrecision]=useState(18);
  const [result,setResult] = useState("");
  const changeTokenName = function(el){
    setTokenName(el.target.value)
  }
  const changeSymbolName = function(el){
    setSymbolName(el.target.value)
  }
  const changeLoanfee = function(el){
    setLoanfee(el.target.value);
  }
  const changePrecision = function(el){
    setPrecision(el.target.value);
  }

  const createFlash = async function(){
    
    const _result = await deployContract(config, {
      abi:cfg.flashMint.abi,
      account:account.address,
      args: [tokenName,symbolName,precision,loanfee],
      bytecode: cfg.flashMint.bytecodes,
    });
    //.then(function(result){
    //})
    
    // const result = "0xed4513fd105efdea88392bd9f9b4ec7b5925436616881563e1d60ee6c0986d32";
    console.log(_result)
    setResult(_result);
    setModalCotent(`
      <div>交易哈希hash:${_result}</div>
    `);
    // setModalCotent( `<List
   //        <List.Item>
   //          <Typography.Text >11</Typography.Text> 
   //          <Typography.Text >11</Typography.Text> 
   //        </List.Item>
   //      )}
   //    />` )
    showModal();

  }
  const getFlashAddr = async function(){

    const transaction = await getTransactionReceipt(config, {
      hash: result,
    });
    console.log(transaction)
    setModalCotent(`
      <div>交易哈希hash:${result}</div>
      <div>合约地址contract address:${transaction.contractAddress}</div>
    `);
    showModal();
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCotent, setModalCotent] = useState("");

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
    setModalCotent("")
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    setModalCotent("")
  };

	return (

    <div>
      <Form {...layout} name="basic">
            <Form.Item
              label="token name 代币名称"
              name="tokenname 代币符号"
              onChange={changeTokenName}
              rules={[
                {
                  required: true,
                  message: 'Please input tokenname!',
                },
              ]}>
              <Input />
            </Form.Item>

            <Form.Item
              label="symbol name 代币符号"
              name="symbolname"
              onChange={changeSymbolName}
              rules={[
                {
                  required: true,
                  message: 'Please input symbolname!',
                },
              ]}>
              <Input />
            </Form.Item>

            <Form.Item
              label="闪电贷费率 loanfee"
              name="total"
              onChange={changeLoanfee}
              rules={[
                {
                  required: true,
                  message: 'Please input loanfee!',
                },
              ]}>
              <InputNumber defaultValue={loanfee} addonAfter="%%" />
            </Form.Item>

          <Form.Item  label="代币精度"
            name="precision"
              onChange={changePrecision}
              rules={[
                {
                  required: true,
                  message: '',
                }
              ]}>
            <InputNumber defaultValue={precision}/>
          </Form.Item>


          <Flex justify="space-evenly" >
            <div>
              <Button type="primary" onClick={createFlash}>创建合约代币</Button>
            </div>
            <div>
              <Button type="primary" onClick={getFlashAddr}>获取合约地址</Button>
            </div>
          </Flex>
      </Form>


      <Modal title="代币信息" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <div dangerouslySetInnerHTML={{ __html: modalCotent }} />
      </Modal>
    </div>

	)
}

export default Flash

