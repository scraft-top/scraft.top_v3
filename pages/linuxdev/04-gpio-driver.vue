<template>
  <div>
    <h2>哔哩哔哩 - ( ゜- ゜)つロ 乾杯~</h2>
    <bilivideo params="aid=68036252&cid=117920826&page=1" />
    <md-divider />
    <nuxt-content :document="markdown" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  data() {
    return {
      showPL10: false
    };
  },
  async asyncData({ $content }) {
    const markdown = await $content("04-gpio-driver").fetch();
    return {
      markdown
    };
  },
  head() {
    return {
      title: "内核控制GPIO输出_暮光小猿wzt"
    };
  },
  meta: {
    title: "内核控制GPIO输出"
  },
  methods: {}
});
</script>

<style lang="scss" scoped>
@import url(@/assets/content-custom.scss);
</style>