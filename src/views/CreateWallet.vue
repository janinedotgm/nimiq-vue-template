<template>
  <div class="wrapper">
    <div class="nq-card">
      <div class="nq-card-header content">
        <h1 class="nq-h1">Let's get started!</h1>
        <ConsensusState />
      </div>
      <div class="nq-card-body">
        <Spinner msg="Connecting to network ..." v-if="nimiqNetwork.loading" />
        <button
          v-if="!nimiqNetwork.loading"
          class="nq-button"
          :disabled="nimiqNetwork.consensus !== 'established'"
          @click="createNewWallet"
        >
          Create your wallet
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import {
  nimiqNetwork,
  createWallet,
  setupNimiqNetwork,
} from './../stores/network.ts'
import Spinner from './../components/Spinner.vue'
import ConsensusState from './../components/ConsensusState.vue'

const router = useRouter()

async function createNewWallet() {
  await createWallet()
  router.push({ name: 'Receive' })
}

onMounted(async () => {
  await setupNimiqNetwork()
})
</script>
