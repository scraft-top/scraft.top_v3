<template lang="pug">
  .bilivideo
    iframe(
      id="bvframe"
      :src="_src"
      scrolling="no"
      border="0"
      frameborder="no"
      framespacing="0"
      allowfullscreen="true"
      @load="loading = false")
    #bvloading: md-progress-spinner(
      v-if="loading"
      ref="bvloading"
      md-mode="indeterminate"
    )
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  data() {
    return {
      loading: true
    };
  },
  props: ["params"],
  computed: {
    _src() {
      return "//player.bilibili.com/player.html?" + this.params;
    }
  }
});
</script>

<style lang="scss" scoped>
.bilivideo {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 70%;
  margin-bottom: 60px;
  iframe {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }
  #bvloading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>