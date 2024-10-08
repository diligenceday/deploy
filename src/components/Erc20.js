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
  // labelCol: {
  //   // span: 4,
  // },
  // wrapperCol: {
  //   // span: 4,
  // },
  // maxWidth:{
  // 	// maxWidth:30
  // }
};

function Erc20() {
	// const connections = getConnections(config)
	// const walletClient = getWalletClient(config)
	const account = getAccount(config);
	const [tokenName, setTokenName] = useState("");
	const [symbolName, setSymbolName] = useState("");
	const [total,setTotal]=useState(2000000);
	const [precision,setPrecision]=useState(18);
	const [result,setResult] = useState("");
	const changeTokenName = function(el){
		setTokenName(el.target.value)
	}
	const changeSymbolName = function(el){
		setSymbolName(el.target.value)
	}
	const changeTotal = function(el){
		setTotal(el.target.value);
	}
	const changePrecision = function(el){
		setPrecision(el.target.value);
	}

	const createERC20 = async function(){
		
		const _result = await deployContract(config, {
			abi:cfg.erc20.abi,
			account:account.address,
			args: [[tokenName,symbolName],[],[precision,total],[]],
			bytecode: cfg.erc20.bytecodes,
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
	const getERC20Addr = async function(){

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
				      label="total 代币发行量"
				      name="total"
				      onChange={changeTotal}
				      rules={[
				        {
				          required: true,
				          message: 'Please input total!',
				        },
				      ]}>
				      <InputNumber defaultValue={total}/>
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
			    		<Button type="primary" onClick={createERC20}>创建合约代币</Button>
			    	</div>
			    	<div>
			    		<Button type="primary" onClick={getERC20Addr}>获取合约地址</Button>
			    	</div>
			    </Flex>
			</Form>


			<Modal title="代币信息" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
				<div dangerouslySetInnerHTML={{ __html: modalCotent }} />
			</Modal>
		</div>
	)
}

export default Erc20