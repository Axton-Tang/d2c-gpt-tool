import { app } from 'electron'
import fs, { promises as fsPromiseAPIs } from 'fs';

// 获取用户数据目录
const userDataPath = app.getPath('userData');

/**
 * 初始化用户源码存放目录和全局配置文件存放目录
 */
async function initApplicationData() {
  console.log("========userDataPath", userDataPath)
  const folerExits = fs.existsSync(userDataPath + '/UserSourceCache')
  const configExists = fs.existsSync(userDataPath + '/UserConfig')
  if (!folerExits) {
    await fsPromiseAPIs.mkdir(userDataPath + '/UserSourceCache', { recursive: true });
  }
  if (!configExists) {
    await fsPromiseAPIs.mkdir(userDataPath + '/UserConfig', { recursive: true });
    await fsPromiseAPIs.writeFile(userDataPath + '/UserConfig' + '/config.json', '{}')
  }
}

export default async () => {
  initApplicationData()
}

