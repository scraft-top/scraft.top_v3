<template>
  <md-app md-mode="fixed">
    <md-app-toolbar class="md-primary">
      <md-button class="md-icon-button btn-toggle-menu" @click="showMenu = !showMenu">
        <md-icon>menu</md-icon>
      </md-button>
      <img class="header-icon" src="@/assets/nagisa.jpg" />
      <span class="md-title">暮光小猿wzt</span>
    </md-app-toolbar>

    <md-app-drawer md-permanent="clipped" :md-active.sync="showMenu">
      <md-toolbar class="md-transparent" md-elevation="0">Navigation</md-toolbar>

      <md-list>
        <md-list-item v-for="i of 50" :key="i">
          <md-icon>move_to_inbox</md-icon>
          <span class="md-list-item-text">Inbox {{ i }}</span>
        </md-list-item>
      </md-list>
    </md-app-drawer>

    <md-app-content>
      <p v-for="i of 50" :key="i">testest {{ i }}</p>
    </md-app-content>
  </md-app>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  name: "index",
  data() {
    return {
      showMenu: false
    };
  }
});
</script>

<style scoped lang="scss">
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
    display: none;
  }
}
@media only screen and (max-width: 600px) {
  .header-icon {
    display: none;
  }
}
</style>