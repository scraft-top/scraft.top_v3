const sitemap = {
  path: '/sitemap.xml', //生成的文件路径
  hostname: 'https://www.scraft.top', //网站的网址
  gzip: false, //生成.xml.gz的sitemap
  exclude: ['/history', '/404', '/api', '/v1', '/v2'], //排除不要的页面，这里的路径是相对于hostname
  defaults: {
    changefred: 'always',
    lastmod: new Date()
  },
  routes: [
    // '/page/1',
    // '/page/2',
    // {
    //   url: '/page/3',
    //   changefreq: 'daily',
    //   priority: 1,
    //   lastmod: '2017-06-30T13:30:00.000Z'
    // }
  ]
}
export default sitemap
