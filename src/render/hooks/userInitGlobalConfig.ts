import { useStore } from '@/render/store/index'

const userDataDir = window.api.env.userDataDir
const fileAction = window.api.file


/**
 * 初始用户导入源码配置
 */
export function useExportUserSourceCode() {
  const { fileState } = useStore()
  
  return async (filename: string, file: ArrayBuffer, sourceType: Number) => {
    try {
      // 初始化一些需要用到的目录
      const timeStamp = new Date().getTime()
      const sourceCodeRootPath = userDataDir + '/UserSourceCache/' + timeStamp
      await fileAction.mkdirDir(sourceCodeRootPath)
      await fileAction.mkdirDir(sourceCodeRootPath + '/source_code')
      await fileAction.mkdirDir(sourceCodeRootPath + '/result_code')
      await fileAction.mkdirDir(sourceCodeRootPath + '/image')

      const sourceCodePath = sourceCodeRootPath + '/source_code/'
      const sourceCodeFile = sourceCodePath + filename
      // 将用户上传的文件写入
      await fileAction.write(sourceCodeFile, file)
      await fileAction.unzipFile(sourceCodeFile, sourceCodePath)

      // 写入配置文件
      await fileAction.write(sourceCodeRootPath + '/config.json', JSON.stringify({ sourceType }))

      fileState.setSourceCodeRootPath(sourceCodeRootPath)
      console.log('========sourceCodeRootPath', sourceCodeRootPath)
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }
}

/**
 * 导入 UI 图片
 */
export function useExportUIImage() {
  const { fileState } = useStore()
  
  return async (filename: string, file: ArrayBuffer) => {
    try {
      // 获取图片应该上传到的地址
      const uiImagePath = fileState.sourceCodeRootPath + '/image/ui.png'
      // 写入配置文件
      await fileAction.write(uiImagePath, file)
      return uiImagePath
    } catch (err) {
      console.error(err)
      return false
    }
  }
}