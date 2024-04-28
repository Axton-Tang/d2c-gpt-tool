import { useStore } from '@/render/store/index'

const userDataDir = window.api.env.userDataDir
const fileAction = window.api.file

/**
 * 转化代码
 */
export default function useTransform() {
  const { fileState } = useStore()
  
  return async () => {
    try {
      const previewPath = fileState.previewPath
      const resultCodeFolder = fileState.sourceCodeRootPath + '/result_code'
      await fileAction.copy(previewPath, resultCodeFolder + '/my-project')

      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }
}