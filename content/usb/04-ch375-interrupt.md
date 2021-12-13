## 实验环境

  + 单片机: STC15F2K60S2 @22.1184MHz
  + USB: CH375
  + 编辑器: code
  + 编译器: SDCC 4.0.0

<md-divider></md-divider>

## 相关资料

  + [USB 2.0 Specification (只要里边的usb_20.pdf)](https://usb.org/sites/default/files/usb_20_20210701.zip)
  + [CH372技术手册1 (CH372DS1.PDF)](http://www.wch.cn/downloads/CH372DS1_PDF.html)
  + [CH372技术手册2 (CH372DS2.PDF)](http://www.wch.cn/downloads/CH375DS2_PDF.html)
  + [CH375技术手册1 (CH375DS1.PDF)](http://www.wch.cn/downloads/CH375DS1_PDF.html)
  + [本章节程序源码参考](https://github.com/kuresaru/51_ch375_device_interrupt_test)
  + [本章节驱动程序源码参考](https://github.com/kuresaru/libusb_InterruptTransferTest)
  + [其它WCH官方相关资料](http://www.wch.cn/search?t=downloads&q=ch375)

<md-divider></md-divider>


## 硬件连接

  | MCU | CH375 |
  | :-: | :---: |
  | P20 | D0    |
  | P21 | D1    |
  | P22 | D2    |
  | P23 | D3    |
  | P24 | D4    |
  | P25 | D5    |
  | P26 | D6    |
  | P27 | D7    |
  | ET0 | #INT \[!!这次改用了外部中断0]  |
  | P37 | A0    |
  | P41 | #CS   |
  | P42 | #RD   |
  | P44 | #WR   |


<md-divider></md-divider>


## 中断传输特点

  1. 数据包小
  2. 数据周期性产生
  3. 数据实时性要求高

<md-divider></md-divider>


## 工程准备

  1. 搭建好01期设备枚举的程序框架
  2. 软件查询中断线改成了硬件外部中断0线
  3. 取配置描述符部分返回的长度改为本次请求的长度 (具体原因解释见视频`2:43`~`3:42`处)
  4. 正确处理不支持的SETUP请求 (返回STALL)

<md-divider></md-divider>

## 描述符类型表

  USB2.0文档 第251页 表9-5

  ![USB2.0_Table9-5](./v3_static/img/usb/usb20t9-5.jpg)

<md-divider></md-divider>


## 接口描述符

  - 一个USB设备可以有多个接口, 一般一个接口对应设备的一个功能.

  - 接口描述符结构 (USB2.0文档 第268页 表9-12)

    ![USB2.0_Table9-12](./v3_static/img/usb/usb20t9-12.jpg)

<md-divider></md-divider>


## 端点描述符

  - 一个接口里有一般有一或多个端点, 端点用来传输数据.

  - 端点描述符结构 (USB2.0文档 第269页 表9-13)

    ![USB2.0_Table9-13](./v3_static/img/usb/usb20t9-13.jpg)

<md-divider></md-divider>


## 写配置描述符中的接口描述符和端点描述符

  ```c
  #define CONFIGURATION_DESCRIPTOR_SIZE (9 + 9 + 7 + 7)
  uint8_t __code ConfigurationDescriptor[CONFIGURATION_DESCRIPTOR_SIZE] = {
      // configuration 配置描述符(头)
      9,                                    // bLength 配置描述符的头的长度一定是9字节
      0x02,                                 // bDescriptorType 类型:配置描述符
      bwVal(CONFIGURATION_DESCRIPTOR_SIZE), // wTotalLength 配置描述符总长度(9字节头+之后其它描述符的总长度,也是这个数组的长度)
      1,                                    // bNumInterfaces 这个配置有1个接口(指下边的interface部分)
      1,                                    // bConfigurationValue 这是第1个配置
      0,                                    // iConfiguration 配置的文字描述的序号(没有)
      0xE0,                                 // bmAttributes (自供电,支持远程唤醒)
      250,                                  // bMaxPower 最大消耗总线500mA的电流
      // interface
      9,    // bLength 接口描述符的长度是9字节
      0x04, // bDescriptorType 接口描述符的类型是4
      0,    // bInterfaceNumber 这是第0个接口
      0,    // bAlternateSetting 这是接口第0个[形态](不知道怎么准确描述了)
      2,    // bNumEndpoints 这个接口有2个端点
      0xFF, // bInterfaceClass 这个接口是自定义类设备
      0xFF, // bInterfaceSubClass 这个接口是自定义子类设备
      0xFF, // bInterfaceProtocol 这个接口是自定义协议设备
      0,    // iInterface 接口的文字描述的序号(没有)
      // EP IN1
      7,        // bLength 端点描述符的长度是7字节
      0x05,     // bDescriptorType 端点描述符的长度是5
      0x81,     // bEndpointAddress(IN1) 端点号是输入1 (bit7表示输入)
      0x03,     // bmAttributes(Interrupt) 端点模式是中断传输 3表示中断传输
      bwVal(1), // wMaxPacketSize 一次中断传输最大有1字节的数据 注意如果用的是CH372/375 那么芯片的端点1缓冲区只有8字节
      0x06,     // bInterval (2^(n-1)) (1-16)  2^(6-1)=32ms 主机每32ms过来取一次数据
      // EP OUT1
      7,        // bLength 端点描述符的长度是7字节
      0x05,     // bDescriptorType 端点描述符的长度是5
      0x01,     // bEndpointAddress(OUT1) 端点号是输出1
      0x03,     // bmAttributes(Interrupt) 端点模式是中断传输 3表示中断传输
      bwVal(1), // wMaxPacketSize 一次中断传输最大有1字节的数据 注意如果用的是CH372/375 那么芯片的端点1缓冲区只有8字节
      0x00,     // bInterval 输出端点不需要指定周期
  };
  ```

<md-divider></md-divider>


## 处理设置配置请求

  - 主机在枚举完成后会发出设置配置请求, 需要进行处理(回复ACK). (请求格式参考USB2.0官方文档 第257页 9.4.7 Set Configuration)

  ```c
  //case 0x0C: // SETUP
    // ...
    //switch (CurrentSetupRequest) // bRequest
      // ...

      case 0x09: // set configuration
        print("set cfg\r\n");
        wr_cmd(0x29); // write ep0
        wr_data(0);   // 发送0字节数据 表示ACK
        wr_cmd(0x23); // unlock usb
        configured = 1;
        setup_error = 0;
        break;
  ```

  - 此时可以连接设备到电脑, Windows系统需要手动安装WinUSB驱动程序. (参考视频`15:28`~`16:20`片段) (如安装失败请关闭驱动强制签名)

<md-divider></md-divider>


## 发送数据

  在端点描述符里描述端点`输入1`每32ms会发送一次数据, 现在设置单片机的定时器, 在USB被配置成功后定时发送数据.

  ```c
  // 定时器0设置为每32ms进入一次中断
  uint8_t senddata = 0; // 发送数据变量
  void T0_Isr() __interrupt(1)
  {
      if (configured) // 在主机发送Set Configuration后设备进入可用状态, 可以开始发送数据
      {
          wr_cmd(0x2A); // 写端点1上传缓冲区(CH372DS1 第5页 5.12 WR_USB_DATA5)
          wr_data(1); // 长度1字节
          wr_data(senddata++); // 每次发送完数据后变量+1
      }
  }
  ```

<md-divider></md-divider>


## 接收数据

  处理端点1收到数据中断, 把收到的数据显示在LED指示灯上.

  ```c
  case 0x01:        // EP1 OUT
      wr_cmd(0x28); // rd usb data
      rd_data(&len);
      for (tmp = 0; tmp < len; tmp++)
      {
          rd_data(buf + tmp);
      }
      if (len == 1) // 电脑上驱动一次发过来一个字节数据
      {
          LED = buf[0] & 0x1; // 把接收到的数据的最低位显示在LED上
      }
      wr_cmd(0x23); // unlock usb
      break;
  ```

<md-divider></md-divider>


## libusb 用户空间驱动

  linux可以直接安装libusb1.0库,windows需要搭建好mingw环境并安装Libusb1.0库

  ```c
  #include <stdio.h>
  #include <stdint.h>
  #include <libusb-1.0/libusb.h>

  #define VID 0x1234
  #define PID 0x5678

  int main(int argc, char **argv)
  {
      libusb_context *ctx;
      libusb_device_handle *hdev;
      int r;

      char buf[16];
      int len;

      // 初始化libusb库
      r = libusb_init(&ctx);
      if (r < 0)
      {
          printf("Init Libusb Error\n");
          return 1;
      }

      // 设置库的日志等级
      libusb_set_option(ctx, LIBUSB_OPTION_LOG_LEVEL, LIBUSB_LOG_LEVEL_INFO);

      // 根据VendorID ProductID打开对应的USB设备
      hdev = libusb_open_device_with_vid_pid(ctx, VID, PID);
      if (hdev == NULL)
      {
          printf("Open Device Error\n");
          goto exit_lib;
      }
      printf("Open Device OK\n");

      // 打开设备的0号接口
      r = libusb_claim_interface(hdev, 0);
      if (r < 0)
      {
          printf("Claim Interface Error\n");
          goto exit_device;
      }
      printf("Claim Interface OK\n");

      // 循环收发400次
      for (int i = 0; i < 400; i++)
      {
          // 发起中断传输,接收数据 参数: 句柄,端点号,缓冲区,传输大小,实际传输大小,超时ms
          r = libusb_interrupt_transfer(hdev, 0x81, buf, 1, &len, 1000);
          if (len > 0)
          {
              printf("%d %d\n", i, buf[0]); // 打印接收到的数据
              buf[0] = !(i / 10 % 2); // 准备要发送的数据
              libusb_interrupt_transfer(hdev, 0x01, buf, 1, &len, 100); // 发送数据
          }
      }

  exit_device:
      libusb_close(hdev); // 关闭设备
  exit_lib:
      libusb_exit(ctx); // 关闭库
      return 0;
  }
  ```

<md-divider></md-divider>


## 驱动编译

  ```shell
  # 把main.c编译成test.exe 静态链接libusb1.0 具体解释见视频39:20
  gcc -o test.exe main.c -Wl,-Bstatic -lusb-1.0
  ```
