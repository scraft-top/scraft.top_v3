<template>
  <div>
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
    const markdown = await $content("03-char-device-driver").fetch();
    return {
      markdown
    };
  },
  head() {
    return {
      title: "编写字符设备驱动程序_暮光小猿wzt"
    };
  },
  meta: {
    title: "编写字符设备驱动程序"
  }
});
</script>

<style lang="scss" scoped>
@import url(@/assets/content-custom.scss);
</style>