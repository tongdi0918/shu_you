<!-- client/src/components/weather/WarningBadge.vue -->
<template>
  <el-popover
    placement="top"
    :width="280"
    trigger="hover"
    v-if="warning && warning.warning_text"
  >
    <template #reference>
      <span class="warning-badge" :class="getLevelClass()">
        <el-icon><Warning /></el-icon>
        <span>{{ getLevelText() }}</span>
      </span>
    </template>
    <div class="warning-popover">
      <div class="warning-header">
        <el-icon :size="20"><WarningFilled /></el-icon>
        <span>景区预警信息</span>
      </div>
      <div class="warning-detail">
        <div class="detail-item">
          <span class="label">天气：</span>
          <span>{{ warning.weather_type || '未知' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">温度：</span>
          <span>{{ warning.temperature }}°C</span>
        </div>
        <div class="detail-item">
          <span class="label">拥堵等级：</span>
          <el-tag :type="getTagType()" size="small">
            {{ getCongestionText() }}
          </el-tag>
        </div>
        <div class="warning-text">{{ warning.warning_text }}</div>
      </div>
    </div>
  </el-popover>
</template>

<script setup>
import { Warning, WarningFilled } from '@element-plus/icons-vue';

const props = defineProps({ warning: Object });

function getLevelClass() {
    if (!props.warning) return '';
    const level = props.warning.congestion_level;
    if (level === 'high') return 'level-high';
    if (level === 'medium') return 'level-medium';
    return 'level-low';
}

function getLevelText() {
    if (!props.warning) return '';
    const level = props.warning.congestion_level;
    if (level === 'high') return '拥堵预警';
    if (level === 'medium') return '客流中等';
    return '畅通';
}

function getTagType() {
    if (!props.warning) return 'info';
    const level = props.warning.congestion_level;
    if (level === 'high') return 'danger';
    if (level === 'medium') return 'warning';
    return 'success';
}

function getCongestionText() {
    if (!props.warning) return '';
    const level = props.warning.congestion_level;
    if (level === 'high') return '拥堵';
    if (level === 'medium') return '中等';
    return '畅通';
}
</script>

<style scoped>
.warning-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s;
}
.level-high {
    background: #fef0f0;
    color: #f56c6c;
    border: 1px solid #fbc4c4;
}
.level-medium {
    background: #fdf6ec;
    color: #e6a23c;
    border: 1px solid #f5dab1;
}
.level-low {
    background: #f0f9eb;
    color: #67c23a;
    border: 1px solid #c2e7b0;
}
.warning-popover {
    padding: 8px;
}
.warning-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: #e6a23c;
    margin-bottom: 12px;
}
.warning-detail { font-size: 13px; }
.detail-item {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
}
.label { color: #909399; margin-right: 8px; }
.warning-text {
    margin-top: 8px;
    padding: 8px;
    background: #fef0f0;
    border-radius: 6px;
    color: #f56c6c;
    line-height: 1.5;
}
</style>