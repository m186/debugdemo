const puppeteer = require('puppeteer');
const {mn} = require('./config/default.js');
const srcToImg = require('./helpper/srcToImg.js');

(async () => {
    const browser = await puppeteer.launch(); // 获取浏览器方法
    const page = await browser.newPage(); // 获取页面实例
    await page.goto('https://image.baidu.com/'); // 跳转至百度图片页面
    console.log('go to 百度图片');

    // 百度图片页面为懒加载页面，为了获取更多的图片将窗口页面宽高尽可能设置的大点
    await page.setViewport({width: 1920, height: 1080});
    console.log('set viewport');

    /**
     * 模拟人为搜索
     * 1、输入框   2、输入内容   3、点击搜索
     */
    await page.focus('#kw'); // 获取输入框焦点
    await page.keyboard.sendCharacter('刘德华'); // 输入搜索内容
    await page.click('.s_btn'); // 点击搜索按钮
    console.log('search...');

    // 等待网页搜索加载完成
    page.on('load', async () => {
        console.log('page loading done, start fetch...');

        // 获取页面图片的 src
        const srcs = await page.evaluate(() => {
            const images = document.querySelectorAll('img.main_img');
            return Array.prototype.map.call(images, img => img.src);
        });
        console.log(`get ${srcs.length} images, start download`);

        srcs.forEach(async (src, index) => {
            await page.waitFor(200); // 降低访问频率
            await srcToImg(src, mn);
        });
        
        await browser.close(); // 关闭浏览器方法，结束爬取任务
    });

})();