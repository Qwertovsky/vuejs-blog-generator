<template>
  <div id="appWrap">
    <TheHeader />
    <section id="centerPart">
      <router-view></router-view>
    </section>
    <TheFooter />
  </div>
</template>

<script lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import TheHeader from '@/components/TheHeader.vue';
import TheFooter from '@/components/TheFooter.vue';
export default {
  components: {
    TheHeader,
    TheFooter
  }
}
</script>
<style lang="scss">
  @import './styles/style.scss';
</style>