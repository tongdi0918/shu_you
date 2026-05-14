import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'            // 新增
import 'element-plus/dist/index.css'              // 新增
import * as ElementPlusIconsVue from '@element-plus/icons-vue'  // 新增

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)                              // 新增

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')