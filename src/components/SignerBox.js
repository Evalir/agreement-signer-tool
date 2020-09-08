import React, { useState } from 'react'
import 'styled-components/macro'
import { useWallet } from 'use-wallet'
import { Box, Button, Field, GU, Info, TextInput } from '@aragon/ui'
import { useSignAgreement } from '../lib/web3-contracts.js'

function getInfoMode(signStatus) {
  if (signStatus === 'error') {
    return 'error'
  }

  return 'info'
}

function getInfoText(signStatus) {
  if (signStatus === 'error') {
    return 'There was an error while signing the agreement.'
  }

  if (signStatus === 'already-signed') {
    return 'You have already signed this agreement.'
  }

  return 'Agreement signed successfuly.'
}

export default function SignerBox() {
  const { account } = useWallet()
  const [agreementAddress, setAgreementAddress] = useState('')
  const [signState, setSignState] = useState('')
  const signAgreement = useSignAgreement(agreementAddress)

  return (
    <Box>
      {!account ? (
        <Info>Please connect your account to get started.</Info>
      ) : (
        <>
          <Field label="Agreement address">
            <TextInput
              value={agreementAddress}
              onChange={e => setAgreementAddress(e.target.value)}
              css={`
                width: 100%;
              `}
            />
          </Field>

          <Button
            label="Sign"
            mode="strong"
            onClick={async () => {
              const signState = await signAgreement()
              setSignState(signState)
            }}
            disabled={!agreementAddress}
          >
            Sign Agreement
          </Button>
          {signState && (
            <Info
              mode={getInfoMode(signState)}
              css={`
                margin-top: ${3 * GU}px;
              `}
            >
              {getInfoText(signState)}
            </Info>
          )}
        </>
      )}
    </Box>
  )
}
