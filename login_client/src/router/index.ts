import { createWebHashHistory, createRouter } from "vue-router"

const routes = [
    {
        //登录
        path: "/",
        name: "login",
        component: () => import("@/page/login/index.vue")
    },
    {
        //首页
        path: "/home",
        name: "home",
        component: () => import("@/page/home/home.vue")
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router;