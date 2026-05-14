// client/src/stores/travelStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getSceneries } from '../api/scenic';
import { getFoods } from '../api/food';
import { getUserRecommend } from '../api/recommend';

export const useTravelStore = defineStore('travel', () => {
    const sceneries = ref([]);
    const foods = ref([]);
    const recommendScenery = ref([]);
    const recommendFood = ref([]);
    const loading = ref(false);

    // 加载景区列表
    async function loadSceneries(params = {}) {
        loading.value = true;
        try {
            const res = await getSceneries(params);
            sceneries.value = res.data;
        } catch (e) {
            console.error('加载景区失败', e);
        }
        loading.value = false;
    }

    // 加载美食列表
    async function loadFoods(params = {}) {
        loading.value = true;
        try {
            const res = await getFoods(params);
            foods.value = res.data;
        } catch (e) {
            console.error('加载美食失败', e);
        }
        loading.value = false;
    }

    // 加载个性化推荐
    async function loadRecommend() {
        loading.value = true;
        try {
            const res = await getUserRecommend();
            recommendScenery.value = res.data.scenery || [];
            recommendFood.value = res.data.food || [];
        } catch (e) {
            console.error('加载推荐失败', e);
        }
        loading.value = false;
    }

    return {
        sceneries, foods, recommendScenery, recommendFood, loading,
        loadSceneries, loadFoods, loadRecommend
    };
});