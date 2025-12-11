import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import ApexCharts from "vue3-apexcharts";

const app = createApp(App);

app.use(router);
app.use(ApexCharts);
app.component("apexchart", ApexCharts);

app.mount("#app");
