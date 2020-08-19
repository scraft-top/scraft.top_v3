<template lang="pug">
.pixel(:class="cl", :style="st")
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  name: "VirtualPixel",
  data() {
    return {};
  },
  props: ["size", "enable"],
  computed: {
    cl(): string[] {
      let ret: string[] = [];
      this.enable && ret.push("enable");
      return ret;
    },
    st() {
      return {
        height: this.size + "px",
        width: this.size + "px",
      };
    },
  },
});
</script>

<style lang="scss" scoped>
$border-color: #aaa;
$pixel-color: #fff;
.pixel {
  border-left: 1px $border-color solid;
  border-top: 1px $border-color solid;
  padding: 0;
  margin: 0;
  float: left;
}
.pixel.right {
  border-right: 1px $border-color solid;
}
.pixel.bottom {
  border-bottom: 1px $border-color solid;
}
.pixel.enable {
  background-color: $pixel-color;
}
</style>