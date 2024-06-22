<template>
  <div class="wrapper">
    <div class="nq-card content">
      <div class="nq-card-header">
        <h1 class="nq-h1">Wallet created!</h1>
        <ConsensusState />
      </div>
      <div class="nq-card-body">
        <p class="centered">
          Your wallet is created and ready to receive funds.
        </p>
        <div class="info">
          <p>
            <strong>Wallet address: </strong>
            <span class="code">{{ nimiqNetwork.address }}</span>
          </p>
          <p><strong>Balance:</strong> {{ nimiqNetwork.balance }} NIM</p>
        </div>
        <div v-if="!nimiqNetwork.readyToReceive && !nimiqNetwork.loading">
          <p class="centered nq-orange">
            Faucet unavailable. Please try again later.
          </p>
        </div>
        <Spinner v-if="nimiqNetwork.loading" />
        <p v-if="nimiqNetwork.faucetResponse != ''" class="nq-gold centered">
          {{ nimiqNetwork.faucetResponse }}
        </p>
        <button
          :disabled="!nimiqNetwork.readyToReceive || nimiqNetwork.loading"
          class="nq-button"
          @click="claimFunds"
        >
          Receive Funds
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import {
  nimiqNetwork,
  receiveFunds,
  faucetAvailable,
  setupNimiqNetwork,
} from '../stores/network.ts'
import Spinner from './../components/Spinner.vue'
import ConsensusState from '../components/ConsensusState.vue'

async function initialize() {
  nimiqNetwork.loading = true // activate spinner
  await setupNimiqNetwork()
}

async function claimFunds() {
  await faucetAvailable() // check if faucet is available before requesting NIM

  if (nimiqNetwork.readyToReceive) {
    await receiveFunds() // request test NIM
  }
}

onMounted(() => {
  // connect to network if not already connected
  if (nimiqNetwork.consensus !== 'established') {
    initialize()
  }
})
</script>
