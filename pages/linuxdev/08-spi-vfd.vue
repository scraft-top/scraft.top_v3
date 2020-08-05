<template lang="pug">
  div
    h2 哔哩哔哩 - ( ゜- ゜)つロ 乾杯~
    bilivideo(params="aid=838701772&bvid=BV1zg4y1v7Qt&cid=206052476&page=1")
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
    const markdown = await $content("linuxdev/08-spi-vfd").fetch();
    return {
      markdown
    };
  },
  head() {
    return {
      title: "实现SPI总线的VFD驱动_暮光小猿wzt"
    };
  },
  meta: {
    title: "实现SPI总线的VFD驱动"
  },
  components: {
    Bilivideo
  }
});
</script>

<style lang="scss" scoped>
@import url(@/assets/content-custom.scss);
</style>