---
title: 21-midi
description: 单片机MIDI文件播放
---


## 相关资料

- [项目源码](http://git.scraft.top/kuresaru/STM32MIDI_F103C8T6)
- [MIDI文件格式 (百度百科)](https://baike.baidu.com/item/MIDI文件格式/8225161)
- [MIDI音符代码表 (百度文库)](https://wenku.baidu.com/view/abb1ed425acfa1c7ab00cc38.html)

<md-divider></md-divider>


## 电路连接

+ SD卡 -> SPI2
+ 串口调试接收->PA9
+ 蜂鸣器 -> PA1

<md-divider></md-divider>


## 蜂鸣器驱动电路

![蜂鸣器](./v3_static/img/msxzt/21-01-buzzer.jpg)

VCC:3.3v<br>
因为STM32初始化后默认是低电平<br>
所以选用NPN三极管驱动,高电平时导通<br>
电位器对输入信号分压<br>
达到调节音量效果.

<md-divider></md-divider>


## MIDI文件头

示例文件头(以Git中"av11629578.mid"文件为例)

(av号里这个视频我当了三年的闹钟铃声QAQ)

```
4D 54 68 64
00 00 00 06
00 01
00 04
00 60
```

MIDI文件也是RIFF格式存储的
+ 4D 54 68 64
    - "MThd"的ASCII码 可以根据这个判断一个文件是不是MIDI文件
+ 00 00 00 06
    - 后边有6个字节 MIDI文件这块都应该是6
+ 00 01
    - 同步多音轨格式 MIDI文件中最常见了 (然而后边处理的时候并没有理它)
+ 00 04
    - 文件一共有4个音轨 其中有一个是全局音轨(我也没理解呢)
+ 00 60
    - 在类型1中是一个四分音符(应该是指一拍)的Tick数
    - 这个数字要保存好 后面要用
    - 0x60 就是一拍96Tick

<md-divider></md-divider>


## MIDI音轨

这个文件中有4个音轨 前三个只有歌曲名/乐器名等信息 取最后一个主要的用来说明

```
4D 54 72 6B 00 00 03 DD ......
```

+ 4D 54 72 6B
    - "MTrk"的ASCII码 标识着一个音轨的开始
+ 00 00 03 DD
    - 音轨的数据长度 除这8字节以外 后边还有0x3DD个字节

<md-divider></md-divider>


## MIDI事件

MIDI中大部分都是事件消息 如在什么时间按下哪个乐器哪个键 什么时候松开哪个键...<br>
一个字节是8位 事件代码的最高位总是1 (事件代码的范围:0x80~0xFF)<br>
第一个字节是距上一个事件的延时(单位是Tick)<br>
第二个字节是事件代码<br>
后边跟着一个或多个数据<br>
那怎么区分是多个数据还是另一个事件呢<br>
看最高位咯~(皮)<br>
有一种事件是元(Meta)事件 代码是0xFF<br>
其它的事件用高4位区分事件 低4位区分通道<br>
就像0x80和0x81都是同一种事件<br>
只是一个0通道一个1通道

<md-divider></md-divider>


## 动态长度

现在想一个问题<br>
如果要存入数字65536 可以在文件中写入`00 01 00 00`<br>
这样占用了四个字节<br>
如果要存入数字1 就要写入`00 00 00 01`<br>
这样就会浪费三个字节的空间<br>
动态字节就可以用多少占多少<br>
利用高位标识是否结束<br>
例如要存入10 只需要写入`0A`<br>
要存入233时 因为只有7位可以用来存数据 所以需要用2字节<br>
233的二进制是`1110 1001`<br>
按7位分开 就是<code>000 0001  110 1001</code><br>
把除了低字节的数据 其它的最高位都写1<br>
这样就变成了`1000 0001  0110 1001`<br>
写入文件的16进制就是`81 69`<br>
下面贴上我的程序中读取动态长度的程序(最大读4个字节 超出直接按错误处理)

```c
//读取一个动态长度
u32 getDynamicLength()
{
    u32 tmp = 0;
    u8 data, i;
    for (i = 0; i < 4; i++)
    {
        tmp <<= 8;
        f_read(&file, &data, 1, &br);
        tmp |= data & 0x7F;
        if (!(data & 0x80))
        {
            i = 4; //break
        }
    }
    if (data & 0x80)
    {
        printf("Data out of range.\r\n");
    }
    return tmp;
}
```

<md-divider></md-divider>


## MIDI普通事件

事件的格式: <br>
延时时间 事件号 参数 \[参数2 \[参数n\]\]

1. 0x8* 松开音符事件

    2字节的数据: 音符号 力度 (音符号和音符的对应关系在相关资料第三个)<br>
    之前说过低4位代表通道号<br>
    所以0x80~0x8F都是同一个事件 只是通道不同

2. 0x9* 按下音符事件

    和上边的松开音符事件相对应<br>
    2字节数据: 音符号 力度 (有些文件里按下力度为0 表示松开音符 相当于8*事件)<br>
    还记得上边说过多个数据么<br>
    如`00 80 02 64 04 80 03 64`表示力度100(0x64)按下2号音符 4Tick后力度100按下3号音符<br>
    如`00 80 02 64 03 63 04 62`力度100按下2号音符 力度99按下3号音符 力度98按下4号音符(个人理解 没有验证正确性)

3. 0xA* 触后音符, 不了解

    2字节数据: 音符号 力度

4. 0xB* 控制器信息, 不了解

    2字节数据: 控制器号 参数

5. 0xC* 改变乐器, 不了解

    1字节数据: 乐器号

6. 0xD* 触后通道, 不了解

    1字节数据

7. 0xE* 滑音, 本工程中直接忽略没有处理

    2字节数据: 音高的低位 (pitch % 128) 音高的高位 (pitch / 128)

8. 0xF0 系统码, 不了解

    数据长度是动态长度

9. 0xFF 元事件 后面讲

<md-divider></md-divider>


## MIDI元事件

这里只讲最重要的元事件<br>
元事件格式: 延时时间 FF 元事件号 数据长度 数据

1. 0x51

    指定音轨速度(单位微秒) 重要数据, 后面讲解

2. 0x2F

    音轨的结束标识 所有音轨的最后一定是`00 FF 2F 00`

现在看一下前边示例文件中的第二音轨:

```
4D 54 72 6B
00 00 00 0B
00 FF 51 03 07 35 79
00 FF 2F 00
```

4D 54 72 6B 是MTrk 前边提到过<br>
00是延时 FF是元事件 03是后边有3字节的数据<br>
现在算一下数据0x073579转换成10进制是472441, 单位是微秒<br>
还记得之前文件头里读出来的一拍是96Tick么<br>
所以一Tick的时间就是 472.441 / 96 = 4.9212604166ms<br>
在本工程中使用了定时器1计算Tick延时时间

定时器1初始化程序
```c
RCC_APB2PeriphClockCmd(RCC_APB2Periph_TIM1, ENABLE);
TIM_TimeBaseInitTypeDef TIM_TimeBaseInitStructure;
TIM_TimeBaseInitStructure.TIM_ClockDivision = TIM_CKD_DIV1;
TIM_TimeBaseInitStructure.TIM_CounterMode = TIM_CounterMode_Up;
TIM_TimeBaseInitStructure.TIM_Prescaler = 36 - 1; //2MHz
TIM_TimeBaseInitStructure.TIM_Period = 0;
TIM_TimeBaseInitStructure.TIM_RepetitionCounter = 0;
TIM_TimeBaseInit(TIM1, &TIM_TimeBaseInitStructure);
```

定时器1的时钟是72MHz, 36分频到2MHz, 周期就是0.5us<br>
后面解析到元数据的0x51时 计算得到数据后设置Period(TIMx->ARR)的值

```c
case 0x51: //指定速度
Speed = 0;
for (i = 0; i &lt; length; i++)
{
    Speed &lt;&lt;= 8;
    f_read(&file, &data, 1, &br);
    Speed |= data;
}
printf("%ldus per beat.\r\n", Speed);
u16 tick2Time = Speed * 2 / MIDI_Head.Time; //半个tick的时间
TIM1->ARR = tick2Time;                      //设置定时器1的溢出时间就是1个Tick
printf("2Tick Time %dus\r\n", tick2Time);
break;
```

在上面的示例文件中 Speed=472441 Time=96<br>
uint16_t tick2Time = 472441*2/96 = 9842 (整数型 后面小数忽略 但这样造成了误差)<br>
定时器频率=2,000,000Hz/9842=203.210729...Hz<br>
定时器周期=9842/2,000=4.921ms (然而这些都不重要 只要把Period的值计算出来)

<md-divider></md-divider>


## 把音符号变成频率 (定时器值计算)

MIDI音符号的范围是0x00~0x7F(0-127)<br>
钢琴键盘只有88个按键..<br>
看一下上边的音符代码表(资料3)<br>
钢琴第一个键是B0 在代码表里是23号<br>
现在就有了音符代码和钢琴键/音高的对应关系<br>
在本工程中使用了定时器2通道2输出PWM信号驱动蜂鸣器<br>
通过设置Prescaler预分频(TIMx->PSC)调节频率

先看一下定时器的初始化 应该不用解释
```c
RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM2, ENABLE);
RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA | RCC_APB2Periph_AFIO, ENABLE);
GPIO_InitTypeDef GPIO_InitStructure;
GPIO_InitStructure.GPIO_Pin = GPIO_Pin_1;
GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF_PP;
GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
GPIO_Init(GPIOA, &GPIO_InitStructure);
TIM_TimeBaseInitTypeDef TIM_TimeBaseInitStructure;
TIM_TimeBaseInitStructure.TIM_ClockDivision = TIM_CKD_DIV1;
TIM_TimeBaseInitStructure.TIM_CounterMode = TIM_CounterMode_Up;
TIM_TimeBaseInitStructure.TIM_Prescaler = 0;
TIM_TimeBaseInitStructure.TIM_Period = 72 - 1;
TIM_TimeBaseInitStructure.TIM_RepetitionCounter = 0;
TIM_TimeBaseInit(TIM2, &TIM_TimeBaseInitStructure);
TIM_OCInitTypeDef TIM_OCInitStructure;
TIM_OCInitStructure.TIM_OCMode = TIM_OCMode_PWM2;
TIM_OCInitStructure.TIM_OutputState = TIM_OutputState_Enable;
TIM_OCInitStructure.TIM_OutputNState = TIM_OutputNState_Disable;
TIM_OCInitStructure.TIM_Pulse = 36;
TIM_OCInitStructure.TIM_OCPolarity = TIM_OCPolarity_High;
TIM_OCInitStructure.TIM_OCNPolarity = TIM_OCNPolarity_Low;
TIM_OC2Init(TIM2, &TIM_OCInitStructure);
```

在工程中有一个文件是notes.c<br>
这个文件的数据是[社会易姐QwQ](https://space.bilibili.com/293793435/)在Arduino某库中提取出来的(我搞不懂Arduino)
然后写成了数组<br>
数组内容就是音高和频率的对应关系

```c
else if (data <= 0x9F)
{
    //按下音符
    currentCode = data;
    u8 note, velocity;
    f_read(&file, &note, 1, &br);
    f_read(&file, &velocity, 1, &br);
    note -= 23;
    u16 psc = 1000000 / notes[note];
    printf("Next play %d, psc=%d\r\n", note, psc);
    TIM2->PSC = psc;
    TIM2->CR1 |= TIM_CR1_CEN;
}
```

<md-divider></md-divider>


## 本工程缺点

MIDI文件的各音轨应该同步播放<br>
但本工程为了简单 把各音轨按顺序解析<br>
就算解析了多音轨同步或多音符和弦..<br>
那一个蜂鸣器发出单音调..也发不出来吧
