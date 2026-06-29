import { Card, Row, Col, Typography, Divider, Tag, Empty } from "antd";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import {
  RocketOutlined,
  DollarOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  FireOutlined,
  ExperimentOutlined,
  SwapOutlined,
  LockOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

const DEPLOY_TOOLS = [
  {
    key: "/erc20",
    icon: <RocketOutlined />,
    title: "标准代币",
    desc: "部署标准 ERC20 代币合约",
    color: "#1677ff",
  },
  {
    key: "/erc20claim",
    icon: <DollarOutlined />,
    title: "分红本币",
    desc: "部署持币分红奖励合约",
    color: "#13c2c2",
  },
  {
    key: "/flash",
    icon: <ThunderboltOutlined />,
    title: "闪贷代币",
    desc: "部署支持闪电贷的代币",
    color: "#722ed1",
  },
  {
    key: "/dao",
    icon: <TeamOutlined />,
    title: "DAO 治理",
    desc: "部署链上治理合约",
    color: "#eb2f96",
  },
  {
    key: "/blackhole",
    icon: <FireOutlined />,
    title: "黑洞燃烧",
    desc: "部署代币销毁机制",
    color: "#fa541c",
  },
  {
    key: "/lp",
    icon: <ExperimentOutlined />,
    title: "LP Token 合约",
    desc: "部署流动性提供者代币",
    color: "#52c41a",
  },
];

const UTIL_TOOLS = [
  {
    key: "/batch",
    icon: <SwapOutlined />,
    title: "批量转账",
    desc: "单笔交易向多地址发送代币",
    color: "#1677ff",
  },
  {
    key: "/lplocker",
    icon: <LockOutlined />,
    title: "LP 锁仓",
    desc: "锁定 LP Token 证明锁仓",
    color: "#faad14",
  },
];

export default function Welcome() {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("deployHistory");
      if (raw) setHistory(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}>
      <div style={{ marginBottom: 32, padding: "16px 0" }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Web3 合约部署工具集
        </Title>
        <Paragraph type="secondary" style={{ fontSize: 15, marginBottom: 0 }}>
          无需编写代码，通过浏览器即可在多链上部署常见的代币与流动性合约。
        </Paragraph>
      </div>

      <Divider orientation="left" style={{ marginTop: 0 }}>
        <Text strong>合约部署</Text>
      </Divider>
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {DEPLOY_TOOLS.map((tool) => (
          <Col xs={24} sm={12} md={8} key={tool.key}>
            <Card
              hoverable
              onClick={() => navigate(tool.key)}
              styles={{ body: { padding: 20 } }}
              style={{ borderColor: "#f0f0f0" }}
            >
              <div
                style={{
                  fontSize: 28,
                  color: tool.color,
                  marginBottom: 8,
                }}
              >
                {tool.icon}
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                {tool.title}
              </div>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {tool.desc}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Divider orientation="left">
        <Text strong>辅助工具</Text>
      </Divider>
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {UTIL_TOOLS.map((tool) => (
          <Col xs={24} sm={12} md={8} key={tool.key}>
            <Card
              hoverable
              onClick={() => navigate(tool.key)}
              styles={{ body: { padding: 20 } }}
              style={{ borderColor: "#f0f0f0" }}
            >
              <div
                style={{
                  fontSize: 28,
                  color: tool.color,
                  marginBottom: 8,
                }}
              >
                {tool.icon}
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                {tool.title}
              </div>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {tool.desc}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      {!isConnected && (
        <div
          style={{
            background: "#fafafa",
            border: "1px solid #f0f0f0",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 24,
            fontSize: 13,
            color: "#666",
          }}
        >
          提示：点击右上角"连接钱包"后即可开始部署。
        </div>
      )}

      <Divider orientation="left">
        <Text strong>最近部署</Text>
      </Divider>
      <div style={{ minHeight: 120, marginBottom: 32 }}>
        {history.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无部署记录"
            style={{ padding: "24px 0" }}
          />
        ) : (
          <Row gutter={[12, 12]}>
            {history.slice(0, 6).map((item, idx) => (
              <Col xs={24} sm={12} key={idx}>
                <Card size="small" styles={{ body: { padding: 12 } }}>
                  <div style={{ marginBottom: 4 }}>
                    <Tag color="blue">{item.type || "Deploy"}</Tag>
                    <Text strong>{item.name || "未命名"}</Text>
                  </div>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 12,
                      fontFamily: "monospace",
                      wordBreak: "break-all",
                    }}
                  >
                    {item.address}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      <Divider orientation="left">
        <Text strong>常见问题</Text>
      </Divider>
      <div style={{ marginBottom: 32, fontSize: 14, lineHeight: 1.9 }}>
        <div>
          <Text strong>需要付费吗？</Text> 部署合约需要支付链上 Gas 费，本工具不收取额外费用。
        </div>
        <div>
          <Text strong>支持哪些链？</Text> Ethereum、BNB Chain、Polygon、Arbitrum、Optimism、Base 等 6 条主流 EVM 链。
        </div>
        <div>
          <Text strong>部署后能修改吗？</Text> 合约一旦部署即不可更改，参数请仔细核对。
        </div>
        <div>
          <Text strong>部署历史会保存吗？</Text> 记录仅保存在本地浏览器，不会上传服务器。
        </div>
      </div>
    </div>
  );
}
