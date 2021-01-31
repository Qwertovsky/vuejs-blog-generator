import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import OutLink from "@/components/OutLink.vue";

const app = createApp(App);

app.component("OutLink", OutLink);
app.use(router);
app.mount("#app");

window.addEventListener("load", () => {
  if (window.__PRERENDER_INJECTED && window.__PRERENDER_INJECTED.prerendered) {
    document.getElementById("spaScripts").remove();
    Array.from(document.getElementsByTagName("script"))
    .filter((s) => s.src.indexOf("chunk") >= 0)
    .forEach((s) => s.remove());
  }
});
