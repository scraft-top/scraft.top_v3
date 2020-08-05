<template lang="pug">
  md-app(md-mode="fixed")
    md-app-toolbar.md-primary
      md-button.md-icon-button.btn-toggle-menu(@click="showSidebar = !showSidebar"): md-icon menu
      img.header-icon(src="@/assets/nagisa.jpg")
      span.md-title {{ myTitle || '暮光小猿wzt' }}
        span.md-xsmall-hide(v-if="!!myTitle") &nbsp;- 暮光小猿wzt
      .md-toolbar-section-end
        md-menu
          md-button.md-icon-button.md-menu-trigger: md-icon more_virt
          md-menu-content
            md-menu-item Test 1
            md-menu-item Test 2
    md-app-drawer(md-permanent="clipped" :md-active.sync="showSidebar")
      md-toolbar.md-transparent(md-elevation="0") Navigation (｀・ω・´)
      scraft-navigations
    md-app-content
      nuxt
      scraft-footer
</template>

<script lang="ts">
import Vue from "vue";
import ScraftNavigations from "@/components/scraft-navigations.vue";
import ScraftFooter from "@/components/scraft-footer.vue";
export default Vue.extend({
  name: "index",
  data() {
    return {
      showSidebar: false,
      showMenu: false
    };
  },
  components: {
    ScraftNavigations,
    ScraftFooter
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
@import url(@/assets/common.scss);
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
    min-width: 240px;
    max-width: 360px;
    width: 30vw;
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
