<template lang="pug">
  div
    h2 哔哩哔哩 - ( ゜- ゜)つロ 乾杯~
    bilivideo(params="aid=61051593&cid=106218340&page=1")
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
    const markdown = await $content("msxzt/21-midi").fetch();
    return {
      markdown
    };
  },
  head() {
    return {
      title: "单片机MIDI文件播放_暮光小猿没事瞎折腾系列第21期_暮光小猿wzt"
    };
  },
  meta: {
    title: "单片机MIDI文件播放"
  },
  components: {
    Bilivideo
  }
});
</script>

<style lang="scss" scoped>
@import url(@/assets/content-custom.scss);
</style>