import { ipcMain, app, dialog } from "electron";
import initFile from "./file";
import buildPreview from "../scripts/buildPreview";
import convertCode from '../scripts/convertCode';
import fsExtra from 'fs-extra'

import emitter from '../eventEmitter'

export const initIpc = (mainWindow: any, workWindow: any) => {
  initFile(mainWindow, workWindow)

  ipcMain.handle('common.getUserDataDir', (event) => {
    return app.getPath('userData')
  })

  ipcMain.handle('startPreviewProject', (event, path) => {
    return buildPreview(path)
  })
  ipcMain.handle('stopPreviewProject', (event, path) => {
    return emitter.emit('shutdown');
  })
  ipcMain.handle('showOpenDialog', (event, config) => {
    return dialog.showOpenDialog(config)
  })
  ipcMain.handle('startRunPython', (event, params) => {
    return convertCode(params)
  })
  ipcMain.handle('downLoadFile', async (event, params) => {
    const { filePath } = await dialog.showSaveDialog({
      title: '下载代码',
      buttonLabel: 'Save',
      defaultPath: 'project_code'
    });
    if (filePath) {
      fsExtra.copy(params.path, filePath, { dereference: true })
    } else {
      return;
    }
  })
};