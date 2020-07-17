<template lang="pug">
  div
    h2 哔哩哔哩 - ( ゜- ゜)つロ 乾杯~
    bilivideo(params="aid=78252952&bvid=BV1kJ411i7vi&cid=133896387&page=1")
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
    const markdown = await $content("linuxdev/07-i2c-oled").fetch();
    return {
      markdown
    };
  },
  head() {
    return {
      title: "实现I2C总线的OLED驱动_暮光小猿wzt"
    };
  },
  meta: {
    title: "实现I2C总线的OLED驱动"
  },
  components: {
    Bilivideo
  }
});
</script>

<style lang="scss" scoped>
@import url(@/assets/content-custom.scss);
</style>