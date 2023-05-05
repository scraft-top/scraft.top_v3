<template lang="pug">
md-card.md-layout-item
  md-card-header.md-title {{ item.name }}
    span.md-subhead
      |
      | @ {{ countPerSecond.toFixed(2) }} 个/秒 × {{ processorCount }} 机器 = 总 {{ (countPerSecond * processorCount).toFixed(2) }} 个/秒
  md-card-content
    .md-layout.md-gutter
      .md-layout-item.md-small-size-100.md-medium-size-50
        md-field
          label 物品名
          md-input(v-model="item.name")
          span.md-helper-text 这个机器用来制作{{ item.name }}
      .md-layout-item.md-small-size-100.md-medium-size-50
        md-field
          label(v-if="!!superItem") 需求数量 (个/次)
          label(v-else) 需求数量 (个/秒)
          md-input(v-model="item.requiredCount", type="number", min="0.01", step="0.01")
          span.md-helper-text(v-if="!!superItem") 制作{{ superItem.outCount }}个{{ superItem.name }}需要{{ item.requiredCount }}个{{ item.name }}
          span.md-helper-text(v-else) 我需要每秒{{ item.requiredCount }}个{{ item.name }}
    .md-layout.md-gutter
      .md-layout-item.md-small-size-100.md-medium-size-33
        md-field
          label 成品数量 (个/次)
          md-input(v-model="item.outCount", type="number", min="1")
          span.md-helper-text 合成一次会出{{ item.outCount }}个成品
      .md-layout-item.md-small-size-100.md-medium-size-33
        md-field
          label 制造时间 (秒/次)
          md-input(v-model="item.time", type="number", min="0", step="0.1")
          span.md-helper-text 这个合成的标称时间是{{ item.time }}
      .md-layout-item.md-small-size-100.md-medium-size-33
        md-field
          label 制造速度 (系数)
          md-input(v-model="item.speed", type="number", min="0", step="0.25")
          span.md-helper-text 这个机器的制造速度是{{ item.speed }}
    processor(
      v-for="i in item.items",
      :key="`${item.id}_${i.id}`",
      :item="i",
      :super-item="item",
      @rm-item="rmItem"
    )
    md-button.md-primary.md-raised(@click="addItem") 加材料
    md-button.md-accent.md-raised(
      v-if="!!superItem",
      @click="$emit('rm-item', item.id)"
    ) 删除
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
        name: `新物品${this.item.id.replace(/_/g, '.')}.${this.item.nextSubItemId}`,
        requiredCount: 1,
        outCount: 1,
        time: 0.5,
        speed: 0.75,
        id: `${this.item.id}_${this.item.nextSubItemId}`,
        nextSubItemId: 1,
        items: [],
      });
      this.item.nextSubItemId++;
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
    },
  },
  computed: {
    countPerSecond(): number {
      if (this.item.time > 0 && this.item.speed > 0 && this.item.outCount > 0) {
        return this.item.outCount / (this.item.time / this.item.speed);
      }
      return 0;
    },
    totalRequiredCount(): number {
      if (this.item.requiredCount > 0) {
        let superCount = this.superItem?.totalRequiredCount;
        if (!(superCount > 0)) {
          superCount = 1;
        }
        return this.item.requiredCount * superCount;
      }
      return 0;
    },
    processorCount(): number {
      if (this.countPerSecond > 0 && this.totalRequiredCount > 0) {
        return Math.ceil(this.totalRequiredCount / this.countPerSecond);
      }
      return 0;
    },
    superItem(): any {
      let parent3 = this.$parent?.$parent?.$parent;
      if (parent3?.$options.name === 'processor') {
        return parent3;
      }
    }
  },
});
</script>

<style lang="scss" scoped>
</style>
