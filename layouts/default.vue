<template lang="pug">
  md-app(md-mode="fixed")
    md-app-toolbar.md-primary
      .md-toolbar-section-start
        md-button.md-icon-button.btn-toggle-menu(@click="showSidebar = !showSidebar"): md-icon menu
        img.header-icon(src="@/assets/nagisa.jpg")
        span.md-title {{ myTitle || '暮光小猿wzt' }}
          span.md-xsmall-hide(v-if="!!myTitle") &nbsp;- 暮光小猿wzt
      .md-toolbar-section-end
        md-menu(md-size="medium", md-align-trigger, v-if="loggedIn == 1")
          md-button(md-menu-trigger) 个人中心
          md-menu-content
            md-menu-item(href="/api/scraft/logout.php") 退出登录
        md-button(v-if="loggedIn == 0", href="/api/scraft/login.php") 登录
        md-button.md-icon-button(@click="openNew('https://space.bilibili.com/15858903')")
          img(src="@/assets/svg/bilibili-line.svg")
          md-tooltip(md-direction="bottom") 猿姐のbilibili
        md-button.md-icon-button(@click="openNew('https://github.com/kuresaru')")
          img(src="@/assets/svg/github-line.svg")
          md-tooltip(md-direction="bottom") 猿姐のGitHub
        //- md-button.md-icon-button(@click="openNew('http://shang.qq.com/wpa/qunwpa?idkey=21b322a59c306b093542cc8b2ccff1ceeaf032abcb02b1c03d7b8eeb6e88fc88')")
        //- md-button.md-icon-button(@click="openNew('https://www.scraft.top/qq')")
        md-button.md-icon-button(@click="openNew('https://msxzt.cn/qq')")
          img(src="@/assets/svg/qq-line.svg")
          md-tooltip(md-direction="bottom") 加入小猿山庄QQ群
        //- md-menu(md-direction="top-end")
        //-   md-button.md-icon-button.menu-trigger(md-menu-trigger): md-icon more_vert
        //-   md-menu-content
    md-app-drawer(md-permanent="clipped" :md-active.sync="showSidebar")
      scraft-navigations
    md-app-content
      nuxt
      scraft-footer
      script(src="/v3_static/live2d/autoload.js")
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
  methods: {
    openNew(url: string) {
      window.open(url);
    },
  },
  computed: {
    myTitle() {
      let title = this.$store.state.title;
      if (title) {
        return title;
      }
      return undefined;
    },
    loggedIn(): number {
      return this.$store.getters.loginState
    }
  },
  mounted() {
    this.$store.dispatch("updateUser");
  },
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
