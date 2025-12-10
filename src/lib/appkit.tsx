import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { mainnet, base, solana } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/types'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'

// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get projectId from https://dashboard.reown.com
const projectId = import.meta.env.VITE_PROJECT_ID

// 2. Create a metadata object - optional
const metadata = {
  name: 'Based Puzzles',
  description: 'Daily crossword and sudoku puzzles on Base',
  url: 'https://basedpuzzles.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// 3. Set the networks
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, base, solana]

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
  connectors: [farcasterMiniApp()]
})

// 5. Create Solana adapter
const solanaAdapter = new SolanaAdapter()

// 6. Create modal
createAppKit({
  adapters: [wagmiAdapter, solanaAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

// 7. Create AppKitProvider component
export function AppKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}