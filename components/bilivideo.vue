<template>
  <div class="bilivideo">
    <iframe
      id="bvframe"
      :src="src"
      scrolling="no"
      border="0"
      frameborder="no"
      framespacing="0"
      allowfullscreen="true"
      @load="loading = false"
      v-show="!loading"
    />
    <div id="bvloading">
      <md-progress-spinner v-if="loading" ref="bvloading" md-mode="indeterminate" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  data() {
    return {
      loading: true
    };
  },
  computed: {
    src() {
      return (
        "//player.bilibili.com/player.html?aid=" +
        this.aid +
        "&cid=" +
        this.cid +
        "&page=1"
      );
    }
  },
  props: ["aid", "cid"]
});
</script>

<style lang="scss" scoped>
.bilivideo {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 70%;
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