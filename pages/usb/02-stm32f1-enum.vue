<template lang="pug">
div
  h2 哔哩哔哩 - ( ゜- ゜)つロ 乾杯~
  bilivideo(params="aid=628291794&bvid=BV1St4y1k7zR&cid=270912032&page=1")
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
    const markdown = await $content("usb/02-stm32f1-enum").fetch();
    return {
      markdown
    };
  },
  head() {
    return {
      title: "STM32F1设备枚举_暮光小猿带你玩USB_暮光小猿wzt"
    };
  },
  meta: {
    title: "STM32F1设备枚举"
  }
});
</script>

<style lang="scss" scoped>
@import url(@/assets/content-custom.scss);
</style>
