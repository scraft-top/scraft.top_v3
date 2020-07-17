---
title: 06-misc-device
description: 编写杂项设备驱动
---


## 实验环境

+ 硬件: PC
+ 内核版本: 5.3.0
+ 操作系统: Parrot 4.8

<md-divider></md-divider>


## 相关资料

+ [测试程序](https://git.scraft.top/kuresaru/misc_device_test-linux_mod)

<md-divider></md-divider>


## 什么是杂项设备

杂项设备是在嵌入式系统中用得比较多的一种设备驱动。<br>
其实是因为这些字符设备不符合预先确定的字符设备范畴，<br>
所以这些设备采用主编号10，<br>
一起归于misc device。<br>
misc设备其实也是特殊的字符设备。<br>
(摘自百度知道[LINUX misc设备是什么](https://zhidao.baidu.com/question/354123482.html))

<md-divider></md-divider>


## 设备读写实现

特殊的字符设备，字符设备就需要实现它的读写方法。<br>
读写部分和第三篇基本一样。

```c
// 64字节缓冲区
static char readbuf[64];

// 设备的读取
static ssize_t dev_read(struct file *file, char __user *buf, size_t count, loff_t *f_pos)
{
    // 计算长度
    size_t len = strlen(readbuf);
    // 如果不是空的
    if (len > 0)
    {
        // 复制数据到用户空间
        if (copy_to_user(buf, readbuf, len))
        {
            return -EFAULT;
        }
        // 清空缓冲区
        memset(readbuf, 0, 64);
        // 返回读取到的长度
        return len;
    }
    // 没有读到任何数据
    return 0;
}

// 设备的写入
static ssize_t dev_write(struct file *file, const char __user *buf, size_t count, loff_t *f_pos)
{
    // 确认长度不会超过最大
    if (count > 63)
        count = 63;
    // 从用户空间复制到内核空间
    if (copy_from_user(readbuf, buf, count))
    {
        return -EFAULT;
    }
    // 返回写入的长度
    return count;
}
```

<md-divider></md-divider>


## 定义一个杂项设备

设备就是一个结构体，里边写上它的属性。

```c
// 定义写入读取方法
static struct file_operations dev_fops = {
    .owner = THIS_MODULE,
    .read = &dev_read,
    .write = &dev_write,
};

// 定义一个设备
static struct miscdevice dev = {
    // 动态分配子设备号
    .minor = MISC_DYNAMIC_MINOR,
    // 设备名字 会显示到/sys/class/misc/misctest 和/dev/misctest
    .name = "misctest",
    // 读写方法
    .fops = &dev_fops,
};
```

<md-divider></md-divider>


## 程序入口

因为这次的测试环境的内核版本是5.3.0，<br>
不知道是从哪个版本开始，内核/用户空间数据复制的名字有变化，<br>
这里加一个定义。<br>
然后就是在入口注册这个杂项设备，<br>
出口注销这个杂项设备。<br>
最终的程序在Git仓库，这就不再放了。

```c
// 不知道哪个内核版本 把这两个改名了
#define copy_to_user    raw_copy_to_user
#define copy_from_user  raw_copy_from_user

// 模块入口 注册设备
static __init int Module_Init(void)
{
    return misc_register(&dev);
}

// 模块出口 取消注册设备
static __exit void Module_Exit(void)
{
    misc_deregister(&dev);
}

module_init(Module_Init);
module_exit(Module_Exit);
MODULE_LICENSE("GPL");
```

<md-divider></md-divider>


## 程序测试

```shell session
┌─[kuresaru@parrot]─[~/armlinux/misctest]
└──╼ $make
make -C /usr/src/linux-headers-5.3.0-1parrot1-amd64 M=/home/kuresaru/armlinux/misctest modules
make[1]: Entering directory '/usr/src/linux-headers-5.3.0-1parrot1-amd64'
    CC [M]  /home/kuresaru/armlinux/misctest/main.o
    LD [M]  /home/kuresaru/armlinux/misctest/misctest.o
    Building modules, stage 2.
    MODPOST 1 modules
    CC      /home/kuresaru/armlinux/misctest/misctest.mod.o
    LD [M]  /home/kuresaru/armlinux/misctest/misctest.ko
make[1]: Leaving directory '/usr/src/linux-headers-5.3.0-1parrot1-amd64'
┌─[kuresaru@parrot]─[~/armlinux/misctest]
└──╼ $sudo make load
[sudo] kuresaru 的密码：
insmod misctest.ko
┌─[kuresaru@parrot]─[~/armlinux/misctest]
└──╼ $ls -l /sys/class/misc/misctest
lrwxrwxrwx 1 root root 0 11月 22 08:15 /sys/class/misc/misctest -> ../../devices/virtual/misc/misctest
┌─[kuresaru@parrot]─[~/armlinux/misctest]
└──╼ $ls -l /dev/misctest 
crw------- 1 root root 10, 54 11月 22 08:14 /dev/misctest
┌─[kuresaru@parrot]─[~/armlinux/misctest]
└──╼ $sudo chmod 666 /dev/misctest 
[sudo] kuresaru 的密码：
┌─[kuresaru@parrot]─[~/armlinux/misctest]
└──╼ $cat /dev/misctest 
┌─[kuresaru@parrot]─[~/armlinux/misctest]
└──╼ $echo "Hello World~" > /dev/misctest 
┌─[kuresaru@parrot]─[~/armlinux/misctest]
└──╼ $cat /dev/misctest 
Hello World~
┌─[kuresaru@parrot]─[~/armlinux/misctest]
└──╼ $cat /dev/misctest 
┌─[kuresaru@parrot]─[~/armlinux/misctest]
└──╼ $sudo make unload
rmmod misctest
```
