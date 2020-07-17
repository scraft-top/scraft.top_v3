<template>
  <div>
    <h2>哔哩哔哩 - ( ゜- ゜)つロ 乾杯~</h2>
    <bilivideo
      params="aid=68034068&bvid=BV1MJ411w7Et&cid=117919991&page=1"
    />
    <md-divider />
    <nuxt-content :document="markdown" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  data() {
    return {};
  },
  async asyncData({ $content }) {
    const markdown = await $content("linuxdev/02-first-kernel-module").fetch();
    return {
      markdown
    };
  },
  head() {
    return {
      title: "第一个内核模块_暮光小猿wzt"
    };
  },
  meta: {
    title: "第一个内核模块"
  }
});
</script>

<style lang="scss" scoped>
@import url(@/assets/content-custom.scss);
</style>