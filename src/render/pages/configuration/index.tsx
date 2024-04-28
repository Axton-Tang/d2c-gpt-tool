import React, { useEffect, useState } from "react";
import { Button, Card, Checkbox, Form, Input, Upload, message } from "antd";
import "./index.less";

interface IFormState {
  projectPath: string;
  routerPath: string;
  swaggerUrl: string;
}

const configFile = window.api.env.userDataDir + '/UserConfig/config.json';

function Configuration() {
  const [form] = Form.useForm();
  const projectPath = Form.useWatch('projectPath', form);

  useEffect(() => {
    handleGetConfigData()
  }, [])

  const handleGetConfigData = () => {
    window.api.file.read(configFile).then(res => {
      const data = JSON.parse(res)
      form.setFieldsValue({ ...data })
    })
  }

  const handleSelectProject = () => {
    window.nativeBridge.showOpenDialog({
      title: '请选择项目目录',
      properties: ['openDirectory']
    }).then((result: any) => {
      if (!result.canceled && result.filePaths.length > 0) {
        const selectedFolderPath = result.filePaths[0];
        form.setFieldsValue({ 'projectPath': selectedFolderPath })
      }
    }).catch((err: Error) => {
      console.error(err);
    });
  }

  const handleSelectRouter = () => {
    window.nativeBridge.showOpenDialog({
      title: '请选择路由文件路径',
      properties: ['openFile'],
      defaultPath: form.getFieldValue('projectPath')
    }).then((result: any) => {
      if (!result.canceled && result.filePaths.length > 0) {
        const selectedFilePath = result.filePaths[0];
        console.log('选择的文件夹:', selectedFilePath);
        form.setFieldsValue({ 'routerPath': selectedFilePath })
      }
    }).catch((err: Error) => {
      console.error(err);
    });
  }

  const handleConfirm = (value: IFormState) => {
    window.api.file.write(configFile, JSON.stringify(value)).then(res => {
      message.success({ content: '保存成功' })
    }).catch(err => {
      message.error({ content: '保存失败' })
    })
  }

  return (
    <>
      <Card bordered={false} title="默认配置">
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
            label="项目目录"
            name="projectPath"
            rules={[
              {
                required: true,
                message: '请选择项目目录',
              },
            ]}
          >
            <Input suffix={<Button type="primary" style={{ marginLeft: 10 }} onClick={handleSelectProject}>选择</Button>} />
          </Form.Item>
          {
            projectPath && (
              <Form.Item
                label="路由文件路径"
                name="routerPath"
                rules={[
                  {
                    required: true,
                    message: '请选择路由文件路径',
                  },
                ]}
              >
                <Input suffix={<Button type="primary" style={{ marginLeft: 10 }} onClick={handleSelectRouter}>选择</Button>} />
              </Form.Item>
            )
          }

          <Form.Item
            label="swagger 接口地址"
            name="swaggerUrl"
            rules={[
              {
                required: true,
                message: '请输入 swagger 接口地址',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Button type="primary" htmlType="submit">
              保存默认配置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
}

export default Configuration;
