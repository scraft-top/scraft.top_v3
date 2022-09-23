<template lang="pug">
.content
  .md-layout.md-gutter.md-alignment-center
    md-card.md-layout-item.md-medium-size-50.md-small-size-100
      md-card-header
        .md-title Bcrypt加密
      md-card-content
        md-field
          label 原文
          md-input(v-model="plain")
        md-field
          label Rounds
          md-input(v-model="rounds", type="number")
        md-field
          label 结果
          md-input(v-model="cipher", readonly)
    md-card.md-layout-item.md-medium-size-50.md-small-size-100
      md-card-header
        .md-title Bcrypt校验
      md-card-content
        md-field
          label 密文
          md-input(v-model="checkCipher")
        md-field(:class="checkMessageClass")
          label 原文
          md-input(v-model="checkInput")
          .md-helper-text(v-if="showCheckResult") 验证通过
          .md-error(v-if="showCheckResult") 原文不匹配
</template>

<script lang="ts">
import Vue from "vue";
import bcrypt from "bcryptjs";
import _, { toNumber } from "lodash";
export default Vue.extend({
  name: "Bcrypt",
  data() {
    return {
      plain: "",
      rounds: "10",
      cipher: "",
      checkCipher: "",
      checkInput: "",
      checkResult: false,
      encryptDebounced: null as any,
      checkDebounced: null as any,
    };
  },
  watch: {
    plain: function () {
      this.encryptDebounced();
    },
    rounds: function () {
      this.encryptDebounced();
    },
    checkCipher: function () {
      this.checkDebounced();
    },
    checkInput: function () {
      this.checkDebounced();
    },
  },
  methods: {
    encrypt() {
      this.cipher = bcrypt.hashSync(this.plain, toNumber(this.rounds));
    },
    check() {
      this.checkResult = bcrypt.compareSync(this.checkInput, this.checkCipher);
    },
  },
  computed: {
    checkMessageClass() {
      let b: boolean = (<any>this).checkResult;
      return {
        "md-invalid": !b,
      };
    },
    showCheckResult() {
      let that: any = this;
      return that.checkInput.length > 0 && that.checkCipher.length > 0;
    },
  },
  created() {
    this.encryptDebounced = _.debounce(this.encrypt, 100);
    this.checkDebounced = _.debounce(this.check, 100);
  },
  head() {
    return {
      title: "Bcrypt在线加密/校验_暮光小猿wzt",
    };
  },
  meta: {
    title: "Bcrypt在线加密/校验",
  },
});
</script>
