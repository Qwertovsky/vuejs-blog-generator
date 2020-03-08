<template>
  <ul id="default-layout" >
    <li v-for="tag in tags" :key="tag.name">
      <router-link class="page-link" :to="tag.path">{{ tag.name }}</router-link>
    </li>
  </ul>
</template>

<script>
export default {
  computed: {
    tags() {
      return JSON.parse(process.env.VUE_APP_TAGS);
    }
  }
}
</script>