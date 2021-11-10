<template lang="pug">
div
  h1 GBLW210: 一个从基于三星S5PV210的工控板魔改来的嵌入式开发板
  p 根据研究,这应该是从汽车充电桩上拆机下来的工控板
    | 不知道该叫什么了 从隔壁老王收来的研究品 就直接叫它隔壁老王210了
  br
  br

  p 当时感觉还挺好 后来又捡了一块 竟然便宜了qwq
  img(src="/v3_static/img/gblw210/tb-1.jpg")
  br
  br
  img(src="/v3_static/img/gblw210/tb-2.jpg")
  br
  br

  md-divider
  h2 核心板引脚图(反面视角)(2021-10-31更新)
  img(src="/v3_static/img/gblw210/gblw210-1.2.jpg")

  details
    summary 点击查看旧图(2020-10-23更新)
    img(src="/v3_static/img/gblw210/gblw210-1.jpg")

  md-divider
  h2 u-boot 2020.10
  ul: h2 源码下载
    li: a(href="https://git.scraft.top/kuresaru/uboot-gblw210", target="_blank") 主仓库(限国内访问)
    li: a(href="https://github.com/kuresaru/uboot-gblw210", target="_blank") GitHub镜像(非及时更新)

  md-divider
  h2 linux kernel 4.19.157 (主更新)
  ul: h2 已测试可行功能(2021-1-14更新):
    li: | dm9000网卡
    li: | NFS根文件系统
    li: | SD卡
  ul: h2 源码下载
    li: a(href="https://git.scraft.top/kuresaru/linux-4.19.157-gblw210", target="_blank") 主仓库(限国内访问)

  md-divider
  h2 linux kernel 3.16.85 (usb,spi,nand无法使用,已放弃更新)
    p: a(href="https://git.scraft.top/kuresaru/kernel-3.16.85-gblw210", target="_blank") 主仓库(限国内访问)

  //- md-divider
  //- h2 linux kernel 5.6
  //-   p // TODO 待上传,未完成
  //-     br
  //-     | 没啥时间 肝不动了qaq
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  data() {
    return {};
  },
  head() {
    return {
      title: "隔壁老王210_暮光小猿wzt",
    };
  },
  meta: {
    title: "隔壁老王210",
  },
});
</script>

<style lang="scss" scoped>
h1 {
  size: 16px;
  line-height: 32px;
  font-weight: 200;
}
</style>
