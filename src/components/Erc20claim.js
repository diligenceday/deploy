import { Form,Input,InputNumber ,Button,Anchor} from "antd";


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
console.log("done");

function Erc20claim() {

	return (
		<div>
			<Form {...layout} name="basic2">
				    <Form.Item
				      label="token name 代币名称"
				      name="tokenname 代币符号"
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
				      rules={[
				        {
				          required: true,
				          message: 'Please input total!',
				        },
				      ]}>
				      <InputNumber initialValues={21000000}/>
				    </Form.Item>


					<Form.Item label="代币精度"
					  name="precision"
				      rules={[
				        {
				          required: true,
				          message: '!',
				        }
				      ]}>
						<InputNumber initialValues={18}/>
					</Form.Item>
					

					<Anchor>买入税率：</Anchor>
					<Form.Item label="营销税率">
						<InputNumber value="0.01" addonAfter="%" />
					</Form.Item>

					<Form.Item label="销毁税率">
						<InputNumber value="0.01" addonAfter="%" />
					</Form.Item>

					<Form.Item label="回流税率">
						<InputNumber value="0.01" addonAfter="%" />
					</Form.Item>

					<Form.Item label="分红税率">
						<InputNumber value="0.01" addonAfter="%" />
					</Form.Item>


					<Anchor>卖出税率：</Anchor>
					<Form.Item label="营销税率">
						<InputNumber value="0.01" addonAfter="%" />
					</Form.Item>

					<Form.Item label="销毁税率">
						<InputNumber value="0.01" addonAfter="%" />
					</Form.Item>

					<Form.Item label="回流税率">
						<InputNumber value="0.01" addonAfter="%" />
					</Form.Item>

					<Form.Item label="分红税率">
						<InputNumber value="0.01" addonAfter="%" />
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
				      <Input />
				    </Form.Item>


				    <Form.Item
				      label="底池代币地址"
				      name="TokenB"
				      rules={[
				        {
				          required: true,
				          message: 'Please input Token!',
				        },
				      ]}>
				      <Input />
				    </Form.Item>


					<Button type="primary">创建合约代币</Button>

			</Form>
		</div>
	)
}

export default Erc20claim