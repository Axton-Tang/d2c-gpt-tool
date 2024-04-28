import React, { useEffect, useState } from "react";
import { observer } from 'Mobx-react'
import { useStore } from '@/render/store/index'
import { Spin, Result, Button } from "antd";

interface IProps {
  againCallback: () => void;
}

function ResultPage(props: IProps) {
  const { againCallback } = props
  const { fileState } = useStore()
  const [loading, setLoading] = useState(true)
  const [resultPath, setResultPath] = useState('')

  useEffect(() => {
    window.nativeBridge.startRunPython({
      sourceType: fileState.sourceType,
      sourcePath: fileState.sourceCodeRootPath + '/source_code',
      resultPath: fileState.sourceCodeRootPath + '/result_code',
      ...fileState.curProjectConfig,
      uiImage: fileState.curProjectConfig.uiImage.replace('file://', ''),
    }).then(() => {
      setLoading(false)
      setResultPath(fileState.sourceCodeRootPath + '/result_code')
      console.log("==========结果代码路径：", fileState.sourceCodeRootPath + '/result_code')
    })
  }, [])

  const handleExport = () => {
    window.nativeBridge.downLoadFile({ path: resultPath })
  }

  const handleAgain = () => {
    window.nativeBridge.stopPreviewProject()
    againCallback()
  }

  return (
    <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {
        loading ? <Spin size="large">正在生成数据......</Spin> :
          <Result
            status="success"
            title="数据生成完成，请下载代码使用"
            extra={[
              <>
                <Button type="primary" onClick={handleExport}>下载代码</Button>
                <Button onClick={handleAgain}>重新导入</Button>
              </>
            ]}
          />
      }
    </div>
  )
}

export default observer(ResultPage);