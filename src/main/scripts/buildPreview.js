import { exec } from 'child_process'
import emitter from '../eventEmitter'
const express = require('express');
const net = require('net');

const startServer = (distPath) => {
  return new Promise((resolve, reject) => {
    const app = express();
    const port = 6969;

    app.use('/', express.static(distPath));

    const testServer = net.createServer().once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve()
        console.log(`Port ${port} is already in use.`);
      } else {
        console.error(err);
      }
    }).once('listening', () => {
      testServer.close();

      const server = app.listen(port, () => {
        resolve()
        console.log(`Express server is running at http://localhost:${port}`);
      });

      // 监听自定义事件 shutdown 后关闭服务
      emitter.on('shutdown', () => {
        console.log('Closing server...');
        server.close(() => {
          console.log('Server closed');
        });
      });
    }).listen(port)
  })
}

// 将exec封装成Promise
function executeCommand(command, path) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: path }, (error, stdout, stderr) => {
      if (error) {
        reject(`Error executing command "${command}": ${error}`);
      } else {
        resolve(`Command "${command}" executed successfully`);
      }
    });
  });
}

// 要执行的命令列表
const commands = [
  'yarn',
  'yarn run build:h5',
];

function buildPreview(path) {
  return new Promise(async (resolve, reject) => {

    for (const command of commands) {
      try {
        const result = await executeCommand(command, path);
        console.log(result);
      } catch (error) {
        console.error(error);
        reject(error)
      }
    }
    await startServer(path + '/dist/build/h5')
    resolve(true)
  })
}

export default buildPreview