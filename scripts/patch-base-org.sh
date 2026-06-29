#!/bin/bash
# 修补 @base-org/account 的 import attributes 语法
# CRA 5 + babel-preset-react-app 不支持 import ... with { type: 'json' }
# 详见 README
set -e

FILE="node_modules/@base-org/account/dist/core/constants.js"

if [ ! -f "$FILE" ]; then
  echo "⚠️  $FILE 不存在,跳过 (可能版本变了)"
  exit 0
fi

# 已经 patch 过就不动
if grep -q "Patched" "$FILE"; then
  echo "✓ $FILE 已 patch 过"
  exit 0
fi

cat > "$FILE" << 'EOF'
// Patched by scripts/patch-base-org.sh
// 替换了 experimental "import ... with { type: 'json' }" 语法
// 原代码: import pkg from '../../package.json' with { type: 'json' };
export const CB_KEYS_URL = 'https://keys.coinbase.com/connect';
export const CB_WALLET_RPC_URL = 'https://rpc.wallet.coinbase.com';
export const PACKAGE_NAME = '@base-org/account';
export const PACKAGE_VERSION = '2.4.0';
EOF

echo "✓ 已 patch $FILE"
