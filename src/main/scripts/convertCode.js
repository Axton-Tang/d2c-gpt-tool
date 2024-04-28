const { PythonShell } = require('python-shell');
const { spawn } = require('child_process');

const runPythonScript = (scriptPath, args = []) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [scriptPath, ...args]);

    let data = '';
    for (const output of [pythonProcess.stdout, pythonProcess.stderr]) {
      output.on('data', (chunk) => {
        data += chunk.toString();
      });
    }

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script exited with code ${code}: ${data}`));
      } else {
        resolve(data);
      }
    });
  });
};

function convertCode(params) {
  console.log("=========params1111", params)
  const { sourceType, sourcePath, hasApi, uiImage, curl, responseJson, resultPath } = params
  return new Promise(async (resolve, reject) => {

    const pythonPath = sourceType === 0 ? './src/main/scripts/convert-uniapp.py' : './src/main/scripts/convert-wechat.py'

    // 使用此函数执行 Python 脚本
    runPythonScript(pythonPath, [sourcePath, hasApi, uiImage, curl, responseJson, resultPath])
      .then(output => resolve())
      .catch(error => console.error(error));
  })
}

// function convertCode(params) {
//   console.log("=========params1111", params)
//   const { sourceType, hasApi, uiImage, curl, responseJson, resultPath } = params
//   return new Promise(async (resolve, reject) => {
//     let options = {
//       mode: 'text',
//       pythonPath: 'python3', // 确保这里的路径指向你系统中的Python 3
//       pythonOptions: ['-u'], // 获取打印输出的未缓存输出
//       scriptPath: './', // Python 脚本的路径
//       args: [hasApi, uiImage, curl, responseJson, resultPath] // 传递给Python脚本的参数
//     };

//     const pythonPath = sourceType === 0 ? './src/main/scripts/convert-uniapp.py' : './src/main/scripts/convert-wechat.py'
//     // const pythonPath = './src/main/scripts/test.py'

//     PythonShell.runString('x=1+1;print(x)', null, function (err) {
//       if (err) throw err;
//       console.log('finished');
//     });

//     PythonShell.run(pythonPath, options, function (err, results) {
//       if (err) throw err;
//       // 结果是一个包含脚本输出行的数组
//       console.log('Python script output:');
//       console.log(results);
//       resolve()
//     });
//   })
// }

export default convertCode;