<template>
  <p class="nq-text-s">
    Consensus state:
    <span :class="consensusClass">{{ consensus.toUpperCase() }}</span>
  </p>
</template>

<script setup>
import { computed } from 'vue'
import { nimiqNetwork } from './../stores/network.ts'

const consensus = computed(() => nimiqNetwork.consensus)
const consensusClass = computed(() =>
  consensus.value === 'established' ? 'nq-green' : 'nq-gold'
)
</script>
