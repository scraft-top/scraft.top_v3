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
  + [本章节程序源码参考](https://github.com/kuresaru/CH375_51_Device_EmumTest)
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
  | P36 | #INT  |
  | P37 | A0    |
  | P41 | #CS   |
  | P42 | #RD   |
  | P44 | #WR   |

<md-divider></md-divider>


## Hello World 十四步

  1. 芯片复位
  2. 芯片测试
  3. 外部固件从
  4. 连接
  5. 中断
  6. 总线复位
  7. 设备描述符
  8. 解锁
  9. 继续
  10. 接收
  11. 地址
  12. (设备描述符...)
  13. 配置描述符 9.6.3
  14. (继续...)

  补一张枚举时序图

  ![hello](./v3_static/img/usb/1-enum.png)

<md-divider></md-divider>


## 1. 芯片复位

  - 官方文档: CH372DS1 第2页 5.命令表

    + 代码: 0x05
    + 命令名: RESET_ALL
    + 输入数据: 无
    + 输出数据: 无
    + 描述: 执行硬件复位(执行后等40ms)

  - 官方文档: CH372DS1 第3页 5.3.命令RESET_ALL

    该命令使CH372执行硬件复位。通常情况下，硬件复位在40mS 时间之内完成。

  - 作者说明
    
    在程序的开始(初始化)需要对芯片进行复位操作

  - 示例

    ```c
    CSn = 0;
    wr_cmd(0x05); // 发送复位命令
    CSn = 1;
    Delay30ms();  // 等待60ms
    Delay30ms();
    ```

<md-divider></md-divider>


## 2. 芯片测试

  - 官方文档: CH372DS1 第2页 5.命令表

    + 代码: 0x06
    + 命令名: CHECK_EXIST
    + 输入数据: 任意一字节
    + 输出数据: 输入的取反值
    + 描述: 测试芯片是否正常工作

  - 官方文档: CH372DS1 第3页 5.4.CHECK_EXIST

    该命令测试工作状态，以检查CH372是否正常工作。该命令需要输入1个数据，可以是任意数据，
    如果CH372正常工作，那么CH372 的输出数据是输入数据的按位取反。例如，输入数据是57H，则输
    出数据是A8H。另外，在CH372复位后未收到任何命令之前，从其并口通常是读出数据00H。

  - 作者说明
    
    芯片复位后测试芯片是否正常工作, 正常情况下输入0x57会输出按位取反的结果(0xA8), 否则进行错误处理

  - 示例

    ```c
    // 定义用于错误处理的宏
    #define halt_ for (;;) {}
    #define haltif(cmp, msg) if (cmp) { print(msg "\r\n"); halt_ }

    uint8_t i;

    wr_cmd(0x06);  // 发送测试命令
    wr_data(0x57); // 发送测试数据
    rd_data(&i);   // 读出结果数据 (正常情况下会输出0x57的按位取反值0xA8)
    haltif(i != 0xA8, "check exist error"); // 如果不是A8 打印错误并停机
    print("check ok\r\n"); // 如果没有停机说明正常 打印正常
    ```

<md-divider></md-divider>


## 3. 设置工作模式为外部固件设备方式

  - 官方文档: CH372DS1 第3页 5.命令表

    + 代码: 0x15
    + 命令名: SET_USB_MODE
    + 输入数据: 模式代码
    + 输出数据: 操作状态(成功或失败, 代码见下)
    + 描述: 设置USB工作模式(执行时间20us)

  - 官方文档: CH372DS1 第3页 5.命令表 操作状态

    + 0x51(CMD_RET_SUCCESS): 操作成功
    + 0x5F(CMD_RET_ABORT): 操作失败

  - 官方文档: CH372DS1 第4页 5.7.SET_USB_MODE

    该命令设置USB工作模式。该命令需要输入1个数据，该数据是模式代码：

    + 模式代码为00H时切换到未启用的USB 设备方式（上电或复位后的默认方式）；
    + **模式代码为01H时切换到已启用的USB 设备方式，外部固件模式；**
    + 模式代码为02H时切换到已启用的USB 设备方式，内置固件模式。
    + 模式代码为04H时切换到未启用的USB 主机方式；
    + 模式代码为05H时切换到已启用的USB 主机方式，不产生SOF包；
    + 模式代码为06H时切换到已启用的USB 主机方式，自动产生SOF包；
    + 模式代码为07H时切换到已启用的USB 主机方式，复位USB 总线；

    关于外部固件模式请参考手册（二）。

    **在USB 设备方式下，未启用是指USB 总线D+的上拉电阻被禁止，相当于断开USB 设备；启用是**
    **指USB总线D+的上拉电阻有效，相当于连接USB 设备，从而使USB主机能够检测到USB设备的存在。**
    **通过设置是否启用，可以模拟USB 设备的插拔事件。**
    
    通常情况下，设置USB工作模式在20uS时间之内完成，完成后输出操作状态。

  - 作者说明
    
    未启用模式等于不插usb线. 内置固件模式是指USB枚举等操作全部由芯片硬件完成, 除vid/pid外无法自行配置(固定为端点1中断传输, 端点2批量传输), 程序中只需要自己实现端点数据传输. 外置固件模式是指USB的一切操作全部需要在程序中自己实现, 配置更灵活.

  - 示例

    ```c
    wr_cmd(0x15);  // 发送设置模式命令
    wr_data(0x01); // 设置为外部固件设备方式
    for (;;)       // 等待直到操作成功
    {
        rd_data(&i);
        if (i == 0x51)
        {
            break;
        }
    }
    print("set mode ok\r\n");
    ```

    如果前3步配置正确, 连接USB到电脑, 
    经过一段超时时间后可以在设备管理中看到
    "未知USB设备(设备描述符请求失败)/代码43"

<md-divider></md-divider>


## 5. 中断

  - 官方文档: CH372DS1 第3页 5.命令表

    + 代码: 0x22
    + 命令名: GET_STATUS
    + 输入数据: 无
    + 输出数据: 中断状态
    + 描述: 获取中断状态并取消请求

  - 官方文档: CH372DS1 第4页 5.8.GET_STATUS

    | 位 | 名称 | 状态 |
    | :-: | :-: | :-: |
    | [7:4] | 保留 | 总是0 |
    | [3:2] | 事务 | 00=OUT, 10=IN, 11=SETUP |
    | [1:0] | 端点 | 00=EP0, 01=EP1, 10=EP2, 11=总线复位 |

  - 作者说明
  
    端点0可能出现OUT/IN/SETUP事务, 端点1/2只可能出现OUT/IN事务. 
    写程序实现时可以先检查是不是OUT/IN/SETUP, 如果都不是再检查最低2位是不是复位信号.
    手册上还有两个中断事件(0x05,0x06)暂时不考虑.

  - 示例

    ```c
    // 等待中断并读取中断信号
    uint8_t poll_interrupt()
    {
        uint8_t i;
        while (INTn)  // 在有中断时#INT引脚会变低 等待来中断
        {
        }
        wr_cmd(0x22); // 中断发生, 发送读取中断命令
        rd_data(&i);  // 读取中断
        return i;     // 返回中断值
    }


    // 主程序中
    uint8_t i;
    while (1)  // 主循环  当然这个也可以改用外部中断处理函数(以后有示例)
    {
        i = poll_interrupt(); // 等待中断并读取中断信号
        print("INT=");        // 打印中断值
        print_8x(i);
        print("\r\n");
        switch (i)            // 判断并处理中断
        {
            // 处理中断...
        }
    }
    ```

<md-divider></md-divider>


## 6. 总线复位

  - 作者说明
  
    USB主机检测到设备连接时首先会发出总线复位信号, 通知设备准备进行通信初始化.
    在本节程序中只进行事件打印, 无任何其它处理逻辑.

  - 示例

    ```c
    switch (i) // 判断并处理中断
    {
        // (判断并处理OUT/IN/SETUP中断...)

    default:  // 不是OUT/IN/SETUP中断
        if ((i & 0x03) == 0x03) // 检查最低2位是11表示复位
        {
            print("bus reset\r\n");
        }
        wr_cmd(0x23); // 通知CH372处理完成 (解锁缓冲区)
        rd_data(&i);  // 通知CH372处理完成 (不知道为什么要再读一遍 这两个少一个都不行?)
        break;
    }
    ```

  - 官方文档: CH372DS1 第3页 5.命令表

    + 代码: 0x23
    + 命令名: UNLOCK_USB
    + 输入数据: 无
    + 输出数据: 无
    + 描述: 释放当前USB 缓冲区

  - 官方文档: CH372DS1 第5页 5.9.UNLOCK_USB

    该命令释放当前USB缓冲区。为了防止缓冲区覆盖，CH372 向单片机请求中断前首先锁定当前缓
    冲区，暂停所有的USB通讯，直到单片机通过UNLOCK_USB命令释放当前缓冲区，或者通过RD_USB_DATA
    命令读取数据后才会释放当前缓冲区。该命令不能多执行，也不能少执行。

  - 作者说明

    有些单片机处理速度比较慢, 这个设计是在一个事务没有处理完成时不接收下一个事务.
    但有些极慢的处理速度情况下USB主机会认为通信超时, 所以不能无限的慢. (STC89C52RC测试失败?)

    有时候写程序调试发现突然到了哪一步卡住不动了, 检查下是不是忘了unlock了?

<md-divider></md-divider>


## 7. 设备描述符

  - 作者说明
  
    所有枚举相关的通信全部通过端点0传输, 端点0一定是控制传输方式, 一个设备一定有端点0.

    主机通过设备描述符获取设备的支持协议相关等信息, 为后续通信做准备.

  - 官方文档: CH372DS1 第3页 5.命令表

    + 代码: 0x28
    + 命令名: RD_USB_DATA
    + 输入数据: 无
    + 输出数据: 1 byte数据长度 + n bytes数据
    + 描述: 从当前USB中断的端点缓冲区读取数据块并释放当前缓冲区

    + 作者说明: RD_USB_DATA0(0x27)和RD_USB_DATA(0x28)的区别

  - 官方文档: CH372DS1 第5页 5.11.RD_USB_DATA

    该命令从当前USB中断的端点缓冲区中读取数据块并释放当前缓冲区。首先读取的输出数据是数
    据块长度，也就是后续数据流的字节数。数据块长度的有效值是0至64，如果长度不为0，则单片机
    必须将后续数据从CH372逐个读取完；读取数据后，CH372自动释放USB当前缓冲区，从而可以继续
    接收USB 主机发来的数据。

    (5.10.RD_USB_DATA0的作用和它类似, 区别是RD_USB_DATA0不自动unlock, RD_USB_DATA读完后自动unlock)

  - 官方文档: CH372DS2 第1页 1.外部固件的附加命令

    + 代码: 0x29
    + 命令名: WR_USB_DATA3
    + 输入数据: 1 byte数据长度 + n bytes数据
    + 输出数据: 无
    + 描述: 向USB端点0的上传缓冲区写入数据块

  - 官方文档: CH372DS2 第2页 1.9.命令WR_USB_DATA3

    该命令向USB 端点0的上传缓冲区写入数据块。首先写入的输入数据是数据块长度，也就是后续
    数据流的字节数。数据块长度的有效值是0 至8，如果长度不为0，则单片机必须将后续数据逐个写
    入CH372。例如，通过该命令可以向USB主机返回USB 描述符的前8 个字节，完成后再通过多次执行
    该命令，返回USB 描述符的后续数据。

  - 官方文档: USB2.0 第248页 9.3 USB Device Requests 表9-2 Format of Setup Data

    ![USB2.0_Table9-2](./v3_static/img/usb/usb20t9-2.jpg)

    作者简单解释

    SETUP请求数据格式表  (长度固定为8)
    | 字节 | 字段 | 描述 |
    | -   | - | - |
    | 0   | bmRequestType | [7:7]: 数据传输方向: 0=主机发给设备,1=设备发给主机 |
    |     |               | [6:5]: 类型: 0=标准请求,1=类特有请求,2=制造商自定义请求,3保留 |
    | 1   | bRequest      | 请求代码 |
    | 2-3 | wValue        | 请求值 |
    | 4-5 | wIndex        | 请求参数 |
    | 6-7 | wLength       | 请求数据长度(不包括这8字节头) |

    字段名称前缀

    + bm: Bitmap/按位解释
    + b: Byte/一个字节
    + w: Word/两个字节
    + i: Index/字符串描述符序号
    + id: ID
    + bcd: BCD码

  - 官方文档: USB2.0 第250页 9.4 Standard Device Requests 表9-3 Standard Device Requests

    ![USB2.0_Table9-3](./v3_static/img/usb/usb20t9-3.jpg)

  - 官方文档: USB2.0 第251页 9.4 Standard Device Requests 表9-4 Standard Request Codes

    ![USB2.0_Table9-4](./v3_static/img/usb/usb20t9-4.jpg)

  - 官方文档: USB2.0 第251页 9.4 Standard Device Requests 表9-5 Descriptor Types

    ![USB2.0_Table9-5](./v3_static/img/usb/usb20t9-5.jpg)

  - 官方文档: USB2.0 第262页 9.6.Standard USB Descriptor Definitions 9.6.1.Device 表9-8 Standard Device Descriptor

    ![USB2.0_Table9-8](./v3_static/img/usb/usb20t9-8.jpg)

    作者简单解释

    | 字节 | 字段 | 描述 |
    | -     | - | - |
    | 0     | 该描述符长度 | 固定是18 |
    | 1     | 该描述符类型 | 固定是2 (见表9-5) |
    | 2-3   | 设备的协议版本 | 本设备实现的是哪个版本的协议 (2.0) |
    | 4     | 设备类码 | 设置为0代表以接口类为准 |
    | 5     | 子类码 | 设置为0代表以接口类为准 |
    | 6     | 设备协议码 | 暂时0,以后解释 |
    | 7     | 端点0最大包长 | 数字越大 端点0传输速度越快 |
    |       |            | 只能是8,16,32或64 |
    |       |            | CH372/CH375只支持8 |
    | 8-9   | 设备生产厂商代码 | 一般这个代码是从usbif买来的 |
    |       |              | (听说小厂设备一般使用USB主控厂商的代码?) |
    | 10-11 | 厂商产品代码 | 厂商自己定义, 用来区分自己厂商生产的不同设备 |
    | 12-13 | 产品版本代码 | 厂商自己定义, 用来区分一个产品的不同版本(注意是BCD码) |
    | 14    | 厂商名字符串序号 | 0代表无 |
    | 15    | 产品名字符串序号 | 0代表无 |
    | 16    | 序列号字符串序号 | 0代表无 |
    | 17    | 设备支持的配置数 | 大部分情况都是1 |

  - 示例

    ```c
    // 常量
    uint8_t __code DeviceDescriptor[18] = {
        18,             // bLength
        0x01,           // bDescriptorType
        0x00, 0x02,     // bcdUSB
        0x00,           // bDeviceClass
        0x00,           // bDeviceSubClass
        0x00,           // bDeviceProtocol
        8,              // bMaxPacketSize0 (CH372/CH375端点0最大单次传输8字节)
        0x34, 0x12,     // idVentor
        0x78, 0x56,     // idProduct
        0x01, 0x00,     // bcdDevice
        0,              // iManufacturer
        0,              // iProduct
        0,              // iSerialNumber
        1,              // bNumConfiguration
    };

    // 全局变量
    uint8_t CurrentSetupRequest = 0;
    const uint8_t *CurrentDescriptor;
    uint8_t CurrentDescriptor_Sent = 0;
    uint8_t CurrentDescriptor_Size = 0;


    uint8_t buf[8];
    switch (i) // 判断并处理中断
    {
    case 0x0C: // ep0 setup
      wr_cmd(0x28); // 发出读当前中断的缓冲区命令
      rd_data(&i);  // 返回的第一个字节是数据总长度
      if (i == 8)   // 根据上边格  SETUP数据长度一定是8
      {
        // 读8字节的数据
        for (i = 0; i < 8; i++)
        {
          rd_data(buf + i);
        }
        CurrentSetupRequest = buf[1]; // 暂时存下bRequest 后边要用
        print("SETUP=");
        print_8x(CurrentSetupRequest);
        print("\r\n");
        switch (CurrentSetupRequest) // 表9-4 标准请求代码
        {
        case 0x06: // 表9-4: 6=get descriptor
          i = buf[3]; 
          print("get desc ");
          print_8x(i);
          print("\r\n");
          switch (i) // 表9-5: descriptor type
          {
          case 0x01: // 表9-5: 1=device descriptor
            CurrentDescriptor = DeviceDescriptor;
            CurrentDescriptor_Size = 18;
            print("send device desc\r\n");
            break;
          }
          // 发送当前请求的描述符
          wr_cmd(0x29); // wr usb data3
          wr_data(8);
          for (i = 0; i < 8; i++)
          {
            wr_data(CurrentDescriptor[i]);
          }
          CurrentDescriptor_Sent = 8;
          wr_cmd(0x23); // unlock usb
          break;
        }
      }
      break;
    case 0x08: // ep0in (端点0发送完成事件) (in是相对主机的方向)
      wr_cmd(0x23); // unlock usb
      if ((CurrentSetupRequest == 0x06) && (CurrentDescriptor)) // 如果当前正在发送描述符
      {
        len = CurrentDescriptor_Size - CurrentDescriptor_Sent;
        len = (len > 8) ? 8 : len;
        wr_cmd(0x29); // wr usb data3
        wr_data(len);
        for (i = 0; i < len; i++)
        {
          wr_data(CurrentDescriptor[CurrentDescriptor_Sent]);
          CurrentDescriptor_Sent++;
        }
        print("send desc");
      }
      break;
    case 0x00: // ep0out (端点0收到数据(非SETUP)事件)
      wr_cmd(0x23); // unlock usb
      break;
    }
    ```

  - 到目前为止所有代码的逻辑

    ![1-struct-stage1](./v3_static/img/usb/1-struct-stage1.png)

<md-divider></md-divider>


## 11. 地址

  - 官方文档: CH372DS2 第1页 1.外部固件的附加命令

    + 代码: 0x13
    + 命令名: SET_USB_ADDR
    + 输入数据: USB地址
    + 输出数据: 无
    + 描述: 设置USB 地址

  - 官方文档: CH372DS2 第1页 1.1.命令SET_USB_ADDR

    该命令设置USB 设备地址。该命令需要输入1 个数据，在外部固件模式下，外部单片机处理完
    USB 标准设备请求SET_ADDRESS后，必须立即将USB主机分配的USB设备地址通过该命令写入CH372，
    以便CH372 启用新的USB 地址与USB 主机通讯。

  - 作者说明

    主机获取到了设备的主要信息后, 可以进行设置地址操作. 
    在收到主机分配地址请求后, 先回复空包(收到), 回复成功后再设置地址.
    地址设置完成后, 会通过设备地址再次请求完整的设备描述符.

  - 示例

    ```c
    // 全局变量
    uint8_t DeviceAddress = 0;


    // 中断处理 SETUP请求
    // (省略...)
    switch (CurrentSetupRequest)
    {
      // (省略...)
      case 0x05: // set address
      DeviceAddress = buf[2];
      wr_cmd(0x29); // wr usb data3
      wr_data(0);
      wr_cmd(0x23); // unlock usb
      break;
    }


    // 中断处理 ep0 in
    case 0x08:
    // (省略...)
    else if (CurrentSetupRequest == 0x05)
    {
        wr_cmd(0x13);
        wr_data(DeviceAddress);
        print("set address ");
        print_8d(DeviceAddress);
        print("\r\n");
    }
    ```

  - 到目前为止所有代码的逻辑 (本节新增逻辑用绿底色表示)

    ![1-struct-stage2](./v3_static/img/usb/1-struct-stage2.png)

<md-divider></md-divider>

## 13. 配置描述符

  - 作者说明
  
    配置描述符决定设备的具体功能. 设备的一切功能相关配置全部写进配置描述符. 配置描述符没有固定长度, 设备功能越复杂的, 配置描述符就越长. 本章的设备没有任何功能, 所以只包含一个最基本的配置描述符的头.

  - 官方文档: USB2.0 第265页 9.6.Standard USB Descriptor Definitions 9.6.3.Configuration 表9-10 Configuration

    ![USB2.0_Table9-10](./v3_static/img/usb/usb20t9-10.jpg)

    作者简单解释

    | 字节 | 字段 | 描述 |
    | -     | - | - |
    | 0     | 描述符长度 | 固定是9 |
    | 1     | 描述符类型 | 固定是1 (见表9-5) |
    | 2-3   | 配置总长度 | 配置描述符的总长度, 包括这9字节的头 |
    | 4     | 接口数 | 本配置有多少接口 |
    | 5     | 配置值 | 给这个配置起一个唯一的值(一般一个设备只有一个配置) |
    | 6     | 字符串序号 | 该配置的描述字符串序号 |
    | 7     | 特征 | [7:7]: 固定为1 |
    |       |     | [6:6]: 自供电 (告诉主机是否消耗USB总线的电能) |
    |       |     | [5:5]: 设备是否支持远程唤醒 |
    |       |     | [4:0]: 固定为0 |
    | 8     | 最大电流 | 这个设备消耗USB总线的最大电流 |
    |       |        | 单位是2mA, 例100mA填50    |
    

  - 示例
  
    ```c
    // 常量
    #define wVal(x) ((x) & 0xFF), (((x) >> 8) & 0xFF)
    #define CFGDES_SIZE (9)
    uint8_t __code ConfigurationDescriptor[CFGDES_SIZE] = {
        9,                  // bLength
        0x02,               // bDescriptorType
        wVal(CFGDES_SIZE),  // wTotalLength
        0,                  // bNumInterfaces  [[]]
        1,                  // bConfigurationValue
        0,                  // iConfiguration
        0x80,               // bmAttributes
        250,                // bMaxPower
    };


    // 中断处理
    // (省略)...
    case 0x0C: // ep0 setup
      // (省略)...
      case 0x06: // get descriptor
        // (省略)...
        case 0x02: // configuration descriptor
          CurrentDescriptor = ConfigurationDescriptor;
          CurrentDescriptor_Size = CFGDES_SIZE;
          print("send config desc\r\n");
          break;
    ```

  - 到目前为止所有代码的逻辑

    ![1-struct-stage3](./v3_static/img/usb/1-struct-stage3.png)
