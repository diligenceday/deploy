# Deploy DApp

Web3 合约部署工具集 — 无需编程,网页上即可在多链上部署常见代币与流动性合约。

## 在线预览

🔗 **https://diligenceday.github.io/deploy/**

打开后连接钱包(Ethereum / BNB Chain / Polygon / Arbitrum / Optimism / Base / Sepolia)即可使用。

## 功能列表

### 合约部署(6 个)

| 工具 | 合约 | 用途 |
|---|---|---|
| 标准代币 | ERC20 | 部署标准 ERC20 代币 |
| 分红本币 | dividentToken | 部署持币分红奖励合约 |
| 闪贷代币 | ERC20FlashMint | 部署支持闪贷的代币 |
| DAO 治理 | BaseDao | 部署链上治理合约 |
| 黑洞燃烧 | BlackHole | 部署代币销毁机制 |
| LP Token 合约 | LP token | 部署流动性提供者代币 |

### 辅助工具(2 个)

| 工具 | 用途 |
|---|---|
| 批量转账 | 单笔交易向多地址发送代币(空投) |
| LP 锁仓 | 锁定 LP token,防跑路(3 步:部署 Locker → Approve → Deposit) |

## 技术栈

- **React** 18 + **Vite** 5
- **wagmi** 2.x + **viem** 2.x + **RainbowKit** 2.x
- **antd** 5
- **React Router** 6
- **Solidity** 0.8.20

## 本地运行

```bash
git clone https://github.com/diligenceday/deploy.git
cd deploy
npm install
npm run dev
```

默认 `http://localhost:5173/deploy/`

## 构建部署

```bash
npm run build
```

产物输出到 `build/`,可直接部署到 GitHub Pages / Vercel / Netlify 等静态托管。

GitHub Actions 配置见 `.github/workflows/static.yml`,push 到 main 分支自动部署到 GitHub Pages。

## 合约源码

所有合约源码在 `src/contract/`,可直接 Remix 编译后替换 `src/cfg.js` 里的 abi/bytecode。

| 合约文件 | 编译版本 |
|---|---|
| `erc20.sol` | ^0.8.18 |
| `dividentToken.sol` | ^0.8.18 |
| `ERC20FlashMint.sol` | ^0.8.18 |
| `BaseDao.sol` | ^0.8.18 |
| `LPTokenLocker.sol` | ^0.8.20 (需 OpenZeppelin) |
| `allToken.sol` | ^0.8.18 |

## 注意事项

- 部署合约需要支付链上 Gas 费,本工具不收取额外费用
- 合约一旦部署即不可更改,参数请仔细核对
- 部署历史仅保存在本地浏览器(localStorage),不会上传服务器
- LP 锁仓的 LPTokenLocker 合约部署后,需手动 Approve LP token 再调 deposit()

## 反馈

GitHub: https://github.com/diligenceday/deploy
