<template lang="pug">
  div
    h2 哔哩哔哩 - ( ゜- ゜)つロ 乾杯~
    bilivideo(params="aid=55262905&cid=96632339&page=1")
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
    const markdown = await $content("msxzt/19-kbosu").fetch();
    return {
      markdown
    };
  },
  head() {
    return {
      title: "osu!触摸ZX键盘_暮光小猿没事瞎折腾系列第19期_暮光小猿wzt"
    };
  },
  meta: {
    title: "osu!触摸ZX键盘"
  },
  components: {
    Bilivideo
  }
});
</script>

<style lang="scss" scoped>
@import url(@/assets/content-custom.scss);
</style>