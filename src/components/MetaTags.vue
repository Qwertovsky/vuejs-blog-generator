<template>
  <span>
    <span v-for="t of tags" :key="t">
      | <router-link :to="tagUrl(t)">{{t}}</router-link>
    </span>
  </span>
</template>

<script>
export default {
  props: {
    tags: Array
  },
  methods: {
    tagUrl(tag) {
      return "/tag/" + tag;
    }
  }
}
</script>