import Vue from "vue";
import App from "./App.vue";
import router from "./router";

import OutLink from "@/components/OutLink.vue";

Vue.component("OutLink", OutLink);

Vue.config.productionTip = false;

new Vue({
  router,
  render: function (h) { return h(App) }
}).$mount("#app");

window.addEventListener("load", () => {
  if (window.__PRERENDER_INJECTED && window.__PRERENDER_INJECTED.prerendered) {
    document.getElementById("spaScripts").remove();
    Array.from(document.getElementsByTagName("script"))
    .filter((s) => s.src.indexOf("chunk") >= 0)
    .forEach((s) => s.remove());
  }
});
