---
title: 03-char-device-driver
description: 编写字符设备驱动程序
---

## 什么是字符设备

- 字符设备：字符设备是能够像字节流一样被访问的设备，当对字符设备发出读写请求，
相应的I/O 操作立即发生。Linux 系统中很多设备都是字符设备，如字符终端、串口、键盘、
鼠标等。在嵌入式Linux 开发中，接触最多的就是字符设备以及驱动。<br/>
(摘自《嵌入式Linux开发教程(下册)-周立功.pdf》)

- 字符设备：提供连续的数据流，应用程序可以顺序读取，通常不支持随机存取。
相反，此类设备支持按字节/字符来读写数据。
举例来说，键盘、串口、调制解调器都是典型的字符设备。<br/>
(摘自百度知道[linux中什么是块设备和字符设备](https://zhidao.baidu.com/question/615887738025070532.html))

<md-divider></md-divider>


## 实现字节流操作

为了方便解释 现在先不建工程.

这次把实现操作的文件和模块主文件分开写.

```shell
[kuresaru@linux ~]$ mkdir testDev
[kuresaru@linux ~]$ cd testDev/
[kuresaru@linux testDev]$ vim devops.h
[kuresaru@linux testDev]$ vim devops.c
```

devops.h
```c
#ifndef __CDT_FOPS_H
#define __CDT_FOPS_H
#include <linux/fs.h>     // 结构体 file_operations 在这里边定义
extern struct file_operations testdev_fops;
#endif
```

devops.c
```c
#include "devops.h"
#include <linux/module.h>   // 下边的 THIS_MODULE 在这个里边定义
#include <linux/version.h>  // 下边的内核版本判断在这里边定义

// 在Linux中一切都是文件 设备访问点也是文件 所以需要实现文件的打开关闭方法
static int testdev_open(struct inode *inode, struct file *file)
{
    return 0;
}

static int testdev_release(struct inode *inode, struct file *file)
{
    return 0;
}

// 实现读取操作
static ssize_t testdev_read(struct file *file, char *buf, size_t count, loff_t *f_pos)
{
    // 返回结果 读取了0个字节
    return 0;
}

// 实现写入操作
static ssize_t testdev_write(struct file *file, const char *buf, size_t count, loff_t *f_pos)
{
    // 返回结果 写的所有字节全部处理完成了
    return count;
}

// 实现设备特有的操作 比如光驱设备实现弹出
static int testdev_ioctl(struct inode *inode, struct file *file, unsigned int cmd, unsigned long arg)
{
    return 0;
}

// 定义头文件里声明的结构体变量
struct file_operations testdev_fops = {
    .owner      = THIS_MODULE,
    .read       = testdev_read,
    .write      = testdev_write,
    .open       = testdev_open,
    .release    = testdev_release,
// 不同版本内核 这个叫法不一样 所以根据内核版本编译不同的程序
#if LINUX_VERSION_CODE >= KERNEL_VERSION(2, 6, 36)
    .unlocked_ioctl = testdev_ioctl
#else
.ioctl = testdev_ioctl
#endif
};
```

<md-divider></md-divider>


## 编写模块主程序

main.c
```c
#include <linux/module.h>
#include <linux/cdev.h>
#include <linux/device.h>
#include "devops.h"

#define DEV_NAME "testdev"

static int major;       // 设备的主设备号
static dev_t devno;     // 设备的主设备号
struct cdev *testdev;   // 设备
static struct class *testdev_class; //设备类

static int __init testdev_init(void)
{
    // 动态分配一个主设备号
    int ret = alloc_chrdev_region(&devno, 0, 1, DEV_NAME);
    if (ret &lt; 0)
        goto error;
    // 从分配到的设备信息里取出主设备号
    major = MAJOR(devno);
    // 分配一个新的字符设备
    testdev = cdev_alloc();
    if (testdev == NULL)
        goto error;
    // 给新分配到的字符设备设置刚才实现好的操作方法
    cdev_init(testdev, &testdev_fops);
    testdev->owner = THIS_MODULE;
    // 把初始化好的字符设备增加到系统中 1代表一个设备
    if (cdev_add(testdev, devno, 1) != 0)
        goto error;
    // 创建设备类
    testdev_class = class_create(THIS_MODULE, DEV_NAME);
    if (IS_ERR(testdev_class))
        goto error;
    // 现在执行这个才真正的把设备加入到了/dev/testdev
    device_create(testdev_class, NULL, devno, NULL, DEV_NAME);
    return 0;
error:
    return -1;
}

static void __exit testdev_exit(void)
{
    // 释放资源
    // 删除/dev/testdev
    device_destroy(testdev_class, devno);
    // 删除设备类
    class_destroy(testdev_class);
    // 删除设备
    cdev_del(testdev);
    // 删除设备号
    unregister_chrdev_region(devno, 1);
}

module_init(testdev_init);
module_exit(testdev_exit);

MODULE_LICENSE("GPL");
```

<md-divider></md-divider>


## 编译测试

复制前面的Makefile到本项目目录, 修改模块名和源文件

```makefile
# 修改模块名字
NAME = testdev
KDIR := /usr/src/kernels/$(shell uname -r)

obj-m := $(NAME).o
# 修改源文件 因为有main.c和devops.c 所以这需要写两个文件 后缀是.o
$(NAME)-objs := main.o devops.o
PWD := $(shell pwd)

all:
    $(MAKE) -C $(KDIR) M=$(PWD) modules

clean: 
    -rm -rf *.o *.ko *.order $(NAME).mod.c Module.symvers

load:
    insmod $(NAME).ko

unload:
    rmmod $(NAME)
```

编译并安装模块 可以看到/dev/testdev这个设备

编译过程中有警告 是因为设备实现里没有完全实现所有功能

```shell session
[kuresaru@linux testDev]$ make
make -C /usr/src/kernels/3.10.0-957.21.3.el7.x86_64 M=/home/kuresaru/testDev modules
make[1]: 进入目录“/usr/src/kernels/3.10.0-957.21.3.el7.x86_64”
    CC [M]  /home/kuresaru/testDev/main.o
    CC [M]  /home/kuresaru/testDev/devops.o
/home/kuresaru/testDev/devops.c:49:1: 警告：从不兼容的指针类型初始化 [默认启用]
    };
    ^
/home/kuresaru/testDev/devops.c:49:1: 警告：(在‘testdev_fops.unlocked_ioctl’的初始化附近) [默认启用]
    LD [M]  /home/kuresaru/testDev/testdev.o
    Building modules, stage 2.
    MODPOST 1 modules
    CC      /home/kuresaru/testDev/testdev.mod.o
    LD [M]  /home/kuresaru/testDev/testdev.ko
make[1]: 离开目录“/usr/src/kernels/3.10.0-957.21.3.el7.x86_64”
[kuresaru@linux testDev]$ sudo make load
insmod testdev.ko
[kuresaru@linux testDev]$ ls -l /dev/testdev 
crw------- 1 root root 244, 0 9月   8 15:11 /dev/testdev
[kuresaru@linux testDev]$ sudo make unload
rmmod testdev
[kuresaru@linux testDev]$ ls -l /dev/testdev 
ls: 无法访问/dev/testdev: 没有那个文件或目录
```

<md-divider></md-divider>


## 实现设备的读写

编辑devops.c, 增加一个静态全局变量字符数组

```c
static char buffer[64];
```

因为用户不能直接访问内核的内存空间 内核也不能直接访问用户的内存空间<br/>
所以需要"间接"访问, 加入头文件<br/>
后面有字符串操作, 加入头文件

```c
#include <asm/uaccess.h>    // 提供copy_to_user和copy_from_user
#include <linux/string.h>   // 提供strlen和memset</code></pre>
```

修改read和write函数 为了防止出错我把整个文件放出来

devops.c

```c
#include "devops.h"
#include <linux/module.h>   // 下边的 THIS_MODULE 在这个里边定义
#include <linux/version.h>  // 下边的内核版本判断在这里边定义
#include <asm/uaccess.h>    // 提供copy_to_user和copy_from_user
#include <linux/string.h>   // 提供strlen和memset

static char buffer[64];

// 在Linux中一切都是文件 设备访问点也是文件 所以需要实现文件的打开关闭方法
static int testdev_open(struct inode *inode, struct file *file)
{
    return 0;
}

static int testdev_release(struct inode *inode, struct file *file)
{
    return 0;
}

// 实现读取操作
static ssize_t testdev_read(struct file *file, char *buf, size_t count, loff_t *f_pos)
{
    // 取buffer里字符串的长度
    size_t len = strlen(buffer);
    if (len > 0) {
        // 把内核空间buffer里的数据复制到用户空间buf里
        if (copy_to_user(buf, buffer, len)) {
            // 复制出错
            printk(KERN_ERR "Write error\n");
            return -EFAULT;
        }   
        // 读取完成(写buf)后清空buffer
        memset(buffer, 0, 64);
        //返回读取到的字节数
        return len;
    }   
    return 0;
}

// 实现写入操作
static ssize_t testdev_write(struct file *file, const char *buf, size_t count, loff_t *f_pos)
{
    // 把用户空间buf里的数据复制到内核空间buffer里
    if (copy_from_user(buffer, buf, count)) {
        printk(KERN_ERR "Write error\n");
        return -EFAULT;
    }
    return count;
}

// 实现设备特有的操作 比如光驱设备实现弹出
static int testdev_ioctl(struct inode *inode, struct file *file, unsigned int cmd, unsigned long arg)
{
    return 0;
}

// 定义头文件里声明的结构休变量
struct file_operations testdev_fops = {
    .owner      = THIS_MODULE,
    .read       = testdev_read,
    .write      = testdev_write,
    .open       = testdev_open,
    .release    = testdev_release,
// 不同版本内核 这个叫法不一样 所以根据内核版本编译不同的程序
#if LINUX_VERSION_CODE >= KERNEL_VERSION(2, 6, 36)
    .unlocked_ioctl = testdev_ioctl
#else
    .ioctl = testdev_ioctl
#endif
};
```

<md-divider></md-divider>


### 最终测试

```shell session
# 卸载之前的模块, 清空编译好的文件, 重新编译, 加载
[kuresaru@linux testDev]$ sudo make unload
[kuresaru@linux testDev]$ make clean
[kuresaru@linux testDev]$ make
[kuresaru@linux testDev]$ sudo make load

# 默认只有root有读写权限, 更改权限把读写给所有人
[kuresaru@linux testDev]$ ls -l /dev/testdev 
crw------- 1 root root 244, 0 9月   8 15:43 /dev/testdev
[kuresaru@linux testDev]$ sudo chmod 666 /dev/testdev 
[kuresaru@linux testDev]$ ls -l /dev/testdev 
crw-rw-rw- 1 root root 244, 0 9月   8 15:43 /dev/testdev

# 写入数据给设备, 会把数据放到前边定义的那64字节的数组里
[kuresaru@linux testDev]$ echo "Hello World! 暮光小猿wzt" > /dev/testdev 

# 从设备读取数据, 会读出64字节数组里的数据
[kuresaru@linux testDev]$ cat /dev/testdev 
Hello World! 暮光小猿wzt

# 因为上次读取的时候已经清空了数组, 所以再读取不会有数据
[kuresaru@linux testDev]$ cat /dev/testdev
```
