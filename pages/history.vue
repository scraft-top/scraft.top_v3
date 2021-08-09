<template lang="pug">
md-table
  md-table-toolbar: h1.md-title Git Commit Log (master)
  md-table-row
    md-table-head DATE
    md-table-head TIME
    md-table-head COMMIT
  md-table-row(v-for="(c, i) in commits", :key="i")
    md-table-cell {{ c.date }}
    md-table-cell {{ c.time }}
    md-table-cell {{ c.commit }}
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  async asyncData({ app }) {
    const commits = await app.$axios.get("/v3_static/v3_commits.json");
    return {
      commits: commits.data,
    };
  },
  head() {
    return {
      title: "更新日志_暮光小猿wzt",
    };
  },
  meta: {
    title: "更新日志",
  },
});
</script>

<style lang="scss" scoped>
</style>
