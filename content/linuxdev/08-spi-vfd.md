---
title: 08-spi-vfd
description: 实现SPI总线的VFD驱动
---


## 实验环境

+ 硬件: Orange PI Zero 512M
+ CPU: Allwiner H2+
+ 内核版本: 5.4.45
+ 操作系统: Armbian
+ VFD: 老王家捡来的

<md-divider></md-divider>


## 相关资料

- [程序源码](https://git.scraft.top/kuresaru/linux-spi_vfd)

<md-divider></md-divider>


## 注册SPI设备驱动

```c
// 实现驱动加载卸载
int spi_vfd_probe (struct spi_device *dev);
int spi_vfd_remove(struct spi_device *dev);
// 定义匹配设备id
static const struct spi_device_id spi_vfd_id_table[] = {
	{ "spi_vfd", 0 },
	{},
};
// 定义驱动信息
static struct spi_driver spi_vfd_drvr = {
	.driver = {
		.name = "spi_vfd",
		.owner = THIS_MODULE,
	},
	.probe = spi_vfd_probe,
	.remove = spi_vfd_remove,
	.id_table = spi_vfd_id_table,
};

// ========
// 入口处注册驱动
int status = spi_register_driver(&spi_vfd_drvr);
if (status < 0)
{
	printk(KERN_ERR "Register driver failed %d\n", status);
	goto drv_error;
}
```

<md-divider></md-divider>


## 注册注册SPI设备

```c
// 设备全局变量,注销时用
static struct spi_device *spi_vfd_dev;
// 定义设备信息
static struct spi_board_info spi_vfd_info = {
	.modalias = "spi_vfd",
	.max_speed_hz = 500000, // SPI总线时钟(SCK)频率
	.bus_num = 1,			// SPI总线号
	.chip_select = 1,		// SPI片选号
	.mode = SPI_MODE_0 | SPI_LSB_FIRST, // 其它属性
};

// ========
// 入口处注册设备
int status;
struct spi_master *master;
master = spi_busnum_to_master(1); // 取SPI1总线
spi_vfd_dev = spi_new_device(master, &spi_vfd_info); // 在对应的总线上注册设备
```

<md-divider></md-divider>


## 向SPI设备发送数据

```c
inline void VFD_Cmd(struct spi_device *dev, const uint8_t cmd, const uint8_t data)
{
	const uint8_t buf[] = {cmd, data};
	spi_write(dev, buf, 2); // 向dev这个设备发送buf中的数据,长度2
}
```

其它具体实现请参考程序源码.

