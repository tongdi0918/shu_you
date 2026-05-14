// client/src/stores/userStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { login as apiLogin, register as apiRegister } from '../api/auth';

export const useUserStore = defineStore('user', () => {
    const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));
    const token = ref(localStorage.getItem('token') || '');

    const isLoggedIn = computed(() => !!token.value);
    const isAdmin = computed(() => user.value?.role === 'admin');
    const username = computed(() => user.value?.username || '游客');

    // 登录
    async function login(username, password) {
        try {
            const res = await apiLogin({ username, password });
            token.value = res.data.token;
            user.value = res.data.user;
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            return { success: true };
        } catch (e) {
            return { success: false, msg: e.response?.data?.msg || '登录失败' };
        }
    }

    // 注册
    async function register(username, password, phone) {
        try {
            const res = await apiRegister({ username, password, phone });
            return { success: true, msg: res.msg };
        } catch (e) {
            return { success: false, msg: e.response?.data?.msg || '注册失败' };
        }
    }

    // 登出
    function logout() {
        token.value = '';
        user.value = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    return { user, token, isLoggedIn, isAdmin, username, login, register, logout };
});