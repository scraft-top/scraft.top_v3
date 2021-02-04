<template lang="pug">
.ftcalc
  processor(:item="item")
</template>

<script lang="ts">
import Vue from "vue";
import Processor from "@/components/FactorioCalc/processor.vue";
export default Vue.extend({
  name: "FactorioCalculator",
  data() {
    return {
      item: {
        name: "Item",
        requiredCount: 1,
        outCount: 1,
        time: 0.5,
        speed: 0.75,
        id: 0,
        nextSubItemId: 1,
        items: [],
      },
    };
  },
  components: {
    Processor,
  },
});
</script>
