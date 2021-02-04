<template lang="pug">
.ftcalc
  processor(:item="item")
  resource-list(:item="item")
</template>

<script lang="ts">
import Vue from "vue";
import Processor from "@/components/FactorioCalc/processor.vue";
import ResourceList from "@/components/FactorioCalc/ResourceList.vue";
export default Vue.extend({
  name: "FactorioCalculator",
  data() {
    return {
      item: {
        name: "合成物品",
        requiredCount: 1,
        outCount: 1,
        time: 0.5,
        speed: 0.75,
        id: "0",
        nextSubItemId: 1,
        items: [],
      },
    };
  },
  components: {
    Processor,
    ResourceList,
  },
  head() {
    return {
      title: "Factorio生产计算器_暮光小猿wzt",
    };
  },
  meta: {
    title: "Factorio生产计算器",
  },
});
</script>
