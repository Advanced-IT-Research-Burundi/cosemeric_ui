<template>
  <div class="github-loader">
    <div class="progress-bar"></div>
  </div>
</template>

<script>
export default {
  name: 'GitHubLoader'
}
</script>

<style scoped>
.github-loader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  height: 3px;
  background-color: transparent;
  pointer-events: none;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(
    90deg, 
    #0366d6 0%, 
    #2188ff 50%, 
    #79b8ff 100%
  );
  box-shadow: 0 0 10px rgba(33, 136, 255, 0.5);
  animation: loading 2s ease-in-out infinite;
  transform-origin: left;
}

@keyframes loading {
  0% {
    width: 0%;
    transform: translateX(0);
  }
  50% {
    width: 70%;
    transform: translateX(0);
  }
  100% {
    width: 100%;
    transform: translateX(100%);
  }
}

/* Animation d'apparition - retiré car plus nécessaire */
</style>