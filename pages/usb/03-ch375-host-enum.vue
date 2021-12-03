<template lang="pug">
div
  h2 哔哩哔哩 - ( ゜- ゜)つロ 乾杯~
  bilivideo(params="aid=245924395&bvid=BV1Nv411x72w&cid=275476120&page=1")
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
    const markdown = await $content("usb/03-ch375-host-enum").fetch();
    return {
      markdown
    };
  },
  head() {
    return {
      title: "CH375主机模式设备枚举_暮光小猿带你玩USB_暮光小猿wzt"
    };
  },
  meta: {
    title: "CH375主机模式设备枚举"
  }
});
</script>

<style lang="scss" scoped>
@import url(@/assets/content-custom.scss);
</style>
