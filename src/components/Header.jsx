import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Flex } from "antd";
import "../main.css";

const boxStyle = {
  width: '100%',
  background: '#fff',
  borderBottom: '1px solid #f0f0f0',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
};

// 跟 favicon.svg 视觉一致: 渐变蓝紫底 + 堆叠合约 + 闪电
function Logo() {
  return (
    <svg
      className="logo"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      role="img"
      aria-label="Deploy DApp logo"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1677ff" />
          <stop offset="100%" stopColor="#722ed1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#logoGrad)" />
      <rect x="8" y="20" width="14" height="3" rx="0.75" fill="#ffffff" opacity="0.55" />
      <rect x="8" y="16" width="14" height="3" rx="0.75" fill="#ffffff" opacity="0.75" />
      <rect x="8" y="12" width="14" height="3" rx="0.75" fill="#ffffff" />
      <path
        d="M19 6 L13 17 H17 L15 24 L23 13 H19 Z"
        fill="#ffd666"
        stroke="#fff"
        strokeWidth="0.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Header() {
  return (
    <Flex justify="space-between" align="center" style={boxStyle}>
      <Flex align="center" gap={10}>
        <Logo />
        <span style={{ fontSize: 18, fontWeight: 600, color: '#000' }}>
          Deploy DApp
        </span>
      </Flex>
      <ConnectButton />
    </Flex>
  );
}

export default Header;
