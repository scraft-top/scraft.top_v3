---
title: 04-gpio-driver
description: 内核控制GPIO输出
---


## 实验环境

+ 硬件: Orange PI Zero 512M
+ CPU: Allwiner H2+
+ 内核版本: 3.4.113
+ 操作系统: Armbian 版本忘了

<md-divider></md-divider>


## OrangePi zero 引脚图

![引脚图](../v3_static/img/linuxdev/04-00-opi-gpio.jpg)
(图片来自网络)

<md-divider></md-divider>


## 命令行控制GPIO

先来看一下用脚本(或命令行)是怎么控制GPIO的
```shell
#!/bin/bash
# 命令行Bash脚本控制GPIO输出
# 测试控制PA1
# 检查是否已经导出
if [ ! -e /sys/class/gpio/gpio1 ]
then
    # 没有导出,导出1号GPIO
    echo 1 > /sys/class/gpio/export
fi
# 设置为输出
echo out > /sys/class/gpio/gpio1/direction
# PA1开关3次
for i in {1..3}
do
    # 设置高电平
    echo high > /sys/class/gpio/gpio1/direction
    sleep 0.2 
    # 设置低电平
    echo low > /sys/class/gpio/gpio1/direction
    sleep 0.2 
done
# 释放PA1
echo 1 > /sys/class/gpio/unexport
```

<md-divider></md-divider>


## GPIO 编号

上面使用PA1时 使用的编号是1 这个1的来源...<br>
先不管后面数字 先说PA PB PC...<br>
PA=0\*32=0, PB=1\*32=32, PC=2\*32=64, 一组是32个(虽然实际上一组并没有32个)<br>
然后再加上编号就可以了<br>
举个栗子: PA0=0\*32+0=0, PA9=0\*32+9=9, PB3=1\*32+3=35, PC4=2\*32+4=68...<br>
提个问题: PL10的编号是多少?
<span>[查看答案]<md-tooltip>11 * 32 + 10 = 362</md-tooltip></span>

<md-divider></md-divider>


## 查看GPIO占用

有些GPIO已经被其它程序占用, 如红色STATUS-LED的PA17<br>
可以通过 /sys/kernel/debug/gpio 文件查看已经分配的GPIO
```shell session
root@orangepizero:~/gpioTest# cat /sys/kernel/debug/gpio 
GPIOs 0-383, platform/sunxi-pinctrl, sunxi-pinctrl:
    gpio-10  (gpiotest            ) out hi
    gpio-17  (red_led             ) out lo
    gpio-69  (?                   ) out hi
    gpio-202 (xradio_irq          ) in  lo
    gpio-354 (?                   ) out hi
    gpio-362 (green_led           ) out hi
```

**但这也不代表这些已经分配的就不能再用了! (下一篇解释)**

<md-divider></md-divider>


## 内核模块控制GPIO

终于到正片了..<br>
跟以前一样复制好Makefile, 在C文件里定义好入口出口函数<br>
东西不多, 直接上整个文件

gpio.c
```c
#include <linux/module.h>
#include <asm/gpio.h>     // GPIO头文件

// 用10号(PA10)作例子
static int gpio = 10; 

static int __init gpio_m_init(void)
{
    // 申请10号 (等于上面的 echo 10 > export)
    int result = gpio_request(gpio, "gpiotest");
    if (result == 0) {
        printk(KERN_INFO "GPIO request ok\n");
    } else {
        printk(KERN_ERR "GPIO request err\n");
        return -1; 
    }   
    // 设置为输出, 输出0(低电平) (等于上面的 echo out > gpio10/direction)
    gpio_direction_output(gpio, 0); 
    // 设置为高电平 (为了演示 上一条指令可以直接设置输出高) (等于上面的 echo high > gpio10/direction)
    gpio_set_value(gpio, 1); 
    return 0;
}

static void __exit gpio_m_exit(void)
{
    // 输出低电平 (等于上面的 echo low > gpio10/direction)
    gpio_set_value(gpio, 0); 
    // 释放 (等于上面的 echo 10 > unexport)
    gpio_free(gpio);
}

module_init(gpio_m_init);
module_exit(gpio_m_exit);

MODULE_LICENSE("GPL");
```

Makefile
```makefile
# 前边都用过了 就不再解释了 试着自己理解内容
NAME = GPIO_Test
KDIR := /usr/src/linux-headers-3.4.113-sun8i

obj-m := $(NAME).o
$(NAME)-objs := gpio.o
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

<md-divider></md-divider>


## 测试

根据页面开头的GPIO图 找到PA10和GND<br>
选用PA10就是因为它好找<br>
编译并加载模块 PA10就会输出高电平(3.3v)

```shell session
root@orangepizero:~/gpioTest# make
make -C /usr/src/linux-headers-3.4.113-sun8i M=/root/gpioTest modules
make[1]: Entering directory '/usr/src/linux-headers-3.4.113-sun8i'
    CC [M]  /root/gpioTest/gpio.o
    LD [M]  /root/gpioTest/GPIO_Test.o
    Building modules, stage 2.
    MODPOST 1 modules
    CC      /root/gpioTest/GPIO_Test.mod.o
    LD [M]  /root/gpioTest/GPIO_Test.ko
make[1]: Leaving directory '/usr/src/linux-headers-3.4.113-sun8i'
root@orangepizero:~/gpioTest# make load
insmod GPIO_Test.ko
```

![PA10_HIGH](../v3_static/img/linuxdev/04-01-pa10-high.jpg)

GPIO分配里也能查到被这个模块占用了
```shell session
root@orangepizero:~/gpioTest# cat /sys/kernel/debug/gpio 
GPIOs 0-383, platform/sunxi-pinctrl, sunxi-pinctrl:
    gpio-10  (gpiotest            ) out hi
    gpio-17  (red_led             ) out lo
    gpio-69  (?                   ) out hi
    gpio-202 (xradio_irq          ) in  lo
    gpio-354 (?                   ) out hi
    gpio-362 (green_led           ) out hi
```

卸载模块 PA10变回低电平(0v)
```shell session
root@orangepizero:~/gpioTest# make unload
rmmod GPIO_Test
```
