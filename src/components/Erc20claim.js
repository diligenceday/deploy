import { Form,Input,InputNumber ,Button,Anchor} from "antd";
import React, { useState } from 'react';
import { getWalletClient,getConnections } from '@wagmi/core'
import { Modal ,List, Flex} from "antd";
import {config} from "../wagmiconf.js";
import {cfg} from "../cfg.js";
import { getAccount } from '@wagmi/core'
import { deployContract } from '@wagmi/core'
import { getTransaction,getTransactionReceipt } from '@wagmi/core'


console.log("done");

function Erc20claim() {

	const [tokenName, setTokenName] = useState("");
	const [symbolName, setSymbolName] = useState("");
	const [total,setTotal]=useState(2000000);
	const [precision,setPrecision]=useState(18);
	const account = getAccount(config);
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

////////////////////////////////////////////////////////////
	const [buyFundFee,setBuyFundFee]=useState(0.01);
	const changeBuyFundFee = function(val){
		setBuyFundFee(val)
	}

	const [buy_burnFee,setBuy_burnFee]=useState(0.01);
	const changeBuy_burnFee = function(val){
		setBuy_burnFee(val)
	}

	const [buyReflectFee,setBuyReflectFee]=useState(0.01);
	const changeBuyReflectFee = function(val){
		setBuyReflectFee(val)
	}

	const [buyLPFee,setBuyLPFee]=useState(0.01);
	const changeBuyLPFee = function(val){
		setBuyLPFee(val)
	}
	////////////////////////////////////////////////////////////

	//num7 sell _sellFundFee
	//num10 sell sell_burnFee
	//num9 sell _sellReflectFee
	//num8 sell _sellLPFee


	const [sellFundFee,setSellFundFee]=useState(0.01);
	const changeSellFundFee = function(val){
		setSellFundFee(val)
	}

	const [sell_burnFee,setSell_burnFee]=useState(0.01);
	const changeSell_burnFee = function(val){
		setSell_burnFee(val)
	}

	const [sellReflectFee,setSellReflectFee]=useState(0.01);
	const changeSellReflectFee = function(val){
		setSellReflectFee(val)
	}

	const [sellLPFee,setSellLPFee]=useState(0.01);
	const changeSellLPFee = function(val){
		setSellLPFee(val)
	}

	////////////////////////////////////////////////////////////
	const [router,setRouter] = useState("0x10ED43C718714eb63d5aA57B78B54704E256024E");
	const changeRouter = function(e){
		setRouter(e.target.value);
	}

	const [currency,setCurrency] = useState("")
	const changeCurrency = function(e){
		setCurrency(e.target.value);
	}

	const createToken = async function(){
		const args = [
				[tokenName,symbolName],[
					"0x0000000000000000000000000000000000000000",
					currency,
					router,
					account.address
				],
				[
					precision,
					total,

					Math.floor(100 * Number(buyFundFee)) ,
					Math.floor(100 * Number(buyLPFee))  ,
					Math.floor(100 * Number(buyReflectFee))  ,
					Math.floor(100 * Number(buy_burnFee))  ,

					Math.floor(100 * Number(sellFundFee))  ,
					Math.floor(100 * Number(sellLPFee))  ,
					Math.floor(100 * Number(sellReflectFee))  ,
					Math.floor(100 * Number(sell_burnFee))  ,

					0
				],
				[false]
			];
		console.log(args);
		const _result = await deployContract(config, {
			abi:cfg.divident.abi,
			account:account.address,
			args: args,
			bytecode: cfg.divident.bytecodes,
		});


		console.log(_result)
		setResult(_result);
		setModalCotent(`
			<div>交易哈希hash:${_result}</div>
		`);
		showModal();

	}
	const getDevideContractAddr = async function(){

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
			<Form  name="basic2">
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
				      label="symbol name"
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
				      onChange={changeTotal}
				      name="total"
				      rules={[
				        {
				          required: true,
				          message: 'Please input total!',
				        },
				      ]}>
				      <InputNumber  defaultValue={total}/>
				    </Form.Item>

					<Form.Item label="代币精度"
					  name="precision"
					  onChange={changePrecision}
				      rules={[
				        {
				          required: true,
				          message: '!',
				        }
				      ]}>
						<InputNumber defaultValue={precision}/>
					</Form.Item>

					<Anchor>买入税率：</Anchor>
					<Form.Item label="营销税率">
						<InputNumber  onChange={changeBuyFundFee} addonAfter="%" defaultValue={sellFundFee} />
					</Form.Item>

					<Form.Item label="销毁税率">
						<InputNumber onChange={changeBuy_burnFee} addonAfter="%" defaultValue={buy_burnFee} />
					</Form.Item>

					<Form.Item label="回流税率">
						<InputNumber onChange={changeBuyReflectFee} addonAfter="%" defaultValue={buyReflectFee} />
					</Form.Item>

					<Form.Item label="分红税率">
						<InputNumber onChange={changeBuyLPFee} addonAfter="%" defaultValue={buyLPFee} />
					</Form.Item>


					<Anchor>卖出税率：</Anchor>
					<Form.Item label="营销税率">
						<InputNumber onChange={changeSellFundFee} addonAfter="%" defaultValue={buyFundFee} />
					</Form.Item>

					<Form.Item label="销毁税率">
						<InputNumber onChange={changeSell_burnFee} addonAfter="%" defaultValue={sell_burnFee} />
					</Form.Item>

					<Form.Item label="回流税率">
						<InputNumber onChange={changeSellReflectFee} addonAfter="%" defaultValue={sellReflectFee} />
					</Form.Item>

					<Form.Item label="分红税率">
						<InputNumber onChange={changeSellLPFee} addonAfter="%" defaultValue={sellLPFee} />
					</Form.Item>


				    <Form.Item
				      label="合约路由地址"
				      name="router"
				      rules={[
				        {
				          required: true,
				          message: 'Please input router!',
				        },
				      ]}>
				      <Input onChange={changeRouter}  defaultValue={router} />
				    </Form.Item>

				    <div>
				    	sepolia链上uniswapV2 router: 0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008

				    	USDT:0x7169D38820dfd117C3FA1f22a697dBA58d90BA06
				    </div>
				    <div>
				    	BSC链上pancakeRouter: 0x10ED43C718714eb63d5aA57B78B54704E256024E

				    	pancakeRouter 对应的的代币地址：
				    	BNB: 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c
				    	USDT: 0x55d398326f99059fF775485246999027B3197955
				    	WETH: 0x2170Ed0880ac9A755fd29B2688956BD959F933F8
				    	BUSD: 0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56
				    </div>
				    <div>
				    	ETH主网uniswapRouter: 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D

				    	wETH：0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
						USDT：0xdAC17F958D2ee523a2206206994597C13D831ec7
				    </div>
				    <Form.Item
				      label="底池代币地址"
				      name="TokenB"
				      rules={[
				        {
				          required: true,
				          message: 'Please input Token!',
				        },
				      ]}>
				      <Input onChange={changeCurrency}  defaultValue={currency} />
				    </Form.Item>



			    <Flex justify="space-evenly" >
			    	<div>
			    		<Button type="primary" onClick={createToken}>创建合约代币</Button>
			    	</div>
			    	<div>
			    		<Button type="primary" onClick={getDevideContractAddr}>获取合约地址</Button>
			    	</div>
			    </Flex>


				
			</Form>


			<Modal title="代币信息" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
				<div dangerouslySetInnerHTML={{ __html: modalCotent }} />
			</Modal>
		</div>
	)
}

export default Erc20claim