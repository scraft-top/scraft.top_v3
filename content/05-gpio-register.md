---
title: 05-gpio-register
description: 修改寄存器控制GPIO输出
---


## 实验环境

+ 硬件: Orange PI Zero 512M
+ CPU: Allwiner H2+
+ 内核版本: 3.4.113
+ 操作系统: Armbian 版本忘了

<md-divider></md-divider>


## 相关资料

+ [内核延时官方说明](https://www.kernel.org/doc/Documentation/timers/timers-howto.txt)

<md-divider></md-divider>


## 找到寄存器地址

上一页的用函数控制GPIO, 在GPIO已经被占用的情况下不能再用函数去控制.<br>
那么可以通过直接改写内存中对应地址的数据对GPIO进行操作.<br>
根据全志H3的芯片手册找到PIO寄存器地址为 0x01C20800.<br>
再根据手册找到GPIOA数据寄存器的偏移为 0x10.<br>
这是一个32位UINT型变量, 类似于STM32的ODR寄存器.

<md-divider></md-divider>


## 修改寄存器数据

 虽然在上面找到了寄存器的地址...但是在Linux内核中是不能直接访问到这个地址的.<br>
在Linux内核中, 这些寄存器地址都映射到了一个比较高的地址.<br>
所以需要先找到这个虚拟地址, 通过修改这个虚拟地址的数据达到修改GPIO数据目的.

main.c
```c
#include <linux/module.h>
#include <linux/delay.h>
#include <asm/io.h>

#define PIO_BASE ((uint32_t)0x01C20800)         // PIO寄存器地址
#define PA_DATA_BASE ((uint32_t)PIO_BASE+0x10)  // GPIOA寄存器地址

static volatile uint32_t *PA_DATA_VREG;         // GPIOA虚拟寄存器指针变量

static __init int MapLed_Init(void)
{
    // 映射虚拟寄存器地址 uint是4字节
    PA_DATA_VREG = (uint32_t *)ioremap(PA_DATA_BASE, 4); 
    // PA17高电平
    *PA_DATA_VREG |= 1 << 17; 
    // 延时500ms, 根据官方资料, 大于20ms的延时需要用msleep_interruptible
    msleep_interruptible(500);
    // PA17低电平
    *PA_DATA_VREG &= ~((uint32_t)1 << 17);
    // 延时500ms
    msleep_interruptible(500);
    // PA17高电平
    *PA_DATA_VREG |= 1 << 17; 
    return 0;
}

static __exit void MapLed_Exit(void)
{
    // PA17低电平
    *PA_DATA_VREG &= ~((uint32_t)1 << 17);
    // 释放映射
    iounmap(PA_DATA_VREG);
}

module_init(MapLed_Init);
module_exit(MapLed_Exit);

MODULE_LICENSE("GPL");
```

<md-divider></md-divider>


## 编译测试

Makefile
```makefile
NAME = MapLed
KDIR := /usr/src/linux-headers-3.4.113-sun8i
obj-m := MapLed.o
$(NAME)-objs := main.o
PWD := $(shell pwd)
all:
    $(MAKE) -C $(KDIR) M=$(PWD) modules
clean: 
    -rm -rf *.ko *.o *.symvers modules.order $(NAME).*
load:
    insmod $(NAME).ko
unload:
    rmmod $(NAME)
```

加载运行
```shell session
# 编译
root@orangepizero:~/mapLedTest# make
make -C /usr/src/linux-headers-3.4.113-sun8i M=/root/mapLedTest modules
make[1]: Entering directory '/usr/src/linux-headers-3.4.113-sun8i'
    CC [M]  /root/mapLedTest/main.o
    LD [M]  /root/mapLedTest/MapLed.o
    Building modules, stage 2.
    MODPOST 1 modules
    CC      /root/mapLedTest/MapLed.mod.o
    LD [M]  /root/mapLedTest/MapLed.ko
make[1]: Leaving directory '/usr/src/linux-headers-3.4.113-sun8i'

# 加载模块, 同时红色LED闪烁一次并加载成功
root@orangepizero:~/mapLedTest# make load
insmod MapLed.ko

# 卸载模块, 同时红色LED熄灭
root@orangepizero:~/mapLedTest# make unload
rmmod MapLed
```

<md-divider></md-divider>


## LED到底被什么占用了

在Linux中有一种设备叫LED<br>
在系统中已经有这两个LED的驱动了

ledTest.sh
```shell
# 红色亮
echo 255 > /sys/class/leds/red_led/brightness
sleep 0.5 
#绿色灭
echo 0 > /sys/class/leds/green_led/brightness
sleep 0.5 
# 红灭绿亮
echo 0 > /sys/class/leds/red_led/brightness
echo 255 > /sys/class/leds/green_led/brightness
```
