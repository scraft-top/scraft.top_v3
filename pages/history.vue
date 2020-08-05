<template lang="pug">
    md-table
      md-table-toolbar: h1.md-title Git Commit History (branch master)
      md-table-row
        md-table-head TIME
        md-table-head COMMIT
      md-table-row(v-for="i of 10" :key="i")
        md-table-cell TODO
        md-table-cell 未完成
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  data() {
    return {};
  },
  head() {
    return {
      title: "更新日志_暮光小猿wzt"
    };
  },
  meta: {
    title: "更新日志"
  }
});
</script>

<style lang="scss" scoped>
</style>
