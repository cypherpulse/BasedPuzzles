import { useAppKitAccount } from '@reown/appkit/react'

export function useWalletAddress() {
  const { address, isConnected } = useAppKitAccount()
  return { address, isConnected }
}