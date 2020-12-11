const fs = require('fs');
const path = require('path');

/**
 * 判断文件/文件夹是否存在
 * @param {String} PATH 文件路径
 */
const fsExistsSync = (PATH) => {
  try {
    const stats = fs.statSync(PATH);
  } catch (error) {
    return false
  }
  return true
}

/**
 * 获取文件后缀名
 * @param {String} fileName 
 */
const getSuffix = (fileName) => {
  return path.extname(fileName);
}

/**
 * 拷贝文件内容到指定文件
 * @param {String} _src 源文件
 * @param {String} _dst 目标文件
 */
const copyWithStream = (_src, _dst) => {
  const readable = fs.createReadStream(_src);//创建读取流
  const writable = fs.createWriteStream(_dst);//创建写入流
  readable.pipe(writable);
}

const printHelp = () => {
  console.log('Usage: converter <command> <targetPath>');
  console.log('')
  console.log(`where <command> is one of: "wx2qq", "qq2wx", "help"`);
  console.log('')
  console.log(`targetPath 为目标目录，最终处理完后存储的目录，不传的话默认会创建一个与当前执行命令所在目录同级的文件夹（文件夹名为：当前文件夹名_）`);
  console.log('')
  console.log('converter wx2qq            微信小程序转QQ小程序')
  console.log('converter qq2wx            QQ小程序转微信小程序')
}

module.exports = {
  fsExistsSync,
  getSuffix,
  copyWithStream,
  printHelp
}