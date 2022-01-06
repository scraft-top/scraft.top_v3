## 实验环境

  + 单片机: STC15F2K60S2 @22.1184MHz
  + USB: CH375
  + 编辑器: code
  + 编译器: SDCC 4.0.0

<md-divider></md-divider>

## 相关资料

  + [USB 2.0 Specification (只要里边的usb_20.pdf)](https://usb.org/sites/default/files/usb_20_20210701.zip)
  + [USB HID 1.11](https://www.usb.org/sites/default/files/hid1_11.pdf)
  + [USB HID Usage Tables (HUT)](https://usb.org/sites/default/files/hut1_22.pdf)
  + [CH372技术手册1 (CH372DS1.PDF)](http://www.wch.cn/downloads/CH372DS1_PDF.html)
  + [CH372技术手册2 (CH372DS2.PDF)](http://www.wch.cn/downloads/CH375DS2_PDF.html)
  + [CH375技术手册1 (CH375DS1.PDF)](http://www.wch.cn/downloads/CH375DS1_PDF.html)
  + [本章节程序源码参考](https://github.com/kuresaru/CH375_51_Device_HID_Keyboard_Mouse)
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
  | ET0 | #INT \[!!这次改用了外部中断0] |
  | P37 | A0    |
  | P41 | #CS   |
  | P42 | #RD   |
  | P44 | #WR   |


<md-divider></md-divider>


## HID键盘鼠标要点

  1. HID类接口描述符 鼠标键盘协议
  2. HID描述符(HID特有)
  3. 报告描述符(HID特有描述符)(定义HID设备的传输协议)
  4. 中断传输端点

<md-divider></md-divider>


## 配置描述符

  + 示例程序配置描述符

    ```c
    #define bwVal(x) ((x)&0xFF), (((x) >> 8) & 0xFF)
    #define CFGDES_SIZE (9 + 9 + 9 + 7 + 9 + 9 + 7 + 7)

    uint8_t __code ConfigurationDescriptor[CFGDES_SIZE] = {
      // 配置描述符(头)
      9,                  // bLength
      0x02,               // bDescriptorType
      bwVal(CFGDES_SIZE), // wTotalLength
      2,                  // bNumInterfaces
      1,                  // bConfigurationValue
      0,                  // iConfiguration
      0xE0,               // bmAttributes (!!注意一定要标识支持远程唤醒)
      250,                // bMaxPower
      // interface 鼠标接口
      9,    // bLength
      0x04, // bDescriptorType  接口描述符
      0x00, // bInterfaceNumber 第0个接口
      0,    // bAlternateSetting
      1,    // bNumEndpoints    接口有1个端点
      0x03, // bInterfaceClass (HID)
      0x01, // bInterfaceSubClass (Boot Interface)
      0x02, // bInterfaceProtocol (Mouse)
      0,    // iInterface
      // hid描述符
      9,                                     // bLength
      0x21,                                  // bDescryptorType
      0x00, 0x01,                            // bcdHID
      0x00,                                  // bContryCode  国家代码 比如日本键盘不一样
      1,                                     // bNumDescryptors 这个hid里有一个报告描述符
      0x22,                                  // bDescriptorType 类型代码:报告描述符
      bwVal(sizeof(ReportDescriptor_Mouse)), // wDescriptorLength 报告描述符长度
      // endpoint 端点(鼠标)
      7,          // bLength
      0x05,       // bDescriptorType
      0x81,       // bEndpointAddress(IN1)
      0x03,       // bmAttributes(Interrupt)
      0x04, 0x00, // wMaxPacketSize (包长度4字节)
      0x06,       // bInterval (2^(n-1)) (1-16)  2^(6-1)=32ms  31.25Hz
      // interface 键盘接口
      9,    // bLength
      0x04, // bDescriptorType
      0x01, // bInterfaceNumber
      0,    // bAlternateSetting
      2,    // bNumEndpoints 接口有2个端点 (按键和灯)
      0x03, // bInterfaceClass (HID)
      0x01, // bInterfaceSubClass (Boot Interface)
      0x01, // bInterfaceProtocol (Keyboard)
      0,    // iInterface
      // hid描述符
      9,                                        // bLength
      0x21,                                     // bDescryptorType
      0x00, 0x01,                               // bcdHID
      0x00,                                     // bContryCode
      1,                                        // bNumDescryptors
      0x22,                                     // bDescriptorType
      bwVal(sizeof(ReportDescriptor_Keyboard)), // wDescriptorLength
      // endpoint 键盘输入端点(键)
      7,          // bLength
      0x05,       // bDescriptorType
      0x82,       // bEndpointAddress(IN2)
      0x03,       // bmAttributes(Interrupt)
      0x08, 0x00, // wMaxPacketSize (包长度8字节)
      0x06,       // bInterval (2^(n-1)) (1-16)  2^(6-1)=32ms  31.25Hz
      // endpoint 键盘输出端点(灯)
      7,          // bLength
      0x05,       // bDescriptorType
      0x02,       // bEndpointAddress(OUT2)
      0x03,       // bmAttributes(Interrupt)
      0x01, 0x00, // wMaxPacketSize (包长度1字节)
      0x00,       // bInterval
    };
    ```

  + HID类代码是3

    ![HID类代码](/v3_static/img/usb/hid_class_code.jpg)

  + HID描述符

    ![HID描述符](/v3_static/img/usb/hid_descriptor.jpg)

  + HID类特有描述符类型表

    ![描述符类型](/v3_static/img/usb/hid_class_descriptor_types.jpg)

<md-divider></md-divider>


## 报告描述符

  报告描述符像一个配置文件, 规定着这个设备的传输协议. 这个"配置文件"有它自己的语法, 最后写成描述符的是"编译"后的结果.

  报告描述符编码方式有亿点复杂, 以后单独编写. 暂时可自行参考HID文档 6.2.2. 或者理解示例中的意思就好(这段示例部分来自HID文档示例+简单修改).

  鼠标键盘报告描述符内容定义在HUT文档 第31页 4 Generic Desktop Page (0x01)

  + 示例鼠标键盘报告描述符定义的协议(有些时候主机不会检查报告描述符,为了兼容性一定要实现这个协议)

    - 鼠标

      | Offset | Data |
      | ---: | :--- |
      | 0 | \[7:5]: 固定0 |
      |   | \[4]: 前进 |
      |   | \[3]: 后退 |
      |   | \[2]: 中键 |
      |   | \[1]: 右键 |
      |   | \[0]: 左键 |
      | 1 | 指针X轴 |
      | 2 | 指针Y轴 |
      | 3 | 滚轮轴 |

    - 键盘

      | Offset | Data |
      | ---: | :--- |
      | 0 | \[7]: RWin |
      |   | \[6]: RAlt |
      |   | \[5]: RShift |
      |   | \[4]: RCtrl |
      |   | \[3]: Win |
      |   | \[2]: Alt |
      |   | \[1]: Shift |
      |   | \[0]: Ctrl |
      | 1 | 固定0 |
      | 2 | 按下的键码1 |
      | 3 | 按下的键码2 |
      | 4 | 按下的键码3 |
      | 5 | 按下的键码4 |
      | 6 | 按下的键码5 |
      | 7 | 按下的键码6 |

  + 示例鼠标键盘报告描述符和"编译"前的原文

    ```c
    uint8_t __code ReportDescriptor_Mouse[] = {
        0x05, 0x01, // Usage Page (Generic Desktop)
        0x09, 0x02, // Usage (Mouse)
        0xA1, 0x01, // Collection (Application)
        0x09, 0x01, //   Usage (Pointer)
        0xA1, 0x00, //   Collection (Physical)
        0x05, 0x09, //     Usage Page (Buttons)    按钮
        0x19, 0x01, //     Usage Minimum (1)       按键号1~5
        0x29, 0x05, //     Usage Maximum (5)
        0x15, 0x00, //     Logical Minimum (0)     逻辑值0~1
        0x25, 0x01, //     Logical Maximum (1)
        0x95, 0x05, //     Report Count (5)        一共5个 每个1位 绝对值
        0x75, 0x01, //     Report Size (1)
        0x81, 0x02, //     Input (Data, Variable, Absolute)
        0x95, 0x01, //     Report Count (1)        加3位常量 填充到一字节
        0x75, 0x03, //     Report Size (3)
        0x81, 0x01, //     Input (Constant)
        0x05, 0x01, //     Usage Page (Generic Desktop)  桌面(鼠标指针)XY轴和滚轮轴
        0x09, 0x30, //     Usage (X)
        0x09, 0x31, //     Usage (Y)
        0x09, 0x38, //     Usage (Wheel)
        0x15, 0x81, //     Logical Minimum (-127)  逻辑值-127~127
        0x25, 0x7F, //     Logical Maximum (127)
        0x75, 0x08, //     Report Size (8)         每个8位 一共3个 相对值
        0x95, 0x03, //     Report Count (3)
        0x81, 0x06, //     Input (Data, Variable, Relative) 
        0xC0,       //   End Collection
        0xC0,       // End Collection
    };

    uint8_t __code ReportDescriptor_Keyboard[] = {
        0x05, 0x01, // Usage Page (Generic Desktop)
        0x09, 0x06, // Usage (Keyboard)
        0xA1, 0x01, // Collection (Application)
        0x05, 0x07, //   Usage Page (Key Codes)    键盘键码
        0x19, 0xE0, //   Usage Minimum (224)
        0x29, 0xE7, //   Usage Maximum (231)
        0x15, 0x00, //   Logical Minimum (0)
        0x25, 0x01, //   Logical Maximum (1)
        0x75, 0x01, //   Report Size (1)
        0x95, 0x08, //   Report Count (8)
        0x81, 0x02, //   Input (Data, Variable, Absolute)  ; Modifier byte
        0x95, 0x01, //   Report Count (1)
        0x75, 0x08, //   Report Count (8)
        0x81, 0x01, //   Input (Constant)                  ; Reserved byte
        0x95, 0x05, //   Report Count (5)
        0x75, 0x01, //   Report Size (1)
        0x05, 0x08, //   Usage Page (Page# for LEDs)
        0x19, 0x01, //   Usage Minimum (1)
        0x29, 0x05, //   Usage Maximum (5)
        0x91, 0x02, //   Output (Data, Variable, Absolute) ; LED report
        0x95, 0x01, //   Report Count (1)
        0x75, 0x03, //   Report Size (3)
        0x91, 0x01, //   Output (Constant)                 ; LED report padding
        0x95, 0x06, //   Report Count (6)
        0x75, 0x08, //   Report Size (8)
        0x15, 0x00, //   Logical Minimum (0)
        0x25, 0x65, //   Logical Maximum (101)
        0x05, 0x07, //   Usage Page (Key Codes)
        0x19, 0x00, //   Usage Minimum (0)
        0x29, 0x65, //   Usage Maximum (101)
        0x81, 0x00, //   Input (Data, Array)               ; Key arrays (6 bytes)
        0xC0,       //  End Collection
    };
    ```

<md-divider></md-divider>


## 发送报告描述符

  在SETUP请求中加入报告描述符的响应

  ```c
  // case 0x0C:        // ep0 setup
  //    // ......
  //
  //     CurrentSetupRequest = buf[1]; // bRequest
  //     switch (CurrentSetupRequest)
  //     {
  //     case 0x06:      // get descriptor
  //        i = buf[3]; // descriptor type
  //        switch (i)
  //        {
  //        case 0x01: // device descriptor
  //            // ......
  //
  //        case 0x02: // configuration descriptor
  //            // ......
  //
            case 0x22: // hid report descriptor
                if (buf[4] == 0)
                {
                    CurrentDescriptor = ReportDescriptor_Mouse;
                    CurrentDescriptor_Size = sizeof(ReportDescriptor_Mouse);
                }
                else if (buf[4] == 1)
                {
                    CurrentDescriptor = ReportDescriptor_Keyboard;
                    CurrentDescriptor_Size = sizeof(ReportDescriptor_Keyboard);
                }
                else
                {
                    CurrentDescriptor = 0;
                }
                break;
  ```

<md-divider></md-divider>


## 发送鼠标键盘数据

  ```c
  __bit keyboard_down_flag = 0;
  void T0_Isr() __interrupt(1) // 32ms中断一次 和中断端点描述符中的时间保持一致
  {
      int8_t mouse_x, mouse_y, mouse_wheel;
      uint8_t mouse_btn;
      Joy_Sync();  // 读取遥控手柄的数据
      if (configured)  // 只在USB正确配置后(已连接)才发送数据
      {
          // mouse
          mouse_btn = ((!(Joy_Btn2 & JOY_BTN2_L1)) << 0) |
                      ((!(Joy_Btn2 & JOY_BTN2_R1)) << 1) |
                      ((!(Joy_Btn2 & JOY_BTN2_L2)) << 3) |
                      ((!(Joy_Btn2 & JOY_BTN2_R2)) << 4);  // 计算鼠标按键对应的bit
          mouse_x = (Joy_RX - 0x80) / 4;  // 指针x
          mouse_y = (Joy_RY - 0x7F) / 4;  // 指针y
          mouse_wheel = (!(Joy_Btn1 & JOY_BTN1_DOWN)) ? -1 : ((!(Joy_Btn1 & JOY_BTN1_UP)) ? 1 : 0); // 滚轮
          wr_cmd(0x2A); // wr usb data5 EP1_IN
          wr_data(4);   // 发送4字节的鼠标数据
          wr_data(mouse_btn);
          wr_data(mouse_x);
          wr_data(mouse_y);
          wr_data(mouse_wheel);
          // keyboard
          if (!(Joy_Btn2 & JOY_BTN2_SQUARE))  // 按下方键发送Ctrl+Shift+ESC
          {
              keyboard_down_flag = 1;  // 标记键盘已经按下
              wr_cmd(0x2B); // wr usb data7 EP2_IN
              wr_data(8);   // 发送8字节键盘数据
              wr_data(0b00000011);  // 左Ctrl Shift为1
              wr_data(0x00);
              wr_data(0x29); // ESC的键码是0x29
              wr_data(0x00);
              wr_data(0x00);
              wr_data(0x00);
              wr_data(0x00);
              wr_data(0x00);
          }
          else if (keyboard_down_flag) // 如果之前键盘按下了而现在没有按下 发送抬起
          {
              keyboard_down_flag = 0; // 标记没有按下 之后不用再发送抬起了
              wr_cmd(0x2B);
              wr_data(8);
              wr_data(0);   // 8字节的数据全是0代表没有键按下
              wr_data(0);
              wr_data(0);
              wr_data(0);
              wr_data(0);
              wr_data(0);
              wr_data(0);
              wr_data(0);
          }
      }
  }
  ```

<md-divider></md-divider>


## 接收键盘LED指示灯

  ```c
  // 处理键盘OUT端点中断

  // switch (i)
  // {
  // case 0x0C:        // ep0 setup
  //     // ......
  // 
  // case 0x08:        // ep0 in
  //     // ......
  // 
  // case 0x00:        // ep0 out
  //     // ......
  //
     case 0x02:         // ep2 out
         wr_cmd(0x28);  // rd usb data
         rd_data(&len); // read length
         for (i = 0; i < len; i++)
         {
             rd_data(buf + i);
         }
         LEDn = !(buf[0] & 0x01); // 把NumLock灯显示在LED上
         break;
  ```
