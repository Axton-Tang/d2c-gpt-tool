import {
  app,
  BrowserWindow,
  Menu,
  MessageChannelMain,
  globalShortcut
} from "electron";
import { join, resolve } from "path";
import { initIpc } from "./ipc";
import { initUpadate } from './update'
import { initDb } from "@/lowdb/low";
import preOpration from './pre'
import customMenu from './customMenu';


let workWindow: any = null;
let mainWindow: any = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
      preload: join(__dirname, "../preload/index.cjs"),
    },
  });

  if (import.meta.env.MODE === "dev") {
    if (import.meta.env.VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(import.meta.env.VITE_DEV_SERVER_URL);
      mainWindow.webContents.openDevTools();
    }
  } else {
    mainWindow.loadFile(resolve(__dirname, "../render/index.html"));
  }

  workWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(__dirname, "../work/index.cjs"),
    },
  });

  workWindow.hide();

  if (import.meta.env.MODE === "dev") {
    workWindow.webContents.openDevTools();
  }

  workWindow.loadFile(resolve(__dirname, "../work/index.html"));

  const { port1, port2 } = new MessageChannelMain();
  mainWindow.once("ready-to-show", () => {
    mainWindow.webContents.postMessage("port", null, [port1]);
  });

  workWindow.once("ready-to-show", () => {
    workWindow.webContents.postMessage("port", null, [port2]);
  });
};

const creatMenu = () => {
  const menu = Menu.buildFromTemplate(customMenu);
  Menu.setApplicationMenu(menu);
};

app.whenReady().then(() => {
  creatMenu();
  globalShortcut.register('Alt+CommandOrControl+I', () => {
    mainWindow.webContents.openDevTools();
  })
  initDb().then(() => {
    createWindow();
    initIpc(mainWindow, workWindow);
    preOpration()
  })
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  // initUpadate()
});

app.on("window-all-closed", () => {
  app.quit();
});

export {
  mainWindow
}