<template>
  <md-list>
    <md-list-item to="/">
      <md-icon>house</md-icon>
      <span class="md-list-item-text">主页</span>
    </md-list-item>

    <md-list-item href="/v2/index.html#content-scraft">
      <md-icon></md-icon>
      <span class="md-list-item-text">SC 科学创造</span>
    </md-list-item>

    <md-list-item>
      <md-icon></md-icon>
      <span class="md-list-item-text">没事瞎折腾系列</span>
    </md-list-item>

    <md-list-item md-expand>
      <md-icon></md-icon>
      <span class="md-list-item-text">Linux嵌入式</span>
      <md-list slot="md-expand">
        <md-list-item to="/linuxdev/02-first-kernel-module">
          <md-icon></md-icon>
          <span>02-第一个内核模块</span>
        </md-list-item>
      </md-list>
    </md-list-item>

    <md-list-item md-expand>
      <md-icon>access_time</md-icon>
      <span class="md-list-item-text">历史版本</span>
      <md-list slot="md-expand">
        <md-list-item @click="go_v2">
          <md-icon>filter_2</md-icon>
          <span class="md-list-item-text">V2</span>
        </md-list-item>
        <md-list-item @click="go_v2">
          <md-icon>filter_1</md-icon>
          <span class="md-list-item-text">V1</span>
        </md-list-item>
      </md-list>
    </md-list-item>
  </md-list>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data() {
    return {};
  },
  methods: {
    go_v2() {
      window.open("/v2", "_blank");
    },
    go_v1() {
      window.open("/v1", "_blank");
    }
  },
})
</script>