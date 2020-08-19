<template lang="pug">
vue-scroll(:ops="ops", ref="vs")
  .preview(:style="previewStyle")
    div(v-for="yIdx of data ? data[0].lattice.length : 0", :key="yIdx")
      div(v-for="chIdx of data.length", :key="chIdx")
        virtual-pixel(
          v-for="xIdx of data[chIdx-1].width",
          :key="xIdx",
          :size="pixelSize",
          :enable="data[chIdx-1].lattice[yIdx-1][xIdx-1]"
        )
      .clear
</template>

<script lang="ts">
import Vue from "vue";
import VirtualPixel from "./VirtualPixel.vue";
import vuescroll, { Config } from "vuescroll";
export default Vue.extend({
  name: "Preview",
  data() {
    return {
      ops: {
        vuescroll: {},
        scrollPanel: {},
        rail: {},
        bar: {},
      } as Config,
    };
  },
  components: {
    VirtualPixel,
  },
  props: ["pixelSize", "data", "mode"],
  computed: {
    previewStyle() {
      let width = 1;
      if (this.data) {
        (<LatticeGen.LatticeResult[]>this.data).forEach(
          (d: LatticeGen.LatticeResult) => (width += d.width * this.pixelSize)
        );
      }
      return {
        width: width + "px",
      };
    },
  },
  created() {
    const vs = this.$refs["vs"] as vuescroll;
  },
});
</script>

<style lang="scss" scoped>
$border-color: #aaa;
.preview {
  border-bottom: 1px solid $border-color;
  border-right: 1px solid $border-color;
}
.clear {
  clear: both;
}
</style>