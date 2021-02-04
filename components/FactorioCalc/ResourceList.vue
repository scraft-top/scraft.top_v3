<template lang="pug">
md-card.md-layout-item
  md-card-header.md-title 原料列表
    span.md-subhead
      |
      | // 数量计算未完成
  md-card-content
    .md-layout
      md-list.md-layout-item.md-small-size-100.md-medium-size-50.md-large-size-33
        md-subheader 合成{{ this.item.name }}需要:
        md-list-item(v-for="i in resources", :key="i.id") {{ i.name }}
          //- code 数量计算未完成
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  name: "ResourceList",
  data() {
    return {};
  },
  props: {
    item: {
      required: true,
      type: Object,
    },
  },
  computed: {
    resources(): any[] {
      return this.findResource(this.item);
    },
  },
  methods: {
    findResource(i: any): any[] {
      let resources: any[] = [];
      if (i.items.length > 0) {
        for (let a = 0; a < i.items.length; a++) {
          resources = resources.concat(this.findResource(i.items[a]));
        }
      } else {
        resources.push(i);
      }
      return resources;
    },
  },
});
</script>
