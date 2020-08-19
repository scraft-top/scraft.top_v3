<template lang="pug">
.demo
  .line(v-for="y of 16", :key="y")
    .item(:class="cl"): code {{config.bitOrder ? "MSB" : "LSB"}}  -  data[{{`0${(y-1)*2}`.slice(-2)}}]  -  {{config.bitOrder ? "LSB" : "MSB"}}
    .item(:class="cl"): code {{config.bitOrder ? "MSB" : "LSB"}}  -  data[{{`0${(y-1)*2+1}`.slice(-2)}}]  -  {{config.bitOrder ? "LSB" : "MSB"}}
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  name: "RowDirection",
  data() {
    return {};
  },
  props: ["config"],
  computed: {
    cl(): string[] {
      let ret: string[] = [];
      ret.push(this.config.byteOrder ? "float-right" : "float-left");
      return ret;
    },
  },
});
</script>

<style lang="scss" scoped>
.demo {
  border-right: 1px solid black;
  border-bottom: 1px solid black;
  .item {
    border-left: 1px solid black;
    border-top: 1px solid black;
    code {
      margin: 0 8px;
    }
  }
  .float-left {
    float: left;
  }
  .float-right {
    float: right;
  }
}
</style>