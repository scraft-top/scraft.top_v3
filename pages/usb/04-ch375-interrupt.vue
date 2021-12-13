<template lang="pug">
div
  h2 哔哩哔哩 - ( ゜- ゜)つロ 乾杯~
  bilivideo(params="aid=928689888&bvid=BV1TT4y1K7mJ&cid=283023638&page=1")
  md-divider
  nuxt-content(:document="markdown")
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  data() {
    return {};
  },
  async asyncData({ $content }) {
    const markdown = await $content("usb/04-ch375-interrupt").fetch();
    return {
      markdown
    };
  },
  head() {
    return {
      title: "CH372/CH375_USB中断传输_暮光小猿带你玩USB_暮光小猿wzt"
    };
  },
  meta: {
    title: "CH372/CH375_USB中断传输"
  }
});
</script>

<style lang="scss" scoped>
@import url(@/assets/content-custom.scss);
</style>
