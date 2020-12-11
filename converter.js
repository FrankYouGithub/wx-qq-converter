#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { fsExistsSync, getSuffix, copyWithStream, printHelp } = require('./util');

const pwd = process.cwd(); // 当前执行程序的路径 同 path.resolve('./')
const currentDir = pwd.substr(pwd.lastIndexOf('/') + 1);  // 当前执行程序所在的文件名
const pwd_ = path.resolve(pwd, '..'); // 当前执行程序的路径的上一级路径
const mode = process.argv[2]; // 转换模式 wx2qq / qq2wx
const targetPath = process.argv[3] || path.join(pwd_, `${currentDir}_`); // 目标存放目录(用户数据 或 默认当前执行程序的路径的上一级路径+当前文件夹名+_)
const modeFormat = {
  'wx2qq': '微信小程序 转 QQ小程序',
  'qq2wx': 'QQ小程序 转 微信小程序'
}
const ignoreFiles = ['.git'];

switch (mode) {
  case 'wx2qq':
    printInfo();
    checkDirectory(pwd, targetPath, copy);
    break;
  case 'qq2wx':
    printInfo();
    checkDirectory(pwd, targetPath, copy);
    break;
  case 'help':
    printHelp();
    break;
  default:
    console.log('不知道你要干嘛！！！ 执行 converter help 看看吧兄die');
    break;
}

/**
 * 判断文件夹是否存在，不存在则创建
 * @param {*} src 源文件夹
 * @param {*} dst 目标文件夹
 * @param {*} callback 回调执行函数
 */
function checkDirectory(src, dst, callback) {
  if (!fsExistsSync(dst)) {
    fs.mkdirSync(dst);
    callback(src, dst);
  } else {
    callback(src, dst);
  }
};

/**
 * 拷贝文件
 * @param {*} src 源路径
 * @param {*} dst 目标路径
 */
function copy(src, dst) {
  const files = readDir(src);  //读取源目录下的所有文件及文件夹
  files.forEach((file) => {
    const _src = path.join(src, file);
    const _dst = path.join(dst, file);
    if (fsExistsSync(_src)) {
      const stats = fs.statSync(_src);
      if (stats.isFile()) { //如果是个文件则拷贝
        const suffix = getSuffix(file);
        switch (mode) {
          case 'wx2qq':
            wxToQq(suffix, _src, _dst)
            break;
          case 'qq2wx':
            qqToWx(suffix, _src, _dst)
            break;
          default:
            console.log('位置错误，请重试！')
            break;
        }
      } else if (stats.isDirectory()) { //是目录则 递归
        checkDirectory(_src, _dst, copy);
      }
    } else {
      console.log(`处理 ${_src} 失败，请确认文件是否存在`);
    }
  });
}

function readDir(src) {
  let files = fs.readdirSync(src);
  ignoreFiles.map(item => {
    files = files.filter(v => v !== item);
  })
  return files
}

/**
 * 微信小程序转QQ小程序
 * @param {*} suffix 后缀名
 * @param {*} _src 源文件
 * @param {*} _dst 目标文件
 */
function wxToQq(suffix, _src, _dst) {
  switch (suffix) {
    case '.wxss':
      copyWithStream(_src, _dst.replace(/\.[^/.]+$/, '.qss'));
      break;
    case '.wxml':
      const qmlStr = fs.readFileSync(_src, 'utf-8');
      fs.writeFileSync(_dst.replace(/\.[^/.]+$/, '.qml'), `${qmlStr}`.replace(/wx:/g, 'qq:'));
      break;
    case '.js':
      const jsStr = fs.readFileSync(_src, 'utf-8');
      fs.writeFileSync(_dst, `${jsStr}`.replace(/wx./g, 'qq.'));
      break;
    default:
      copyWithStream(_src, _dst);
      break;
  }
  console.log('已处理文件：', _src)
}

/**
 * QQ小程序转微信小程序
 * @param {*} suffix 后缀名
 * @param {*} _src 源文件
 * @param {*} _dst 目标文件
 */
function qqToWx(suffix, _src, _dst) {
  switch (suffix) {
    case '.qss':
      copyWithStream(_src, _dst.replace(/\.[^/.]+$/, '.wxss'));
      break;
    case '.qml':
      const qmlStr = fs.readFileSync(_src, 'utf-8');
      fs.writeFileSync(_dst.replace(/\.[^/.]+$/, '.wxml'), `${qmlStr}`.replace(/qq:/g, 'wx:'));
      break;
    case '.js':
      const jsStr = fs.readFileSync(_src, 'utf-8');
      fs.writeFileSync(_dst, `${jsStr}`.replace(/qq./g, 'wx.'));
      break;
    default:
      copyWithStream(_src, _dst);
      break;
  }
  console.log('已处理文件：', _src)
}

function printInfo() {
  console.log('当前所在目录：', pwd);
  console.log('目标目录：', targetPath);
  console.log('执行转换模式：', modeFormat[mode])
  console.log('------------------------------------------------------------------------')
}