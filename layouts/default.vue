<template>
  <md-app md-mode="fixed">
    <md-app-toolbar class="md-primary">
      <md-button class="md-icon-button btn-toggle-menu" @click="showSidebar = !showSidebar">
        <md-icon>menu</md-icon>
      </md-button>
      <img class="header-icon" src="@/assets/nagisa.jpg" />
      <span class="md-title">
        {{ myTitle || '暮光小猿wzt' }}
        <span v-if="!!myTitle" class="md-xsmall-hide">- 暮光小猿wzt</span>
      </span>
      <div class="md-toolbar-section-end">
        <md-menu>
          <md-button class="md-icon-button" md-menu-trigger>
            <md-icon>more_vert</md-icon>
          </md-button>
          <md-menu-content>
            <md-menu-item>My Item 1</md-menu-item>
            <md-menu-item>My Item 2</md-menu-item>
            <md-menu-item>My Item 3</md-menu-item>
          </md-menu-content>
        </md-menu>
      </div>
    </md-app-toolbar>

    <md-app-drawer md-permanent="clipped" :md-active.sync="showSidebar">
      <md-toolbar class="md-transparent" md-elevation="0">Navigation</md-toolbar>

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
            <md-list-item to="/linuxdev/01-opi-env">
              <md-icon></md-icon>
              <span>01-OrangePi环境搭建</span>
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
    </md-app-drawer>

    <md-app-content>
      <nuxt />
      <scraft-footer />
    </md-app-content>
  </md-app>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  name: "index",
  data() {
    return {
      showSidebar: false,
      showMenu: false
    };
  },
  methods: {
    go_v2() {
      window.open("/v2", "_blank");
    },
    go_v1() {
      window.open("/v1", "_blank");
    }
  },
  computed: {
    myTitle() {
      let title = this.$store.state.title;
      if (title) {
        return title;
      }
      return undefined;
    }
  }
});
</script>

<style lang="scss">
@font-face {
  font-family: "Material Icons";
  font-style: normal;
  font-weight: 400;
  src: url(../assets/md-icon.woff2) format("woff2");
}
.material-icons {
  font-family: "Material Icons";
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  font-feature-settings: "liga";
  -webkit-font-feature-settings: "liga";
  -webkit-font-smoothing: antialiased;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
.md-app {
  height: 100vh;
  width: 100vw;
  .header-icon {
    height: 40px;
    border-radius: 5px;
  }
  .md-drawer {
    width: 230px;
    max-width: calc(100vw - 125px);
  }
}
@media only screen and (min-width: 600px) {
  .btn-toggle-menu {
    display: none !important;
  }
}
@media only screen and (max-width: 600px) {
  .header-icon {
    display: none;
  }
}
</style>
