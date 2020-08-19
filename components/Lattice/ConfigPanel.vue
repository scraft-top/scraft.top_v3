<template lang="pug">
div
  .options
    md-radio(v-model="_config.mode", value="text") 文字模式
    br
    md-radio(v-model="_config.mode", value="image", disabled) 图片模式(TODO)
    br
    md-radio.md-primary(v-model="_config.mode", value="textImage") 文字图片模式
    br
    md-checkbox(v-model="_config.bitOrder") 反转位序
    br
    md-checkbox.md-primary(v-model="_config.byteOrder") 反转字节序
    br
    md-checkbox(v-model="_config.revertColor") 反转颜色
    br
    md-checkbox.md-primary(v-model="_config.columnDirection") 纵向扫描
  demo.demo(:config="config")
</template>

<script lang="ts">
import Vue from "vue";
import Demo from "./Demo.vue";
export default Vue.extend({
  name: "ConfigPanel",
  data() {
    return {};
  },
  components: {
    Demo,
  },
  props: ["config"],
  computed: {
    _config: {
      get(): LatticeGen.LatticeConfig {
        return this.config;
      },
      set(val: LatticeGen.LatticeConfig) {
        this.$emit("update:config", val);
      },
    },
  },
});
</script>

<style lang="scss" scoped>
.options {
  float: left;
}
.demo {
  float: right;
}
</style>