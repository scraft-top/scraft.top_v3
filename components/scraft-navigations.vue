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
        <md-list-item to="/linuxdev/08-spi-vfd">
          <md-icon></md-icon>
          <span>08-实现SPI总线的VFD驱动</span>
        </md-list-item>
        <md-list-item to="/linuxdev/07-i2c-oled">
          <md-icon></md-icon>
          <span>07-实现I2C总线的OLED驱动</span>
        </md-list-item>
        <md-list-item to="/linuxdev/06-misc-device">
          <md-icon></md-icon>
          <span>06-编写杂项设备驱动</span>
        </md-list-item>
        <md-list-item to="/linuxdev/05-gpio-register">
          <md-icon></md-icon>
          <span>05-修改寄存器控制GPIO输出</span>
        </md-list-item>
        <md-list-item to="/linuxdev/04-gpio-driver">
          <md-icon></md-icon>
          <span>04-内核控制GPIO输出</span>
        </md-list-item>
        <md-list-item to="/linuxdev/03-char-device-driver">
          <md-icon></md-icon>
          <span>03-编写字符设备驱动程序</span>
        </md-list-item>
        <md-list-item to="/linuxdev/02-first-kernel-module">
          <md-icon></md-icon>
          <span>02-第一个内核模块</span>
        </md-list-item>
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
</template>

<script lang="ts">
import Vue from "vue";
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
  }
});
</script>