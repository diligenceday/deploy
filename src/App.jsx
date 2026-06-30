import './App.css';
import { useState, useEffect } from 'react';
import Header from "./components/Header.jsx";
import Erc20 from "./components/Erc20.jsx";
import Erc20claim from "./components/Erc20claim.jsx";
import Flash from "./components/Flash.jsx";
import Dao from "./components/Dao.jsx";
import BlackHole from "./components/BlackHole.jsx";
import LpToken from "./components/LpToken.jsx";
import BatchTransfer from "./components/BatchTransfer.jsx";
import LpLocker from "./components/LpLocker.jsx";
import Welcome from "./components/Welcome.jsx";
import Footer from "./components/Footer.jsx";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Drawer, Grid } from "antd";

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const TABS = [
  { key: '/', label: '首页' },
  { key: '/erc20', label: '标准代币' },
  { key: '/erc20claim', label: '分红本币' },
  { key: '/flash', label: '闪贷代币' },
  { key: '/dao', label: 'DAO 治理' },
  { key: '/blackhole', label: '黑洞燃烧' },
  { key: '/lp', label: 'LP Token 合约' },
  { key: '/batch', label: '批量转账' },
  { key: '/lplocker', label: 'LP 锁仓' },
];

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const isMobile = !screens.md; // < 768px 视为小屏
  const [drawerOpen, setDrawerOpen] = useState(false);

  const selectedKey = TABS.find(t => t.key === location.pathname)?.key || '/';

  // 路由切换时自动关闭 drawer(小屏体验)
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const menuNode = (
    <Menu
      mode="inline"
      theme="dark"
      selectedKeys={[selectedKey]}
      style={{ height: '100%', borderRight: 0 }}
      items={TABS.map(t => ({ key: t.key, label: t.label }))}
      onClick={({ key }) => navigate(key)}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header onMenuClick={() => setDrawerOpen(true)} showMenuButton={isMobile} />
      <Layout>
        {isMobile ? (
          <Drawer
            title="菜单"
            placement="left"
            onClose={() => setDrawerOpen(false)}
            open={drawerOpen}
            width={240}
            styles={{ body: { padding: 0, background: '#001529' } }}
            closable={true}
          >
            {menuNode}
          </Drawer>
        ) : (
          <Sider width={200} className="app-sider">
            {menuNode}
          </Sider>
        )}
        <Content className="app-content">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/erc20" element={<Erc20 />} />
            <Route path="/erc20claim" element={<Erc20claim />} />
            <Route path="/flash" element={<Flash />} />
            <Route path="/dao" element={<Dao />} />
            <Route path="/blackhole" element={<BlackHole />} />
            <Route path="/lp" element={<LpToken />} />
            <Route path="/batch" element={<BatchTransfer />} />
            <Route path="/lplocker" element={<LpLocker />} />
          </Routes>
        </Content>
      </Layout>
      <Footer />
    </Layout>
  );
}

export default App;
