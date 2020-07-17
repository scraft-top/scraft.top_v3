<template>
  <div>
    <h2>哔哩哔哩 - ( ゜- ゜)つロ 乾杯~</h2>
    <bilivideo params="aid=68039875&cid=117925674&page=1" />
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
    const markdown = await $content("linuxdev/05-gpio-register").fetch();
    return {
      markdown
    };
  },
  head() {
    return {
      title: "修改寄存器控制GPIO输出_暮光小猿wzt"
    };
  },
  meta: {
    title: "修改寄存器控制GPIO输出"
  }
});
</script>

<style lang="scss" scoped>
@import url(@/assets/content-custom.scss);
</style>