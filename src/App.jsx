import './App.css';
import Header from "./components/Header.jsx";
import Erc20 from "./components/Erc20.jsx";
import Erc20claim from "./components/Erc20claim.jsx";
import Flash from "./components/Flash.jsx";
import Dao from "./components/Dao.jsx";
import BlackHole from "./components/BlackHole.jsx";
import LpToken from "./components/LpToken.jsx";
import BatchTransfer from "./components/BatchTransfer.jsx";
import AddLiquidity from "./components/AddLiquidity.jsx";
import LpLocker from "./components/LpLocker.jsx";
import OneClickLaunch from "./components/OneClickLaunch.jsx";
import Footer from "./components/Footer.jsx";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu } from "antd";

const { Sider, Content } = Layout;

const TABS = [
  { key: '/oneclick', label: '🚀 一键发币' },
  { key: '/erc20', label: '标准代币' },
  { key: '/erc20claim', label: '分红本币' },
  { key: '/flash', label: '闪贷代币' },
  { key: '/dao', label: 'DAO 治理' },
  { key: '/blackhole', label: '黑洞燃烧' },
  { key: '/lp', label: 'LP 代币' },
  { key: '/batch', label: '批量转账' },
  { key: '/addliquidity', label: '加流动性' },
  { key: '/lplocker', label: 'LP 锁仓' },
];

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = TABS.find(t => t.key === location.pathname)?.key || '/oneclick';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Layout>
        <Sider width={200} className="app-sider">
          <Menu
            mode="inline"
            theme="dark"
            selectedKeys={[selectedKey]}
            style={{ height: '100%' }}
            items={TABS.map(t => ({ key: t.key, label: t.label }))}
            onClick={({ key }) => navigate(key)}
          />
        </Sider>
        <Content className="app-content">
          <Routes>
            <Route path="/" element={<OneClickLaunch />} />
            <Route path="/oneclick" element={<OneClickLaunch />} />
            <Route path="/erc20" element={<Erc20 />} />
            <Route path="/erc20claim" element={<Erc20claim />} />
            <Route path="/flash" element={<Flash />} />
            <Route path="/dao" element={<Dao />} />
            <Route path="/blackhole" element={<BlackHole />} />
            <Route path="/lp" element={<LpToken />} />
            <Route path="/batch" element={<BatchTransfer />} />
            <Route path="/addliquidity" element={<AddLiquidity />} />
            <Route path="/lplocker" element={<LpLocker />} />
          </Routes>
        </Content>
      </Layout>
      <Footer />
    </Layout>
  );
}

export default App;
