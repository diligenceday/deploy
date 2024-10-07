import { Form,Input,InputNumber ,Button} from "antd";

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

function Erc20() {

	return (
		<div>
			<Form {...layout} name="basic">
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
				      <InputNumber defaultValue={21000000}/>
				    </Form.Item>


					<Form.Item  label="代币精度"
					  name="precision"
				      rules={[
				        {
				          required: true,
				          message: '',
				        }
				      ]}>
						<InputNumber defaultValue={18}/>
					</Form.Item>


					    <Button type="primary">创建合约代币</Button>

			</Form>
		</div>
	)
}

export default Erc20