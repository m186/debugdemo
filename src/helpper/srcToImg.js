const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const {promisify} = require('util');
let writeFile = promisify(fs.writeFile);

module.exports = async (src, dir) => {
    if (/\.(jpg|png|gif)$/.test(src)) {
        await urlToImg(src, dir);
    } else {
        await base64ToImg(src, dir);
    }
}

// url => image
const urlToImg = promisify((url, dir, callback) => {
    const mod = /^https:/.test(url) ? https : http;
    const ext = path.extname(dir);
    const file = path.join(dir, `${Date.now()}${ext}`);

    mod.get(url, res => {
        res.pipe(fs.createWriteStream(file))
        .on('finish', () => {
            callback();
        });
    });
});

// base64 => image
const base64ToImg = async (base64Str, dir) => {
    //base64图片格式：data:image/jpeg;base64,/sdfjaioodklgdfgl
    const matches = base64Str.match(/^data:(.+?);base64,(.+)$/);
    console.log(matches);
    try {
        const ext = matches[1].split('/')[1].replace('jpeg', 'jpg');
        const file = path.join(dir, `${Date.now()}.${ext}`);
    
        await writeFile(file, matches[2], 'base64');
    } catch (error) {
        console.log('非法 base64字符串');
    }
}