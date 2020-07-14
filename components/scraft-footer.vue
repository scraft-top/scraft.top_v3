<template>
  <div class="footer">
    <md-divider />暮光小猿wzt - v{{ ver }}
    <br />
    <a href="http://beian.miit.gov.cn/" target="_blank">冀ICP备18037738号</a>
    <md-divider />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
const packageInfo = require('@/package.json');
export default Vue.extend({
  data() {
    return {}
  },
  computed: {
    ver() {
      return packageInfo.version;
    }
  }
})
</script>

<style lang="scss" scoped>
.footer {
  margin: 20px 0;
  letter-spacing: 0.5px;
  text-align: center;
  a {
    text-decoration: none;
  }
}
</style>