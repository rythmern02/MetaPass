'use client'


import { useAccount, useDisconnect } from 'wagmi'

export function ConnectWallet() {

  const { isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <button onClick={() => disconnect()} >
        Disconnect Wallet
      </button>
    )
  }

  return (
    <button onClick={() => open()} >
      Connect Wallet
    </button>
  )
}


