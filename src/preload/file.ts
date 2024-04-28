import { ipcRenderer } from 'electron';

export const read = async (path: string, encoding?: BufferEncoding): Promise<string> => {
  return ipcRenderer.invoke('fileAction.read', path, { encoding: encoding || 'utf8' })
}

export const write = async (path: string, content: any, encoding?: BufferEncoding): Promise<string> => {
  let updateContent = typeof content === 'string' ? content : Buffer.from(content);
  return ipcRenderer.invoke('fileAction.write', path, updateContent, { encoding: encoding || 'utf8' })
}

export const rename = async (oldPath: string, newPath?: string): Promise<void> => {
  return ipcRenderer.invoke('fileAction.rename', oldPath, newPath)
}

export const deleteFile = async (path: string): Promise<void> => {
  return ipcRenderer.invoke('fileAction.delete', path)
}

export const hasFile = async (path: string): Promise<boolean> => {
  return ipcRenderer.invoke('fileAction.hasFile', path)
}

export const canWrite = async (path: string): Promise<boolean> => {
  return ipcRenderer.invoke('fileAction.canWrite', path)
}

export const canRead = async (path: string): Promise<boolean> => {
  return ipcRenderer.invoke('fileAction.canRead', path)
}

export const readDir = async (path: string): Promise<string[]> => {
  return ipcRenderer.invoke('fileAction.readDir', path)
}

export const mkdirDir = async (path: string): Promise<void> => {
  return ipcRenderer.invoke('fileAction.mkdirDir', path)
}

export const isExitsFoler = async (path: string): Promise<boolean> => {
  return ipcRenderer.invoke('fileAction.isExitsFoler', path)
}

export const copyFile = async (sourcePath: string, targetPath: string): Promise<void> => {
  return ipcRenderer.invoke('fileAction.copyFile', sourcePath, targetPath)
}

export const copy = async (sourcePath: string, targetPath: string): Promise<void> => {
  return ipcRenderer.invoke('fileAction.copy', sourcePath, targetPath)
}

export const unzipFile = async (sourcePath: string, targetPath: string): Promise<void> => {
  return ipcRenderer.invoke('fileAction.unzipFile', sourcePath, targetPath)
}

export const unzipFileReserveLink = async (sourcePath: string, targetPath: string): Promise<void> => {
  return ipcRenderer.invoke('fileAction.unzipFileReserveLink', sourcePath, targetPath)
}