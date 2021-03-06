import { useEffect, useCallback, useState, useRef } from 'react'
import { Contract as EthersContract, providers } from 'ethers'
import { useWallet } from 'use-wallet'
import { getKnownContract } from './known-contracts.js'
import { bigNum } from './web3-utils'

export function useContract(address, abi, signer = true) {
  const { ethereum } = useWallet()

  if (!ethereum) {
    return
  }

  const ethersProvider = new providers.Web3Provider(ethereum)

  if (!address || !ethersProvider) {
    return null
  }

  const contract = new EthersContract(
    address,
    abi,
    signer ? ethersProvider.getSigner() : ethersProvider,
  )

  return contract
}

export function useKnownContract(name, signer = true) {
  const [address, abi] = getKnownContract(name)
  return useContract(address, abi, signer)
}

export function useContractWithKnownAbi(name, address) {
  const [, abi] = getKnownContract(name)
  console.log(abi, address, 'agreement')
  return useContract(address, abi, true)
}

export function useTokenBalance(symbol, address = '') {
  const { account } = useWallet()
  const [balance, setBalance] = useState(bigNum(-1))
  const tokenContract = useKnownContract(`TOKEN_${symbol}`)

  const cancelBalanceUpdate = useRef(null)

  const updateBalance = useCallback(() => {
    let cancelled = false

    if (cancelBalanceUpdate.current) {
      cancelBalanceUpdate.current()
      cancelBalanceUpdate.current = null
    }

    if ((!account && !address) || !tokenContract) {
      setBalance(bigNum(-1))
      return
    }

    cancelBalanceUpdate.current = () => {
      cancelled = true
    }
    const requestedAddress = address || account
    tokenContract
      .balanceOf(requestedAddress)
      .then(balance => {
        if (!cancelled) {
          setBalance(balance)
        }
      })
      .catch(err => err)
  }, [account, address, tokenContract])

  useEffect(() => {
    // Always update the balance if updateBalance() has changed
    updateBalance()

    if ((!account && !address) || !tokenContract) {
      return
    }

    const onTransfer = (from, to, value) => {
      if (
        from === account ||
        to === account ||
        from === address ||
        to === address
      ) {
        updateBalance()
      }
    }
    tokenContract.on('Transfer', onTransfer)

    return () => {
      tokenContract.removeListener('Transfer', onTransfer)
    }
  }, [account, address, tokenContract, updateBalance])

  return balance
}

export function useSignAgreement(agreementAddress) {
  const { account } = useWallet()
  const agreement = useContractWithKnownAbi('AGREEMENT', agreementAddress)
  return useCallback(async () => {
    try {
      const { mustSign } = await agreement.getSigner(account)
      if (mustSign) {
        const currentSettingId = await agreement.getCurrentSettingId()
        const tx = await agreement.sign(currentSettingId)
        await tx.wait()
        return 'success'
      } else {
        return 'already-signed'
      }
    } catch (e) {
      console.error(e)
      return 'error'
    }
  }, [account, agreement])
}
