<template>
  <a v-if="outbound" :href="postUrl" target="_blank">
    {{ title }}
    <OutLink />
  </a>
  <router-link v-else-if="postUrl" :to="postUrl" target="_blank">{{ title }}</router-link>
  <span v-else>{{title}}</span>
</template>

<script>
import OutLink from "@/components/OutLink.vue";
export default {
  components: {
    OutLink
  },
  props: {
    text: String,
    outbound: String,
    url: String
  },
  data() {
    return {
      title: this.text,
      postUrl: this.url
    }
  }
}
</script>