<template lang="pug">
.content(ref="pagediv")
  md-card
    md-card-header
      .md-title {{ title }}
    md-card-content
      .control
        md-field
          label 输入图像
          md-file(
            v-model="fileInput",
            accept="image/*",
            @md-change="onFileChange"
          )
        md-field
          label step
          md-input(name="step", v-model="options.step")
        md-field
          label algorithm
          md-select(name="step", v-model="options.algorithm")
            md-option(value="ordered") ordered
            md-option(value="diffusion") diffusion
            md-option(value="atkinson") atkinson
        md-field
          label palette
          md-textarea(v-model="paletteInput")
        .buttons
          md-button.md-raised.md-accent(
            @click="run",
            :disabled="(!fileInput) || busy"
          ) 查看预览
          md-button.md-raised.md-primary(
            @click="orig",
            :disabled="(!fileInput) || busy"
          ) 下载原图
          md-progress-spinner.spinner(
            v-show="busy",
            :md-diameter="30",
            :md-stroke="3",
            md-mode="indeterminate"
          )
      .preview.md-layout.md-gutter.md-alignment-center
        #output.md-layout-item.md-size-50.md-small-size-100
          span 输出预览
          img(ref="previewOutput")
        .md-layout-item.md-size-50.md-small-size-100
          span 输入预览
          img(ref="previewInput")
  #render-area
    img
</template>

<script lang="ts">
import Vue from "vue";
const DitherJS = require("ditherjs");
const title = "图像DITHER抖动在线处理";
type algo = "ordered" | "diffusion" | "atkinson";
type options = {
  step: number;
  palette: number[][];
  algorithm: algo;
};
export default Vue.extend({
  name: "Dither",
  data() {
    return {
      busy: false,
      title: title,
      fileInput: null,
      paletteInput: "0 0 0\n255 0 255\n0 255 255\n255 255 255",
      options: {
        step: 1,
        algorithm: "atkinson",
        palette: [
          [0, 0, 0],
          [255, 0, 255],
          [0, 255, 255],
          [255, 255, 255],
        ],
      } as options,
    };
  },
  methods: {
    async orig() {
      this.run();
      let palette = this.convertPalette();
      if (!palette) {
        return;
      }
      this.options.palette = palette;
      let parent = document.getElementById("render-area")!!;
      let output = this.replaceOutputImg(parent);
      let input = this.$refs.previewInput as HTMLImageElement;
      output.src = input.src;
      let width = input.naturalWidth;
      let height = input.naturalHeight;
      parent.style.width = `${width}px`;
      parent.style.height = `${height}px`;
      output.width = width;
      output.height = height;
      parent.style.display = "block";
      let ditherJs = new DitherJS(this.options);
      ditherJs.dither(output);
      parent.style.display = "none";
      let canvas = document.querySelector("#render-area canvas") as HTMLCanvasElement;
      let url = canvas.toDataURL("image/png");
      url = url.replace(/^data:image\/png/, "data:application/octet-stream");
      let a = document.createElement("a");
      let filename = `${this.fileInput}.${this.options.algorithm}.png`;
      a.download = filename;
      a.href = url;
      a.click();
    },
    async run() {
      let palette = this.convertPalette();
      if (!palette) {
        return;
      }
      this.busy = true;
      this.options.palette = palette;
      let parent = document.getElementById("output")!!;
      let output = this.replaceOutputImg(parent);
      let input = this.$refs.previewInput as HTMLImageElement;
      output.src = input.src;
      let ditherJs = new DitherJS(this.options);
      ditherJs.dither(output);
      this.busy = false;
    },
    replaceOutputImg(parent: HTMLElement): HTMLImageElement {
      let child = parent.querySelector("canvas");
      if (!!child) {
        let node = document.createElement("img");
        parent.replaceChild(node, child);
        return node;
      } else {
        return parent.querySelector("img")!!;
      }
    },
    loadPreviewImg(file: File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        let src = <string | null | undefined>e.target?.result;
        if (src) {
          this.$refs.previewInput.src = src;
        }
      };
      reader.readAsDataURL(file);
    },
    convertPalette(): number[][] | null {
      let palette = [];
      let lines = this.paletteInput.split(/\n/);
      for (let lineIndex in lines) {
        let line = lines[lineIndex].trim();
        // console.log(line);
        let p = [];
        let items = line.split(/[ \t]+/);
        for (let itemIndex in items) {
          let item = items[itemIndex];
          // console.log(item);
          try {
            let i = parseInt(item);
            if (i < 0 || i > 255) {
              return null;
            }
            p.push(i);
          } catch (e) {
            console.log(e);
            return null;
          }
        }
        palette.push(p);
      }
      // let c = palette.length;
      // for (let i in palette) {
      //   let p = palette[i];
      //   console.log(p);
      //   if (p.length != c) {
      //     return null;
      //   }
      // }
      return palette;
    },
    async selectFile(file: File) {
      let array = file.name.split(".");
      let ext = array[array.length - 1];
      const support = ["jpg", "jpeg", "png", "gif"];
      if (support.indexOf(ext) != -1) {
        this.loadPreviewImg(file);
      } else {
        this.msg("文件格式错误");
      }
    },
    msg(text: string) {
      console.log(text);
    },
    async onFileChange(fileList: File[]) {
      await this.selectFile(fileList[0]);
    },
    async onDrop(e: DragEvent) {
      e.stopPropagation();
      e.preventDefault();
      const data = e.dataTransfer?.files[0];
      if (data) {
        await this.selectFile(data);
      }
    },
    async onPaste(event: ClipboardEvent) {
      let items = event.clipboardData?.items;
      let file: File | null = null;
      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            file = items[i].getAsFile();
            break;
          }
        }
      }
      if (!file) {
        this.msg("粘贴内容不包含图片");
      } else {
        await this.selectFile(file);
      }
    },
    onDrag(e: DragEvent) {
      e.stopPropagation();
      e.preventDefault();
    },
  },
  mounted() {
    this.$refs.pagediv.addEventListener("dragenter", this.onDrag, false);
    this.$refs.pagediv.addEventListener("dragover", this.onDrag, false);
    this.$refs.pagediv.addEventListener("drop", this.onDrop, false);
    document.addEventListener("paste", this.onPaste);
  },
  head() {
    return {
      title: `${title}_暮光小猿wzt`,
    };
  },
  meta: {
    title: title,
  },
});
</script>

<style scoped>
#render-area {
  display: none;
}
.spinner {
  /* display: inline-block; */
  margin: 6px 8px;
}
</style>
