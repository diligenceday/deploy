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

function Dao() {
	// const connections = getConnections(config)
	// const walletClient = getWalletClient(config)
	const account = getAccount(config);
	const [tokenfee, setTokenfee] = useState("");
	const [result,setResult] = useState("");
	const changeTokenfee = function(el){
		setResult(el.target.value)
	}

	const createDao = async function(){
		
		const _result = await deployContract(config, {
			abi:cfg.BaseDao.abi,
			account:account.address,
			args: [tokenfee],
			bytecode: cfg.BaseDao.bytecodes,
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
	const getDaoAddr = async function(){

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
				      label="token fee 代币入会费用"
				      name="tokenfee"
				      onChange={changeTokenfee}
				      rules={[
				        {
				          required: true,
				          message: 'Please input token fee!',
				        },
				      ]}>
				      <Input addonAfter="wei" defaultValue="100000000000"/>
				    </Form.Item>



			    <Flex justify="space-evenly" >
			    	<div>
			    		<Button type="primary" onClick={createDao}>创建Dao合约</Button>
			    	</div>
			    	<div>
			    		<Button type="primary" onClick={getDaoAddr}>获取合约地址</Button>
			    	</div>
			    </Flex>
			</Form>

			<Modal title="代币信息" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
				<div dangerouslySetInnerHTML={{ __html: modalCotent }} />
			</Modal>
		</div>
	)
}

export default Dao