import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { StyleProvider } from '@ant-design/cssinjs';
import {ConfigProvider} from "antd";

createRoot(document.getElementById('root')!).render(
  <StyleProvider layer>
      <ConfigProvider>
          <StrictMode>
              <App />
          </StrictMode>,
      </ConfigProvider>
  </StyleProvider>

)
