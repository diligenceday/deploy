import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from "react-router-dom";
import '@rainbow-me/rainbowkit/styles.css';
import {
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import {config} from "./wagmiconf.js";


const queryClient = new QueryClient();


// Vite 用 import.meta.env.BASE_URL,等价于 CRA 的 process.env.PUBLIC_URL
// 在 gh-pages = "/deploy/", 本地 dev = "/"
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

  <React.StrictMode>
  <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <BrowserRouter basename={basename || '/'}>
              <App />
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>

);

// Vite 不需要 reportWebVitals (CRA 特性)
