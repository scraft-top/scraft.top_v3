<template lang="pug">
.demo
  .column(v-for="x of 16", :key="x")
    .item(v-if="!config.byteOrder"): code {{config.bitOrder ? "MSB" : "LSB"}} - data[{{`0${(x-1)*2}`.slice(-2)}}] - {{config.bitOrder ? "LSB" : "MSB"}}
    .item: code {{config.bitOrder ? "MSB" : "LSB"}} - data[{{`0${(x-1)*2+1}`.slice(-2)}}] - {{config.bitOrder ? "LSB" : "MSB"}}
    .item(v-if="config.byteOrder"): code {{config.bitOrder ? "MSB" : "LSB"}} - data[{{`0${(x-1)*2}`.slice(-2)}}] - {{config.bitOrder ? "LSB" : "MSB"}}
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  name: "ColumnDirection",
  data() {
    return {};
  },
  props: ["config"],
});
</script>

<style lang="scss" scoped>
.demo {
  border-right: 1px solid black;
  border-bottom: 1px solid black;
  .column {
    float: left;
    .item {
      writing-mode: tb-rl;
      border-left: 1px solid black;
      border-top: 1px solid black;
      code {
        margin: 8px 0;
      }
    }
  }
}
</style>