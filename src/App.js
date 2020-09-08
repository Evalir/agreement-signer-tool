import React from 'react'
import { Header, GU } from '@aragon/ui'
import 'styled-components/macro'
import TopHeader from './components/Header/Header'
import SignerBox from './components/SignerBox'

function App() {
  return (
    <>
      <TopHeader />
      <div
        css={`
          margin-top: ${12 * GU}px;
        `}
      >
        <Header primary="Agreement signer" />
        <SignerBox />
      </div>
    </>
  )
}

export default App
