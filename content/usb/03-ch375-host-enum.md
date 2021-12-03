## 实验环境

  + 单片机: STC15F2K60S2 @22.1184MHz
  + USB: CH375
  + 编辑器: code
  + 编译器: SDCC 4.0.0

<md-divider></md-divider>

## 相关资料

  + [USB 2.0 Specification (只要里边的usb_20.pdf)](https://usb.org/sites/default/files/usb_20_20210701.zip)
  + [CH375技术手册1 (CH375DS1.PDF)](http://www.wch.cn/downloads/CH375DS1_PDF.html)
  + [CH375技术手册2 (CH375DS2.PDF)](http://www.wch.cn/downloads/CH375DS2_PDF.html)
  + [本章节程序源码参考](https://git.scraft.top/kuresaru/CH375_51_Host_EmumTest)
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

## Hello World

  同样是枚举, 只是换了一个方向(设备变主机), 流程和第一章节基本相同.

  1. 芯片复位+测试
  2. 切换主机空闲模式
  3. 等待设备连接
  4. 切换主机总线复位模式
  5. 切换主机正常模式
  6. 等待设备重新连接
  7. 取设备描述符
  8. 设置地址
  9. 取配置描述符


<md-divider></md-divider>

## 1. 芯片复位

  参考第一章节设备方式的芯片复位部分


<md-divider></md-divider>

## 2. 切换主机模式

  - 官方文档: CH375DS1 第3页 5.命令表

    + 代码: 0x15
    + 命令名: SET_USB_MODE
    + 输入数据: 模式代码
    + 输出数据: 操作状态(成功或失败, 代码见下)
    + 描述: 设置USB工作模式(执行时间20us)

  - 官方文档: CH375DS1 第3页 5.命令表 操作状态

    + 0x51(CMD_RET_SUCCESS): 操作成功
    + 0x5F(CMD_RET_ABORT): 操作失败

  - 官方文档: CH375DS1 第5页 5.9.SET_USB_MODE

    该命令设置USB工作模式。该命令需要输入1个数据，该数据是模式代码：

    + 模式代码为00H时切换到未启用的USB 设备方式（上电或复位后的默认方式）；
    + 模式代码为01H时切换到已启用的USB 设备方式，外部固件模式；
    + 模式代码为02H时切换到已启用的USB 设备方式，内置固件模式；
    + 模式代码为04H时切换到未启用的USB 主机方式；
    + **模式代码为05H时切换到已启用的USB 主机方式，不产生SOF包；**
    + **模式代码为06H时切换到已启用的USB 主机方式，自动产生SOF包；**
    + **模式代码为07H时切换到已启用的USB 主机方式，复位USB 总线；**

    在USB主机方式下，未启用是指不自动检测USB 设备是否连接，所以需要外部单片机检测；启用
    是指自动检测USB 设备是否连接，当USB设备连接或者断开时都会产生中断通知外部单片机。在切换
    到模式代码06H后，CH375 会自动定时产生USB 帧周期开始包SOF发送给已经连接的USB 设备。模式
    代码07H 通常用于向已经连接的USB设备提供USB总线复位状态，当切换到其它工作模式后，USB 总
    线复位才会结束。**建议在没有USB 设备时使用模式5，插入USB 设备后先进入模式7再换到模式6。**
    
    通常情况下，设置USB工作模式在20uS时间之内完成，完成后输出操作状态。

  - 示例

    ```c
    void chmod(uint8_t mode)
    {
        uint8_t tmp;
        wr_cmd(0x15); // SET_USB_MODE
        wr_data(mode);
        for (;;)
        {
            rd_data(&tmp);
            if (tmp == 0x51) // CMD_RET_SUCCESS
            {
                break;
            }
        }
    }
    ```

    ```c
    // 初始化

    chmod(5); // 默认主机空闲模式
    print("mode 5\r\n"); // 此时375在检测是否有设备插入,如果有设备插入,发出设备插入中断
    while (wait_interrupt() != 0x15) // 等待检测到USB设备连接事件
    {
    }
    chmod(7); // 切换到主机总线复位模式
    print("mode 7\r\n"); // 此时设备收到复位信号
    Delay30ms(); // 30ms复位时间
    chmod(6); // 切换到主机正常模式
    print("mode 6\r\n"); // 设备复位结束
    Delay30ms();
    while (wait_interrupt() != 0x15) // 等待检测到USB设备连接事件(等待设备复位结束)
    {
    }
    print("usb connected\r\n");
    ```


<md-divider></md-divider>

## 3. 获取设备描述符

  - 官方文档: CH375DS2 第1页 1.附加命令

    + 代码: 0x46
    + 命令名: GET_DESCR
    + 输入数据: 描述符类型 (1-设备 2-配置)
    + 输出数据: 中断
    + 描述: 控制传输：获取描述符

  - 官方文档: CH375DS2 第3页 1.11.GET_DESCR

    该命令是获取描述符的控制传输命令。该命令需要输入1 个数据，指定将要获取的描述符的类型，
    有效类型是1 或者2，分别对应于DEVICE 设备描述符和CONFIGURATION 配置描述符，其中，配置描
    述符还包括接口描述符和端点描述符。该命令用于简化标准USB 请求GET_DESCRIPTOR，CH375在命令
    执行完成后向单片机请求中断，单片机可以读取中断状态作为该命令的操作状态。如果操作状态是
    USB_INT_SUCCESS，则说明命令执行成功，否则说明命令执行失败。由于CH375 的控制传输缓冲区只
    有64个字节，所以当描述符的长度超过64 字节时，CH375将返回操作状态USB_INT_BUF_OVER，对于
    该USB设备，单片机可以通过ISSUE_TOKEN 或者ISSUE_TKN_X命令自行处理控制传输。

  - 作者说明

    CH375芯片把取描述符操作封装成了命令, 简化了操作. 但这个命令只能接收64字节以内的描述符.
    如果设备返回的描述符长度超过了64字节, 这个命令会报错, 只能手动发起控制传输进行取描述符操作.

    命令有参数有两种, 1取设备描述符, 2取配置描述符, 其它的描述符就只能手动发起控制传输了

  - 示例

    ```c
    // 发送取设备描述符的命令
    wr_cmd(0x46); // GET_DESCR
    wr_data(1); // device descriptor
    // 等待返回结果 判断是否成功
    haltif(wait_interrupt() != 0x14, "get device description error");
    // 读取返回的长度和结果(1字节长度+18字节设备描述符)
    wr_cmd(0x28); // read data
    rd_data(&len);
    for (i = 0; i < len; i++)
    {
        rd_data(buf + i);
    }
    // 按照之前的说明 设备描述符的长度一定是18字节 如果不是那么报错
    haltif((len < 18) || (buf[1] != 0x01), "get device description error");
    // 打印取到的设备描述符信息
    fpd("bDeviceClass=", buf[4]);
    fpd("bDeviceSubClass=", buf[5]);
    fpd("bDeviceProtocol=", buf[6]);
    print("idVendor=");
    print_8x(buf[9]);
    print_8x(buf[8]);
    print("\r\nidProduct=");
    print_8x(buf[11]);
    print_8x(buf[10]);
    print("\r\n");
    ```


<md-divider></md-divider>

## 4. 分配地址

  - 官方文档: CH375DS2 第1页 1.附加命令

    + 代码: 0x45
    + 命令名: SET_ADDRESS
    + 输入数据: 地址值
    + 输出数据: 中断
    + 描述: 控制传输：设置USB地址

  - 官方文档: CH375DS2 第3页 1.10.SET_ADDRESS

    该命令是设置USB 地址的控制传输命令。该命令需要输入1 个数据，指定新的USB设备地址，有
    效地址是00H～7FH。该命令用于简化标准USB请求SET_ADDRESS，CH375在命令执行完成后向单片机
    请求中断，单片机可以读取中断状态作为该命令的操作状态。如果操作状态是USB_INT_SUCCESS，则
    说明命令执行成功，否则说明命令执行失败。

  - 官方文档: CH375DS2 第1页 1.附加命令

    + 代码: 0x13
    + 命令名: SET_USB_ADDR
    + 输入数据: 地址值
    + 输出数据: 无
    + 描述: 设置USB 地址

  - 官方文档: CH375DS2 第2页 1.5.SET_USB_ADDR

    该命令设置USB设备地址。该命令需要输入1个数据，用于选择被操作的USB 设备的地址。复位
    后或者USB设备连接或者断开后，USB 设备地址总是00H，单片机通过默认地址00H与USB 设备通讯，
    如果通过标准USB 请求设置了USB 设备的地址，那么也必须通过该命令设置相同的USB设备地址，以
    便CH375 通过新地址与USB 设备通讯。

  - 作者说明

    获取设备描述符后可以对设备分配地址. 在分配地址后主机和设备才可以进行大量数据通信.
    在分配地址前USB会占用大量总线资源进行通信, 分配地址后通过地址区分总线上不同设备进行正常通信.
    正常情况下CH375只会连接一个USB设备, 所以这个地址可以设置为任意的有效值(1~127). 

    分配并设置完地址后还需要命令CH375之后的通信使用这个地址.

    (一个是告诉设备分配给自己的地址是什么, 另一个是告诉主机之后通信要找哪个地址)

  - 示例
    ```c
    wr_cmd(0x45); // SET_ADDRESS
    wr_data(4);   // 设置设备地址为4
    haltif(wait_interrupt() != 0x14, "set address error"); // 判断是否成功
    wr_cmd(0x13); // SET_USB_ADDR
    wr_data(4);   // 告诉CH375以后的通信对面地址是4
    print("set addr 4\r\n");
    ```


<md-divider></md-divider>

## 5. 获取配置描述符

  - 作者说明

    方法同获取设备描述符, 但要注意配置描述符有可能会超过64字节, 导致自动获取失败, 此时需要手动发起控制传输.

    (其实实现了手动获取后就没有必要再写自动获取了,示例中只是为了同时演示)

  - 官方文档: CH375DS1 第3页 5.命令表

    + 代码: 0x2B
    + 命令名: WR_USB_DATA7
    + 输入数据: 数据长度, 数据流
    + 输出数据: 无
    + 描述: 向USB主机端点的输出缓冲区写入数据块

  - 官方文档: CH375DS1 第6页 5.14.WR_USB_DATA7

    该命令向USB 主机端点的输出缓冲区或者USB端点2 的上传缓冲区写入数据块。首先写入的输入
    数据是数据块长度，也就是后续数据流的字节数。数据块长度的有效值是0至64，如果长度不为0，
    则单片机必须将后续数据逐个写入CH375。

  - 官方文档: CH375DS2 第1页 1.附加命令

    + 代码: 0x4E
    + 命令名: ISSUE_TKN_X
    + 输入数据: 同步标志, 事务属性
    + 输出数据: 中断
    + 描述: 发出同步令牌，执行事务

    + 同步标志: 如果位7为1 则位6为新的同步触发标志 00 或者01=保持当前同步触发标志不变 \[5:0]必须是0

  - 官方文档: CH375DS2 第3页 1.14.ISSUE_TKN_X

    该命令使CH375发出同步令牌，执行事务。该命令需要输入两个数据，分别是同步标志和事务属
    性。同步标志的位7 为主机端点的接收器的同步触发标志，位6 为主机端点的发送器的同步触发标志，
    位5～位0 必须为0。事务属性的低4 位指定事务的令牌PID，高4 位指定USB 设备的目的端点号。
    CH375在命令执行完成后向单片机请求中断，单片机可以读取中断状态作为该命令的操作状态。如果
    操作状态是USB_INT_SUCCESS，则说明命令执行成功，否则说明命令执行失败。该命令与ISSUE_TOKEN
    命令的唯一区别是该命令在执行事务前总是先设置同步触发标志（相当于再加上SET_ENDP?命令）

  - 官方文档: CH375DS2 第3页 1.15.ISSUE_TOKEN

    该命令使CH375发出令牌，执行事务。该命令需要输入1个数据，作为事务属性。事务属性的低
    4 位指定事务的令牌PID，高4 位指定USB 设备的目的端点号。CH375 在命令执行完成后向单片机请
    求中断，单片机可以读取中断状态作为该命令的操作状态。如果操作状态是USB_INT_SUCCESS，则说
    明命令执行成功，否则说明命令执行失败，单片机可以根据操作状态进一步分析失败原因。
    对于发送数据的SETUP 事务和OUT 事务，应该先通过WR_USB_DATA7 命令写入准备发送的数据，
    然后再通过ISSUE_TOKEN 命令执行事务；对于接收数据的IN 事务，应该先通过ISSUE_TOKEN 命令执
    行事务，当事务执行成功后，再通过RD_USB_DATA命令读出已经接收的数据。
    例如，事务属性字节为09H 时，则CH375 从USB 设备的默认端点0 接收数据；事务属性字节为
    21H 时，则CH375向USB设备的端点2 发送数据；事务属性字节为29H时，则CH375从USB设备的端
    点2 接收数据，该端点的地址是82H。

    下面是CH375 支持的USB令牌PID。
    | PID字节 | 名称 | 说明 |
    | :---: | :---: | :---: |
    | 0D | DEF_USB_PID_SETUP | 发起控制传输，发送建立数据 |
    | 01 | DEF_USB_PID_OUT | 执行OUT 事务，发送数据 |
    | 09 | DEF_USB_PID_IN | 执行IN 事务，接收数据 |

  - 示例
    ```c
    wr_cmd(0x46); // GET_DESCR  自动获取
    wr_data(2);  // configuration descriptor
    i = wait_interrupt();
    if (i == 0x14) // USB_INT_SUCCESS 获取成功
    {
        wr_cmd(0x28); // read data
        rd_data(&len);
        for (i = 0; i < len; i++)
        {
            rd_data(buf + i);
        }
        // 打印配置描述符中的设备类
        fpd("bInterfaceClass=", buf[12]);
        fpd("bInterfaceSubClass=", buf[13]);
        fpd("bInterfaceProtocol=", buf[14]);
    }
    else if (i == 0x17) // USB_INT_BUF_OVER 数据超长 需要手动传输
    {
        // 注意 就算数据不超长 以下操作同样可以获取描述符 所以可以只保留这一部分 去掉上边自动部分
        wr_cmd(0x2B); // WR_USB_DATA7
        wr_data(8);   // 构造8字节的取配置描述符请求 并写入主机发送缓冲区 (参考usb2.0 253页 9.4.3)
        wr_data(0x80); // bmRequestType 主机向设备发送
        wr_data(0x06); // bRequest GET_DESCRIPTOR
        wr_data(0x00); // wValueL 描述符序号(一般只有一个0号)
        wr_data(0x02); // wValueH 描述符类型(CONFIGURATION)
        wr_data(0x00); // wIndexL 一般固定0
        wr_data(0x00); // wIndexH 一般固定0
        wr_data(0x09); // wLengthL 要取的长度 暂时不知道还有多长 先取前9字节的头
        wr_data(0x00); // wLengthH

        wr_cmd(0x4E); // ISSUE_TKN_X  把刚才的取描述符请求发出去
        wr_data(0x00); // 同步标志不变
        wr_data(0x0D); // 发起控制传输
        haltif(wait_interrupt() != 0x14, "get cfgdesc error"); // 检查是否成功
        wr_cmd(0x28); // read data
        rd_data(&len);
        for (i = 0; i < len; i++)
        {
            rd_data(buf + i);
        }
        // 在头中取出配置描述符的总长度
        tmp16 = (buf[3] << 8) | buf[4];
        print("cfgdesc len=");
        print_16d(tmp16);
        print("\r\n");

        // 有了总长度就可以取所有的数据了
        wr_cmd(0x2B);
        wr_data(8);
        wr_data(0x80);
        wr_data(0x06);
        wr_data(0x00);
        wr_data(0x02);
        wr_data(0x00);
        wr_data(0x00);
        wr_data(tmp16 & 0xFF); // 长度变成了总长度
        wr_data((tmp16 >> 8) & 0xFF);

        wr_cmd(0x4E); // 发起控制传输
        wr_data(0x00);
        wr_data(0x0D);
        haltif(wait_interrupt() != 0x14, "get cfgdesc error");
        wr_cmd(0x28); // read data
        rd_data(&len);
        for (i = 0; i < len; i++)
        {
            rd_data(buf + i);
        }
        // 此时buf里是真正的配置描述符 打印显示出设备类
        fpd("bInterfaceClass=", buf[12]);
        fpd("bInterfaceSubClass=", buf[13]);
        fpd("bInterfaceProtocol=", buf[14]);
    }
    else
    {
        // 正常不会有这一种情况
        print("unknown error\r\n");
    }
    ```
