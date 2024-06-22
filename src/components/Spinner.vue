<template>
  <div class="spinner">
    <div class="double-bounce1"></div>
    <div class="double-bounce2"></div>
  </div>
  <p class="nq-text-s centered">{{ msg }}</p>
</template>

<script setup>
const props = defineProps({
  loading: {
    type: Boolean,
    default: true,
  },
  msg: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.spinner {
  width: 40px;
  height: 40px;
  position: relative;
  margin: 20px auto;
}
.double-bounce1,
.double-bounce2 {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #888;
  opacity: 0.6;
  position: absolute;
  top: 0;
  left: 0;
  animation: sk-bounce 2s infinite ease-in-out;
}
.double-bounce2 {
  animation-delay: -1s;
}
@keyframes sk-bounce {
  0%,
  100% {
    transform: scale(0);
  }
  50% {
    transform: scale(1);
  }
}
</style>
