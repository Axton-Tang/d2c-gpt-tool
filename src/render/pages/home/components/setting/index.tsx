import React, { useEffect, useState } from "react";
import { observer } from 'Mobx-react'
import { Button, Card, Form, Input, Upload, Switch, message } from "antd";

import { useStore } from '@/render/store/index'
import { useExportUIImage } from '@/render/hooks/userInitGlobalConfig'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import "./index.less";


const { TextArea } = Input

interface IProps {
  confirmCallback: () => void;
}

interface IFormState {
  hasApi: Boolean;
  uiImage: string;
  curl: string;
  responseJson: string;
}

const configFile = window.api.env.userDataDir + '/UserConfig/config.json';

function SettingPage(props: IProps) {
  const { confirmCallback } = props
  const { fileState } = useStore()
  const [form] = Form.useForm();
  const [uploadLoading, setUploadLoading] = useState(false)

  const [uiImage, setUiImage] = useState('')
  const [hasApi, setHasApi] = useState<Boolean>(true)
  const exportUIImage = useExportUIImage()


  useEffect(() => {
    handleGetConfigData()
  }, [])

  const handleGetConfigData = () => {
    window.api.file.read(configFile).then(res => {
      const data = JSON.parse(res)
      form.setFieldsValue({ ...data })
    })
  }

  const handleChangeSwitch = (value: Boolean) => {
    console.log("=====handleChangeSwitch", value)
    setHasApi(value)
  }

  const handleConfirm = (value: IFormState) => {
    const params = {
      ...value,
      uiImage,
      hasApi: value.hasApi ? true : false
    }
    fileState.setCurProjectConfig(params)
    confirmCallback()
  }

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      {uploadLoading ? <LoadingOutlined rev={undefined} /> : <PlusOutlined rev={undefined} />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  const handleUploadUiImage = (file: any) => {
    setUploadLoading(true)
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async (event: any) => {
      const result = await exportUIImage(file.name, event.target.result)
      if (result) {
        const imageUrl = `file://${result}`;
        setUiImage(imageUrl)
        message.success({ content: '上传成功' })
      } else {
        message.error({ content: '上传失败' })
      }
      setUploadLoading(false)
    };
    return false;
  }

  return (
    <>
      <Card bordered={false} title="请输入您的项目配置">
        <Form
          form={form}
          name="basic"
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          style={{
            maxWidth: 600,
          }}
          initialValues={{
            remember: true,
          }}
          onFinish={handleConfirm}
          onFinishFailed={() => { }}
          autoComplete="off"
        >
          <Form.Item
            label="UI 图片"
            name="uiImage"
            rules={[
              {
                required: true,
                message: '请上传 ui 图片',
              },
            ]}
          >
            <Upload
              listType="picture-card"
              showUploadList={false}
              maxCount={1}
              beforeUpload={handleUploadUiImage}
            >
              {uiImage ? <img src={uiImage} alt="avatar" style={{ width: 50 }} /> : uploadButton}
            </Upload>
          </Form.Item>
          <Form.Item
            label="是否需要生成接口代码"
            name="hasApi"
          >
            <Switch defaultChecked={true} onChange={handleChangeSwitch} />
          </Form.Item>
          {
            hasApi && (
              <>
                <Form.Item
                  label="接口请求 curl"
                  name="curl"
                  rules={[
                    {
                      required: true,
                      message: '请输入接口请求 curl',
                    },
                  ]}
                >
                  <TextArea />
                </Form.Item>
                <Form.Item
                  label="接口返回 response"
                  name="responseJson"
                  rules={[
                    {
                      required: true,
                      message: '接口返回 response 数据',
                    },
                  ]}
                >
                  <TextArea rows={20} />
                </Form.Item>
              </>
            )
          }
          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Button type="primary" htmlType="submit">
              确定
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
}

export default observer(SettingPage);
