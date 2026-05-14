<!-- client/src/components/common/LoadingSpinner.vue -->
<template>
  <div class="loading-spinner" v-if="visible">
    <div class="spinner"></div>
    <p class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({
    visible: { type: Boolean, default: true },
    text: { type: String, default: '加载中...' }
});
</script>

<style scoped>
.loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
}
.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f0f0f0;
    border-top-color: #f5576c;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { margin-top: 12px; color: #909399; font-size: 14px; }
</style>