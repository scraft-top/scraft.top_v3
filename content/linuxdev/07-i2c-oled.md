---
title: 07-i2c-oled
description: 实现I2C总线的OLED驱动
---


## 实验环境

+ 硬件: Orange PI Zero 512M
+ CPU: Allwiner H2+
+ 内核版本: 3.4.113
+ 操作系统: Armbian 版本忘了
+ OLED: 常见的 0.96寸 I2C总线

<md-divider></md-divider>


## 相关资料

[程序源码](https://git.scraft.top/kuresaru/oled_i2cTest-linux_mod)

<md-divider></md-divider>


## 什么是I2C

I2C总线是由Philips公司开发的一种简单、双向二线制同步串行总线。<br>
它只需要两根线即可在连接于总线上的器件之间传送信息。<br>
I2C总线是一个真正的多主机总线，<br>
每个连接到总线上的器件都有唯一的地址，<br>
任何器件既可以作为主机也可以作为从机，<br>
但同一时刻只允许有一个主机。

<md-divider></md-divider>


## 注册I2C设备

- 取出系统中的适配器，加入一个i2c设备，再把加过设备的适配器放回去。
    ```c
    // 注意3C这个地址，在地址选择的时候是78
    // 但是因为最低位是用来标识读写的 所以linux中需要把地址右移一位
    // 0x78 >> 1 = 0x3C
    static struct i2c_board_info info = {
        I2C_BOARD_INFO("oled_0.96", 0x3C),
    };
    ```

- 在入口取出系统中的适配器，加入一个i2c设备，再把加过设备的适配器放回去。出口里直接取消。
    ```c
    // 定义全局变量存放设备
    static struct i2c_client *client;

    // 入口注册
    {
        struct i2c_adapter *adapter;
        // 取出I2C-1总线 OrangePi有I2C-0和I2C-1两个总线
        adapter = i2c_get_adapter(1);
        // 在这个总线里加入刚才定义的设备
        client = i2c_new_device(adapter, &info);
        // 把加了设备的再放回去
        i2c_put_adapter(adapter);
    }

    // 出口注销
    {
        i2c_unregister_device(client);
    }
    ```

<md-divider></md-divider>


## 加入I2C设备驱动

- 定义设备被加载时的初始化和被卸载的退出动作
    ```c
    int OLED_Probe(struct i2c_client *client, const struct i2c_device_id *id)
    {
        WriteCmd(client, 0xAE); //display off
        WriteCmd(client, 0x20);	//Set Memory Addressing Mode	
        // ... 各种初始化
        OLED_Cls(client);
        WriteCmd(client, 0xaf); //--turn on oled panel
        return 0; // 返回0成功，非0会在加载后给出错误提示
    }

    int OLED_Remove(struct i2c_client *client)
    {
        printk("remove\n");
        // 驱动卸载时关闭显示
        WriteCmd(client, 0xAE);
        return 0;
    }
    ```

- 定义驱动
    ```c
    // 定义这个驱动会匹配什么名字的设备
    static const struct i2c_device_id oled_id[] = {
        // 这个名字一定要和上边设备的名字一样
        {"oled_0.96", 0},
        {},
    };

    // 定义这个驱动的名字，匹配什么名字的设备，初始化和退出动作等
    static struct i2c_driver driver = {
        .driver = {
            .name = "oled_0.96",
            .owner = THIS_MODULE,
        },
        .probe = OLED_Probe,
        .remove = OLED_Remove,
        .id_table = oled_id,
    };
    ```

- 在入口中注册驱动，出口中注销驱动
    ```c
    // 入口注册
    {
        int ret = i2c_add_driver(&driver);
        if (ret) {
            printk(KERN_ERR "I2C error\n");
            return ret;
        }
    }

    // 出口注销
    {
        i2c_del_driver(&driver);
    }
    ```

<md-divider></md-divider>


## 实现写入

按照[第6篇](/linuxdev/06-misc-device)，实现一个只写的杂项设备

```c
// 实现写入
static ssize_t dev_write(struct file *file, const char __user *buf, size_t count, loff_t *fpos)
{
    // 申请一段空间，存放数据
    char *str = vmalloc(count);
    // 把数据从用户空间复制到内核空间
    if (copy_from_user(str, buf, count))
    {
        vfree(str);
        return -EFAULT;
    }
    // 字符串的结束
    *(str + count) = '\0';
    // 按照普通单片机实现一个设置屏幕上文字的方法
    OLED_Set(client, str);
    // 设置完成后释放空间
    vfree(str);
    // 返回已写入的长度
    return count;
}

static struct file_operations dev_fops = {
	.owner = THIS_MODULE,
	.write = &dev_write,
};

static struct miscdevice mdev = {
    // 动态申请从设备号
    .minor = MISC_DYNAMIC_MINOR,
    // 名字，会显示到/dev/oled
	.name = "oled",
	.fops = &dev_fops,
};

// 最终的入口出口
static __init int Module_Init(void)
{
	struct i2c_adapter *adapter;
	int ret;
	adapter = i2c_get_adapter(1);
	client = i2c_new_device(adapter, &info);
	i2c_put_adapter(adapter);
	ret = i2c_add_driver(&driver);
	if (ret) {
		printk(KERN_ERR "I2C error\n");
		return ret;
	}
	ret = misc_register(&mdev);
	if (ret)
	{
		printk(KERN_ERR "Mdev error\n");
	}
	return ret;
}

static __exit void Module_Exit(void)
{
	misc_deregister(&mdev);
	i2c_unregister_device(client);
	i2c_del_driver(&driver);
}
```

<md-divider></md-divider>


## 测试

- 编译并加载模块，然后写入一段文字
    ```shell session
    root@orangepizero:~/i2cTest# make && make load
    root@orangepizero:~/i2cTest# echo "Hello World~ I'm Kuresaru!" > /dev/oled
    ```
    ![hello](./v3_static/img/linuxdev/07-01-hello.jpg)

- 把一段命令的输出写入到屏幕
    ```shell session
    root@orangepizero:~/i2cTest# ip addr show wlan0 | grep -i "inet" > /dev/oled
    ```
    ![hello](./v3_static/img/linuxdev/07-02-ip.jpg)

- 卸载模块，屏幕黑屏
    ```shell session
    root@orangepizero:~/i2cTest# make unload
    ```

