<template lang="pug">
.lattice
  h2 // 本页面移植自 暮光小猿wzt 某项目 (未完成,暂未公开), 请使用Chrome浏览器打开本页面, 否则可能造成页面显示异常.
  preview(:data="data", :pixelSize="pixelSize", :mode="config.mode")
  md-field(md-clearable)
    md-icon text_fields
    label 文本
    md-textarea(v-model="textInput", md-autogrow)
  md-field
    label 字体
    md-file(v-model="config.font", disabled, accept="application/x-font-ttf")
  md-field
    md-icon format_size
    label 大小
    md-input(v-model="_size", type="number")
  md-field
    label 输出结果
    md-textarea.output(readonly, v-model="codeOutput")
  config-panel(:config.sync="config")
  md-field
    label 输出前缀
    md-textarea(v-model="outputPrefix", md-autogrow)
  md-field
    label 预览大小
    md-input(v-model="pixelSize", type="number")
</template>

<script lang="ts">
import Vue from "vue";
import _ from "lodash";
import Preview from "@/components/Lattice/Preview.vue";
import ConfigPanel from "@/components/Lattice/ConfigPanel.vue";
import latticeGen from "@/lattice-gen/lattice-gen";
import latticeCode from "@/lattice-gen/lattice-code";
export default Vue.extend({
  name: "Lattice",
  data() {
    return {
      textInput: undefined as string | undefined,
      codeOutput: undefined as string | undefined,
      outputPrefix: "const uint8_t Font_" as string,
      pixelSize: 8 as number,
      data: null as LatticeGen.LatticeResult[] | null,
      config: {
        mode: "text",
        size: 16,
        font: "宋体(TODO)",
        bitOrder: false,
        byteOrder: false,
        revertColor: false,
        columnDirection: false,
      } as LatticeGen.LatticeConfig,
      inputChangeDebounced: undefined as any,
    };
  },
  components: {
    Preview,
    ConfigPanel,
  },
  watch: {
    textInput: function (newText, oldText) {
      this.inputChangeDebounced();
    },
    config: {
      handler(newConfig, oldConfig) {
        this.inputChangeDebounced();
      },
      deep: true,
    },
    outputPrefix: function (newText, oldText) {
      _.debounce(this.genCode, 200)();
    },
  },
  methods: {
    inputChange() {
      latticeGen(this.config, this.textInput || "").then((data) => {
        this.data = data;
        this.genCode();
      });
    },
    genCode() {
      latticeCode
        .lattice2Code(this.config, this.data)
        .then((lattice: Uint8Array[] | undefined) => {
          if (lattice) {
            const input: string = this.textInput || "";
            // calculate content
            let content = "";
            let length = 0;
            let chIdx = 0;
            lattice.forEach((arr: Uint8Array) => {
              length += arr.length;
              content += "    ";
              arr.forEach(
                (n: number) =>
                  (content += "0x" + ("0" + n.toString(16)).slice(-2) + ",")
              );
              if (this.config.mode == "text") {
                content += " // " + input.charAt(chIdx);
              } else {
                content += " // " + input;
              }
              content += "\n";
              chIdx++;
            });
            // generate result
            let ret = this.outputPrefix; // write prefix
            ret += latticeCode.text2VarName(input); // write name
            ret += "[" + length + "] {\n"; // write length
            ret += content; // write content
            ret += "};"; // write end
            this.codeOutput = ret;
          } else {
            this.codeOutput = undefined;
          }
        });
    },
  },
  computed: {
    _size: {
      get(): string {
        return this.config.size + "";
      },
      set(val: string) {
        this.config.size = parseInt(val);
      },
    },
  },
  created() {
    this.inputChangeDebounced = _.debounce(this.inputChange, 200);
  },
  head() {
    return {
      title: "在线点阵取模_暮光小猿wzt",
    };
  },
  meta: {
    title: "点阵取模",
  },
});
</script>

<style lang="scss" scoped>
.lattice {
  width: 100%;
  .output {
    resize: none !important;
  }
}
</style>