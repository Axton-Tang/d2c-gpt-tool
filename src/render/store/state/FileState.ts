import { action, makeObservable, observable } from 'mobx'

interface IConfig {
  hasApi: boolean;
  uiImage: string;
  curl: string;
  responseJson: string;
}

class FileState {
  constructor() {
    makeObservable(this, {
      sourceType: observable,
      curProjectConfig: observable,
      sourceCodeRootPath: observable,
      previewPath: observable,
      setCurProjectConfig: action,
      setSourceCodeRootPath: action,
      setPreviewPath: action,
    })
  }

  sourceType = 0 // 0: uniapp，1: 原生微信小程序
  curProjectConfig = {
    hasApi: false,
    uiImage: '',
    curl: '',
    responseJson: '',
  }

  sourceCodeRootPath = '' // 源码根路径
  previewPath = ''  // 预览的模板项目根路径

  setSourceType(type: 0 | 1) {
    this.sourceType = type
  }
  setCurProjectConfig(config: IConfig) {
    this.curProjectConfig = config
  }
  setSourceCodeRootPath(path: string) {
    this.sourceCodeRootPath = path
  }
  setPreviewPath(path: string) {
    this.previewPath = path
  }
}
const fileState = new FileState()
export default fileState
