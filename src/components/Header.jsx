import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Flex } from "antd";
import "../main.css";

const boxStyle = {
  width: '100%'
};

// 自带 inline SVG logo,避免外网依赖
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
      <rect x="2" y="2" width="28" height="28" rx="6" fill="#1677ff" />
      <path
        d="M10 16 L14 20 L22 12"
        stroke="#fff"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Header() {
  return (
    <Flex justify="space-between" align="center" style={boxStyle}>
      <Flex align="center" gap="middle">
        <Logo />
        <span style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>
          Deploy DApp
        </span>
      </Flex>
      <ConnectButton />
    </Flex>
  );
}

export default Header;
