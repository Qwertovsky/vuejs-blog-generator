<template>
  <div id="pageHeader">
    <router-link to="/" class="qb_brand">Blog</router-link>
    <div></div>
    <router-link tabindex="0" to="/tag">
      Tags
    </router-link>
    <router-link tabindex="0" to="/about">
      About
    </router-link>
  </div>
</template>

<script lang="ts">
import { RouterLink } from 'vue-router';
export default {
};
</script>

