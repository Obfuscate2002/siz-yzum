import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { StyleProvider } from '@ant-design/cssinjs';
import {ConfigProvider} from "antd";
import {BrowserRouter} from "react-router";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
        }
    }
});

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
            <StyleProvider layer>
                <ConfigProvider>
                    <StrictMode>
                        <QueryClientProvider client={queryClient}>
                            <App />
                        </QueryClientProvider>
                    </StrictMode>,
                </ConfigProvider>
            </StyleProvider>
    </BrowserRouter>
)
