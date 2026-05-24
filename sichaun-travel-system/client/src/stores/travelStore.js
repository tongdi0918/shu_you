// client/src/stores/travelStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSceneries } from '../api/scenic'
import { getFoods } from '../api/food'
import { getUserRecommend } from '../api/recommend'

export const useTravelStore = defineStore('travel', () => {
  const sceneries = ref([])
  const foods = ref([])
  const recommendScenery = ref([])
  const recommendFood = ref([])
  const loading = ref(false)

  // 成就相关状态
  const visitedSceneries = ref(new Set())
  const visitedFoods = ref(new Set())

  // 加载景区列表
  async function loadSceneries(params = {}) {
    loading.value = true
    try {
      const res = await getSceneries(params)
      sceneries.value = res.data
    } catch (e) {
      console.error('加载景区失败', e)
    }
    loading.value = false
  }

  // 加载美食列表
  async function loadFoods(params = {}) {
    loading.value = true
    try {
      const res = await getFoods(params)
      foods.value = res.data
    } catch (e) {
      console.error('加载美食失败', e)
    }
    loading.value = false
  }

  // 加载个性化推荐
  async function loadRecommend() {
    loading.value = true
    try {
      const res = await getUserRecommend()
      recommendScenery.value = res.data.scenery || []
      recommendFood.value = res.data.food || []
    } catch (e) {
      console.error('加载推荐失败', e)
    }
    loading.value = false
  }

  // 设置成就数据
  function setAchievements(sceneryIds, foodIds) {
    visitedSceneries.value = new Set(sceneryIds || [])
    visitedFoods.value = new Set(foodIds || [])
  }

  // 切换单个成就
  function toggleAchievement(type, itemId) {
    if (type === 'scenery') {
      if (visitedSceneries.value.has(itemId)) {
        visitedSceneries.value.delete(itemId)
      } else {
        visitedSceneries.value.add(itemId)
      }
    } else {
      if (visitedFoods.value.has(itemId)) {
        visitedFoods.value.delete(itemId)
      } else {
        visitedFoods.value.add(itemId)
      }
    }
  }

  return {
    sceneries, foods, recommendScenery, recommendFood, loading,
    visitedSceneries, visitedFoods,
    loadSceneries, loadFoods, loadRecommend,
    setAchievements, toggleAchievement
  }
})