<template lang="pug">
div
  h1 暮光小猿图片管理器2: 多终端云同步的图片搜索数据库

  md-divider
  md-button.md-raised.md-primary(
    href="https://picman.scraft.top",
    target="_blank"
  ) 打开网页在线版
  md-button.md-raised.md-primary(
    href="https://www.scraft.top/dl/pm/",
    target="_blank"
  ) 下载安卓APP
  br
  md-button.md-raised.md-accent(
    href="https://git.scraft.top/kuresaru/picman2-frontend",
    target="_blank"
  ) 看前端源码
  md-button.md-raised.md-accent(
    href="https://git.scraft.top/kuresaru/picman2-server",
    target="_blank"
  ) 看后端源码
  md-button.md-raised.md-accent(
    href="https://git.scraft.top/kuresaru/picman2-android",
    target="_blank"
  ) 看APP源码

  md-divider
  h2 为什么要做这个
  p.page-content
    | 整天和沙雕群友聊天, 表情图保存越来越多
    br
    | 时间长了, 想快速找到某一张图片比较困难
    br
    | 甚至不记得"这张图片"存在手机上了?存在平板上了?
    br
    | 还是在电脑哪块硬盘哪个目录里??
    img(src="/v3_static/img/project/picman2/1.jpg", alt="表情图-我找一下图片")
    br
    | 之后就在[2019年8月13日]挖下了这个坑
    br

  md-divider
  h2 这东西怎么用
  p.page-content
    | 每个用户都可以新建多个自己的图库
    br
    | 图库中可以保存多张图片
    br
    | 每一张图片都有描述(主要内容)和Tag(其它元素)
    br
    | 需要查找时只需要输入关键字
    br
    | 查找返回描述或Tag包含关键字的图片
    img(
      src="/v3_static/img/project/picman2/2.jpg",
      alt="表情图-有什么表情包表达不了的非得要打字吗"
    )

  md-divider
  h2 计划要做但没完成的内容
  p.page-content
    md-list
      md-list-item 应用的使用说明
      md-list-item APP屏幕截图管理
      md-list-item 共享图库给其它用户
      md-list-item 已有图片的编辑和管理

  md-divider
  h2 为什么是2
  p.page-content
    | 最早的设计架构有问题
    br
    | 当时想法是一个用户自建一个专用的服务器
    br
    | 后来才发现不是所有人都搭的了服务器
    br
    | 再之后发现代码已经堆成山, 不如直接重写
    br
    | 感兴趣可以自行编译搭建
    br
    | (不同应用在不同分支,只记得当时一直在用安卓单机版,其它分支是不是能用不确定)
    br
    | (https://git.scraft.top/kuresaru/picman)(限国内访问)
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  data() {
    return {};
  },
  head() {
    return {
      title: "暮光小猿图片管理器2_暮光小猿wzt",
    };
  },
  meta: {
    title: "暮光小猿图片管理器2",
  },
});
</script>

<style lang="scss" scoped>
h1 {
  size: 16px;
  line-height: 32px;
  font-weight: 200;
}
.page-content {
  padding: 0 12px;
  line-height: 1.8em;
  font-size: 16px;
  img {
    padding: 32px;
  }
}
</style>
