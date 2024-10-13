import logo from './logo.svg';
import './App.css';
import Header from "./components/Header";
import Footer from "./components/Footer";
import Dao from "./components/Dao";
import Other from "./components/Other";

import Erc20 from "./components/Erc20"
import Erc20claim from "./components/Erc20claim"
import Flash from "./components/Flash"
import { Routes, Route } from "react-router-dom";
import { Link } from "react-router-dom";
import { Menu } from "antd";
import { Grid } from "antd";
import { Col, Row ,Button,Anchor,Radio} from 'antd';


function App() {
  return (
    <div className="App">
      <Header></Header>
		<div>
	      	<div class="align-left">
		      	<Radio.Group  defaultValue="a">
					<Link to="/erc20">
					<Radio.Button value="a" >
						标准代币
					</Radio.Button>
					</Link>

					<Link to="/erc20claim">
					<Radio.Button value="b">
						分红本币
					</Radio.Button>
					</Link>


			        <Link to="/flash">
					<Radio.Button value="c">
						闪电贷代币
					</Radio.Button>
					</Link>
			        
			        <Link to="/dao">
					<Radio.Button value="d">
						Dao投票治理代币
					</Radio.Button>
					</Link>
			        
			        <Link to="/other">
					<Radio.Button value="d">
						LP代币
					</Radio.Button>
					</Link>
			        
				</Radio.Group>
	      	</div>
			<div class="h20"></div>
			<Routes>
				<Route path="/erc20" element={<Erc20 />} />
				<Route path="/erc20claim" element={<Erc20claim />} />
				<Route path="/flash" element={<Flash />} />
				<Route path="/dao" element={<Dao />} />
				<Route path="/other" element={<Other />} />
			</Routes>

		</div>
      <Footer>
      </Footer>
    </div>
  );
}

export default App;
