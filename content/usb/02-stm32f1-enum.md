## 实验环境

  + 单片机: STM32F103C8T6
  + 编辑器: code
  + 编译器: gcc 8

<md-divider></md-divider>

## 相关资料

  + [USB 2.0 Specification (只要里边的usb_20.pdf)](https://usb.org/sites/default/files/usb_20_20210701.zip)
  + [旧版STM32F1 USB设备库 (STM32_USB-FS-Device_Lib)](https://www.st.com/en/embedded-software/stsw-stm32121.html)
  + [STM32F1参考手册 (RM0008-Rev.21)](https://www.st.com/content/ccc/resource/technical/document/reference_manual/59/b9/ba/7f/11/af/43/d5/CD00171190.pdf/files/CD00171190.pdf/jcr:content/translations/en.CD00171190.pdf)
  + [本章节程序源码参考](https://github.com/kuresaru/STM32F1_USB_Device_EmumTest)

<md-divider></md-divider>


## F1入坑三步

  1. 复制库
  2. 初始化
  3. 配置(描述符,端点,缓冲区)

<md-divider></md-divider>


## 1. 复制库

  + 复制`STM32_USB-FS-Device_Lib/Libraries/STM32_USB-FS-Device_Driver`中的`src`和`inc`到工程
  + 复制本章节示例工程中简化好的配置(`usb_conf.h`,`usb_istr.c`,`usb_prop.c`)到工程

<md-divider></md-divider>


## 2. 芯片初始化

  + 开启GPIO时钟
  + 配置PA11/12复用模式
  + 配置USB中断优先级
  + 设置USB时钟1.5分频(72/1.5=48MHz)
  + 开启USB时钟

<md-divider></md-divider>


## 3. 库初始化

  + 在主文件中加入`usb_lib.h`头文件
  + 在主函数中初始化完成后调用`USB_Init()`函数
  + 编辑库中的`usb_lib.h`头文件，替换`hw_config.h`为`stm32f10x.h`
  + 配置`usb_prop.c`中Device_Table结构体中总端点数和总配置数(本工程只有端点0和一个配置，所以设置为1和1)

## 4. 库设备配置

  + 复制上一章节的设备描述符和配置描述符，修改`bMaxPacketSize0`与`usb_prop.c`中`Device_Property`结构体的`MaxPacketSize`一致
  + 分配USB收发缓冲区(具体配置方法说明还在咕~~，可自行参考手册第628页图221研究)
