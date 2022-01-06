<template lang="pug">
div
  h2 哔哩哔哩 - ( ゜- ゜)つロ 乾杯~
  bilivideo(params="aid=459172180&bvid=BV1f541177Rc&cid=296447022&page=1")
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
    const markdown = await $content("usb/05-ch375-keyboard-mouse").fetch();
    return {
      markdown
    };
  },
  head() {
    return {
      title: "CH372/CH375_键盘鼠标_暮光小猿带你玩USB_暮光小猿wzt"
    };
  },
  meta: {
    title: "CH372/CH375_键盘鼠标"
  }
});
</script>

<style lang="scss" scoped>
@import url(@/assets/content-custom.scss);
</style>
