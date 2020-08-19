<template lang="pug">
column-direction(v-if="config.columnDirection", :config="config")
row-direction(v-else, :config="config")
</template>

<script lang="ts">
import Vue from "vue";
import RowDirection from "./Demo/RowDirection.vue";
import ColumnDirection from "./Demo/ColumnDirection.vue";
export default Vue.extend({
  name: "Demo",
  data() {
    return {};
  },
  props: ["config"],
  components: {
    RowDirection,
    ColumnDirection,
  },
});
</script>

<style lang="scss" scoped>
</style>