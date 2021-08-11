<template lang="pug">
  mixin lito(text, icon, to)
    md-list-item(to=to)
      md-icon= icon
      span.md-list-item-text= text
  mixin lilinux(text, to)
    +lito(text, "settings_input_svideo", to)
  mixin limsxzt(text, to)
    +lito(text, "settings_input_hdmi", to)
  md-list
    md-subheader Navigation (｀・ω・´)
    md-list-item(to="/")
      md-icon house
      span.md-list-item-text 主页

    md-subheader 作品
    md-list-item(md-expand)
      md-icon build
      span.md-list-item-text 在线工具
      md-list(slot="md-expand")
        +lito("点阵取模", "apps", "/tools/lattice")
        +lito("Factorio生产计算器", "settings", "/tools/factorio-calc")
    md-list-item(to="/project/picman2")
      md-icon(md-src="/v3_static/img/project/picman2/logo-placeholder.svg")
      span.md-list-item-text 暮光小猿图片管理器2
    md-list-item(href="/v2/index.html#content-scraft")
      md-icon av_timer
      span.md-list-item-text SC 科学创造

    md-subheader 记录
    md-list-item(md-expand)
      md-icon videocam
      span.md-list-item-text 没事瞎折腾系列
      md-list(slot="md-expand")
        +limsxzt("19-osu!触摸ZX键盘", "/msxzt/19-kbosu")
        +limsxzt("21-单片机MIDI文件播放", "/msxzt/21-midi")
    md-list-item(to="/gblw210/gblw210")
      md-icon devices
      span.md-list-item-text 隔壁老王210
    md-list-item(md-expand)
      md-icon devices
      span.md-list-item-text Linux嵌入式
      md-list(slot="md-expand")
        +lilinux("01-OrangePi环境搭建", "/linuxdev/01-opi-env")
        +lilinux("02-第一个内核模块", "/linuxdev/02-first-kernel-module")
        +lilinux("03-编写字符设备驱动程序", "/linuxdev/03-char-device-driver")
        +lilinux("04-内核控制GPIO输出", "/linuxdev/04-gpio-driver")
        +lilinux("05-修改寄存器控制GPIO输出", "/linuxdev/05-gpio-register")
        +lilinux("06-编写杂项设备驱动", "/linuxdev/06-misc-device")
        +lilinux("07-实现I2C总线的OLED驱动", "/linuxdev/07-i2c-oled")
        +lilinux("08-实现SPI总线的VFD驱动", "/linuxdev/08-spi-vfd")

    md-subheader 关于
    md-list-item(to="/history")
      md-icon archive
      span.md-list-item-text 更新日志
    md-list-item(md-expand)
      md-icon restore
      span.md-list-item-text 历史版本
      md-list(slot="md-expand")
        md-list-item(@click="go_v2")
          md-icon filter_2
          span.md-list-item-text V2
        md-list-item(@click="go_v1")
          md-icon filter_1
          span.md-list-item-text V1
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
