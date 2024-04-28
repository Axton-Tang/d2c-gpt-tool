import { ipcMain } from "electron";
import fs, { promises as fsPromiseAPIs } from 'fs';
import fsExtra from 'fs-extra'
import compressing from 'compressing'
const { exec } = require('child_process');

const initFile = (mainWindow: any, workWindow: any) => {
  ipcMain.handle('fileAction.read', async (event, path: string, encoding: BufferEncoding) => {
    return fsPromiseAPIs.readFile(path, encoding);
  })
  ipcMain.handle('fileAction.write', async (event, path: string, content: any, encoding: BufferEncoding) => {
    return fsPromiseAPIs.writeFile(path, content, encoding);
  })
  ipcMain.handle('fileAction.rename', async (event, oldPath: string, newPath: string) => {
    return fsPromiseAPIs.rename(oldPath, newPath);
  })
  ipcMain.handle('fileAction.delete', async (event, path: string) => {
    return fsPromiseAPIs.unlink(path);
  })
  ipcMain.handle('fileAction.hasFile', async (event, path: string) => {
    return fsPromiseAPIs.access(path, fs.constants.F_OK);
  })
  ipcMain.handle('fileAction.canWrite', async (event, path: string) => {
    return fsPromiseAPIs.access(path, fs.constants.W_OK);
  })
  ipcMain.handle('fileAction.canRead', async (event, path: string) => {
    return fsPromiseAPIs.access(path, fs.constants.R_OK);
  })
  ipcMain.handle('fileAction.readDir', async (event, path: string) => {
    return fsPromiseAPIs.readdir(path);
  })
  ipcMain.handle('fileAction.mkdirDir', async (event, path: string) => {
    return fsPromiseAPIs.mkdir(path, { recursive: true });
  })
  ipcMain.handle('fileAction.isExitsFoler', async (event, path: string) => {
    return fs.existsSync(path);
  })
  ipcMain.handle('fileAction.copyFile', async (event, sourcePath: string, targetPath: string) => {
    return fsPromiseAPIs.copyFile(sourcePath, targetPath)
  })
  ipcMain.handle('fileAction.copy', async (event, sourcePath: string, targetPath: string) => {
    return fsExtra.copy(sourcePath, targetPath, { dereference: true })
  })
  ipcMain.handle('fileAction.unzipFile', async (event, sourcePath: string, targetPath: string) => {
    return compressing.zip.uncompress(sourcePath, targetPath)
  })
  ipcMain.handle('fileAction.unzipFileReserveLink', async (event, sourcePath: string, targetPath: string) => {
    return new Promise((resolve, reject) => {
      // 使用 tar 命令解压文件并保留软连接
      exec(`tar -xzf ${sourcePath} -C ${targetPath} --preserve-symlinks`, (error: any, stdout: any, stderr: any) => {
        if (error) {
          reject(error)
          console.error(`Error extracting files: ${error}`);
        } else {
          resolve(true)
          console.log('Files extracted successfully, including symbolic links.');
        }
      });
    })
  })
};

export default initFile;