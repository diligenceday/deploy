import './App.css';
import Header from "./components/Header";
import Erc20 from "./components/Erc20";
import Erc20claim from "./components/Erc20claim";
import Flash from "./components/Flash";
import Dao from "./components/Dao";
import BlackHole from "./components/BlackHole";
import LpToken from "./components/LpToken";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu } from "antd";

const { Sider, Content } = Layout;

const TABS = [
  { key: '/erc20', label: '标准代币' },
  { key: '/erc20claim', label: '分红本币' },
  { key: '/flash', label: '闪电贷代币' },
  { key: '/dao', label: 'Dao 治理代币' },
  { key: '/blackhole', label: '黑洞燃烧' },
  { key: '/lp', label: 'LP 代币' },
];

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // 当前选中的 menu key(精确匹配路由)
  const selectedKey = TABS.find(t => t.key === location.pathname)?.key || '/erc20';

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
            <Route path="/" element={<Erc20 />} />
            <Route path="/erc20" element={<Erc20 />} />
            <Route path="/erc20claim" element={<Erc20claim />} />
            <Route path="/flash" element={<Flash />} />
            <Route path="/dao" element={<Dao />} />
            <Route path="/blackhole" element={<BlackHole />} />
            <Route path="/lp" element={<LpToken />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
