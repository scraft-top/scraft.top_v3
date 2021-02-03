<template lang="pug">
md-card.md-layout-item.md-size-50.md-small-size-100
  md-card-header.md-title {{ item.name }} x {{ item.count }}
    span.md-subhead
      |  @ {{ countPerSecond.toFixed(2) }} 个/秒, 总 {{ (countPerSecond * item.processorCount).toFixed(2) }} 个/秒
  md-card-content
    .md-layout.md-gutter
      .md-layout-item
        md-field
          label 物品名
          md-input(v-model="item.name")
      .md-layout-item
        md-field
          label 需求数量
          md-input(v-model="item.requiredCount", type="number", min="1")
          span.md-suffix 个
      .md-layout-item
        md-field
          label 机器数量
          md-input(v-model="item.processorCount", type="number", min="1")
          span.md-suffix 个
      .md-layout-item
        md-field
          label 成品数量
          md-input(v-model="item.outCount", type="number", min="1")
          span.md-suffix 个/次
      .md-layout-item
        md-field
          label 制造时间
          md-input(v-model="item.time", type="number", min="0", step="0.1")
          span.md-suffix 秒/次
      .md-layout-item
        md-field
          label 制造速度
          md-input(v-model="item.speed", type="number", min="0", step="0.25")
    processor(v-for="i in item.items", :key="i.name", :item="i", @rm-item="rmItem")
    md-button.md-primary.md-raised(@click="addItem") 加材料
    md-button.md-accent.md-raised(@click="$emit('rm-item', item.id)") 删除
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  name: "processor",
  data() {
    return {};
  },
  props: {
    item: {
      required: true,
      type: Object,
    },
  },
  methods: {
    addItem() {
      this.item.items.push({
        name: "Item",
        requiredCount: 1,
        processorCount: 1,
        outCount: 1,
        time: 1,
        speed: 1,
        id: this.item.nextSubItemId,
        nextSubItemId: 0,
        items: [],
      });
    },
    rmItem(id: number) {
      let i: number, j: boolean;
      for (i = 0, j = false; i < this.item.items.length; i++) {
        if (this.item.items[i].id == id) {
          j = true;
          break;
        }
      }
      if (j) {
        this.item.items.splice(i, 1);
      }
    }
  },
  computed: {
    countPerSecond(): number {
      if (this.item.time > 0 && this.item.speed > 0 && this.item.outCount > 0) {
        return this.item.outCount / (this.item.time / this.item.speed);
      }
      return 0;
    }
  }
});
</script>

<style lang="scss" scoped>
</style>
