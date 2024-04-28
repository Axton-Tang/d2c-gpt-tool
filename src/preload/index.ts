import { contextBridge, ipcRenderer } from "electron";
import getEnv from './env';
import * as file from './file';
import type { PromiseValue } from 'type-fest';

async function injectApi() {
  const env = await getEnv();

  const api = {
    file,
    env,
  };
  contextBridge.exposeInMainWorld('api', api);
  return api;
}

injectApi()

const startPreviewProject = (path: string) => {
  return ipcRenderer.invoke("startPreviewProject", path);
}

const stopPreviewProject = () => {
  return ipcRenderer.invoke("stopPreviewProject");
}

const showOpenDialog = (config: Object) => {
  return ipcRenderer.invoke("showOpenDialog", config);
}

const startRunPython = (params: Object) => {
  return ipcRenderer.invoke("startRunPython", params);
}

const downLoadFile = (params: Object) => {
  return ipcRenderer.invoke("downLoadFile", params);
}

contextBridge.exposeInMainWorld("nativeBridge", {
  startPreviewProject,
  stopPreviewProject,
  showOpenDialog,
  startRunPython,
  downLoadFile,
});


type Api = PromiseValue<ReturnType<typeof injectApi>>;
type NativeBridge = ReturnType<typeof injectApi>;

export type { Api, NativeBridge };
