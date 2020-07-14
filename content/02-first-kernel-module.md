---
title: 02-first-kernel-module
description: 第一个内核模块
---


## 实验环境

+ 操作系统: CentOS 7.6

<md-divider></md-divider>


## 准备一个Makefile模板

```shell
[kuresaru@linux ~]$ mkdir test02
[kuresaru@linux ~]$ cd test02/
[kuresaru@linux test02]$ vim Makefile
```

```makefile
# --- 现在只修改标记的两个地方 ---
# 以后也会用到这个模板

# [修改1] 最后生成的名字(最后模块会叫test02)
NAME = test02
# [修改2] 内核开发源码的路径(主机内核源码的路径)
KDIR := /usr/src/kernels/$(shell uname -r)

obj-m := $(NAME).o
# [暂时先不管 以后解释] 源文件的名字.o
$(NAME)-objs := main.o
PWD := $(shell pwd)

# 注意下边缩进一定要用TAB 不能用空格
all:
    $(MAKE) -C $(KDIR) M=$(PWD) modules

clean: 
    -rm -rf *.o *.ko *.order $(NAME).mod.c Module.symvers

# 这两个也就是测试用一下 以后编译完直接把模块上传上去 根本用不到这个
load:
    insmod $(NAME).ko

unload:
    rmmod $(NAME)
```

<md-divider></md-divider>


## 编写模块主程序

vim: main.c
```c
// Makefile里写了main.o 所以这个文件名要是main.c
#include <linux/module.h>

// 加载时调用的函数 返回值int型
static __init int Test02_Init(void)
{
    // 内核模块没有标准输出 只能输出到日志 所以要用printk 后边KERN_INFO是日志等级
    printk(KERN_INFO "Hello Test02\n");
    // 返回0才会加载成功
    return 0;
}

// 卸载时调用的函数 无返回
static __exit void Test02_Exit(void)
{   
    printk(KERN_INFO "Test02 exited\n");
}

// 定义加载卸载函数
module_init(Test02_Init);
module_exit(Test02_Exit);

// 声明模块是GPL开源 后边有的库只提供给声明了GPL的模块
MODULE_LICENSE("GPL");   
```


<md-divider></md-divider>

## 编译并测试内核模块

```shell session
# 编译
# 同样把这个程序放到OrangePi上编译也可以运行(注意修改KDIR)
[kuresaru@linux test02]$ ls
main.c  Makefile
[kuresaru@linux test02]$ make
make -C /usr/src/kernels/3.10.0-957.21.3.el7.x86_64 M=/home/kuresaru/test02 modules
make[1]: 进入目录“/usr/src/kernels/3.10.0-957.21.3.el7.x86_64”
    CC [M]  /home/kuresaru/test02/main.o
    LD [M]  /home/kuresaru/test02/test02.o
    Building modules, stage 2.
    MODPOST 1 modules
    CC      /home/kuresaru/test02/test02.mod.o
    LD [M]  /home/kuresaru/test02/test02.ko
make[1]: 离开目录“/usr/src/kernels/3.10.0-957.21.3.el7.x86_64”

# 清空日志 加载模块 查看日志
[kuresaru@linux test02]$ sudo dmesg -C
[kuresaru@linux test02]$ sudo make load
insmod test02.ko
[kuresaru@linux test02]$ dmesg
[10016.627680] Hello Test02

# 清空日志 卸载模块 查看日志
[kuresaru@linux test02]$ sudo dmesg -C
[kuresaru@linux test02]$ sudo make unload
rmmod test02
[kuresaru@linux test02]$ dmesg
[10081.983114] Test02 exited
```