<template lang="pug">
  div
    h2 哔哩哔哩 - ( ゜- ゜)つロ 乾杯~
    bilivideo(params="aid=77242205&cid=132123750&page=1")
    md-divider
    nuxt-content(:document="markdown")
</template>

<script lang="ts">
import Vue from "vue";
import Bilivideo from "@/components/bilivideo.vue";
export default Vue.extend({
  data() {
    return {};
  },
  async asyncData({ $content }) {
    const markdown = await $content("linuxdev/06-misc-device").fetch();
    return {
      markdown
    };
  },
  head() {
    return {
      title: "编写杂项设备驱动_暮光小猿wzt"
    };
  },
  meta: {
    title: "编写杂项设备驱动"
  },
  components: {
    Bilivideo
  }
});
</script>

<style lang="scss" scoped>
@import url(@/assets/content-custom.scss);
</style>