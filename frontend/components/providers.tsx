'use client';
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { worldchain } from 'wagmi/chains';
const config=getDefaultConfig({appName:'AttendX',projectId:process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID||'demo',chains:[worldchain],ssr:true});
const queryClient=new QueryClient();
export function Providers({children}:{children:React.ReactNode}){return <WagmiProvider config={config}><QueryClientProvider client={queryClient}><RainbowKitProvider>{children}</RainbowKitProvider></QueryClientProvider></WagmiProvider>}
