import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from 'Mobx-react';
import { useStore } from '@/render/store/index'
import { useExportUserSourceCode } from "@/render/hooks/userInitGlobalConfig";
import { Card, message, Upload } from "antd";
import { InboxOutlined } from '@ant-design/icons';
import "./index.less";

const { Dragger } = Upload;

interface IProps {
  uploadCallbck: () => void;
}

function UploadPage(props: IProps) {
  const { uploadCallbck } = props
  const navigate = useNavigate();
  const { fileState } = useStore()
  const exportUserSourceCode = useExportUserSourceCode()
  const [uploading, setUploading] = useState(false)

  const handleUploadUniappCode = (file: any) => {
    fileState.setSourceType(0)
    handleBeforeUpload(file, 0)
  }

  const handleUploadWxCode = (file: any) => {
    fileState.setSourceType(1)
    handleBeforeUpload(file, 1)
  }

  const handleBeforeUpload = (file: any, sourceType: Number) => {
    setUploading(true)
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async (event: any) => {
      const result = await exportUserSourceCode(file.name, event.target.result, sourceType)
      if (result) {
        message.success({ content: '上传成功' })
        uploadCallbck()
      } else {
        message.error({ content: '上传失败'})
      }
      setUploading(false)
    };
    return false;
  };

  return (
    <>
      <Card bordered={false} title="请选择需要导入的源码类型" loading={uploading}>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <Dragger style={{ width: 400 }} beforeUpload={handleUploadUniappCode} showUploadList={false}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined rev={undefined} />
            </p>
            <p className="ant-upload-text">Uniapp</p>
            <p className="ant-upload-hint">
              请将 codeFun 下载的代码拖入至此处！
            </p>
          </Dragger>
          <Dragger style={{ width: 400 }} beforeUpload={handleUploadWxCode} showUploadList={false}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined rev={undefined} />
            </p>
            <p className="ant-upload-text">原生微信小程序</p>
            <p className="ant-upload-hint">
              请将 codeFun 下载的代码拖入至此处！
            </p>
          </Dragger>
        </div>
      </Card>
    </>
  );
}

export default observer(UploadPage);
