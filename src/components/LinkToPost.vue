<template>
  <a v-if="outbound" :href="url">
    {{ text }}
    <OutLink />
  </a>
  <router-link v-else-if="url" :to="url">{{ text }}</router-link>
  <span v-else>{{text}}</span>
</template>

<script setup lang="ts">
  import OutLink from "@/components/OutLink.vue";
  
  const props = defineProps({
    text: String,
    outbound: {
      type: Boolean,
      required: false
    },
    url: String
  });
  
</script>