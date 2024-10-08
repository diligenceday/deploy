import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Flex } from "antd";
import "../main.css";

const boxStyle = {
  width: '100%'
};

function Header(){
	return (
		    <Flex justify="space-between" style={boxStyle}>
		    	<div>
		    		<img class="logo" src="https://etherscan.io/assets/svg/logos/logo-etherscan.svg?v=0.0.5" />
		    	</div>
		    	<div>
		    		<ConnectButton />
		    	</div>
		    </Flex>
	)
}
export default Header;
