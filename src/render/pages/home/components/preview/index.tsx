import React, { useEffect, useState } from "react";
import { observer } from 'Mobx-react'
import { useStore } from '@/render/store/index'
import { Button, Card, Descriptions, Empty, Form, Input, Menu, Radio, Tree, message } from "antd";
import type { MenuProps } from 'antd';
import type { DataNode } from 'antd/es/tree';
import axios from "axios";
import formatSwaggerData from './format'
import "./index.less";
import { DownOutlined } from "@ant-design/icons";

interface ApiItem {
  path: string;
  method: 'get' | 'post';
  description: string;
  parameters: Object;
  responses: Object;
}

interface ApiData {
  key: string;
  name: string;
  data: ApiItem[]
}

interface ApiDetail {
  path?: string;
  description: string;
  method: 'get' | 'post';
  parameters: Object;
  responses: Object;
  tag: string;
  formatParameters?: DataNode[];
  formatResponses?: DataNode[];
}

interface FlatApiObj {
  [key: string]: ApiDetail
}

type MenuItem = Required<MenuProps>['items'][number];

interface SelectElement {
  filename: string;
  line: string;
  path: string;
  status: boolean;
}

interface ColumnData {
  path: string;
  file: string;
  line: number;
  column: string;
}

interface IProps {
  confirmCallback: () => void;
}

function PreviewPage(props: IProps) {
  const { confirmCallback } = props
  const { fileState, linkState } = useStore()
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true)
  const [apiData, setApiData] = useState<ApiData[]>([])
  const [flatApiObj, setFlatApiObj] = useState<FlatApiObj>({})
  const [menuData, setMenuData] = useState<MenuItem[]>()
  const [selectedMenuKeys, setSelectedMenuKeys] = useState<any[]>([])
  const [curApiPath, setCurApiPath] = useState('')
  const [curApiDetail, setCurApiDetail] = useState<ApiDetail>({
    description: '',
    method: 'get',
    parameters: {},
    responses: {},
    tag: ''
  })
  const [curSelectElement, setCurSelectElement] = useState<SelectElement>({
    filename: '',
    line: '',
    path: '',
    status: false,
  })
  const [curSelectedParam, setCurSelectedParam] = useState('')

  const [linkedApiArr, setLinkedApiArr] = useState<ApiDetail[]>([]) // 已经关联的接口数据
  const [linkedColumnArr, setLinkedColumnArr] = useState<ColumnData[]>([]) // 已经关联的字段数据

  useEffect(() => {
    handleGetSwaggerData()
    window.nativeBridge.startPreviewProject(fileState.previewPath).then((res: boolean) => {
      if (res) {
        setLoading(false)
      }
    })
    window.addEventListener("message", (e) => {
      const { status } = e.data
      if (status) {
        setCurSelectElement(e.data)
      } else {
        setCurSelectElement({
          filename: '',
          line: '',
          path: '',
          status: false,
        })
      }
    })
    return () => {
      window.nativeBridge.stopPreviewProject()
    }
  }, [])

  const handleGetSwaggerData = async () => {
    const result = await axios.get(fileState.curProjectConfig.swaggerUrl)
    if (result) {
      const { flatApiObj, formatApiData } = formatSwaggerData(JSON.parse(result.data.replaceAll("'", '"')))
      setApiData(formatApiData)
      setFlatApiObj(flatApiObj as FlatApiObj)
      formatToMenu(formatApiData)
      console.log('data========', formatApiData)
    }
  }

  const handleClickMenu = (e: any) => {
    setCurApiPath(e.key)
    setSelectedMenuKeys([e.key])
    const detail = flatApiObj[e.key]
    console.log("=======detail", detail)
    const formatParameters = formatToTreeData(detail.parameters || {})
    const formatResponses = formatToTreeData(detail.responses || {})
    setCurApiDetail(Object.assign(detail, {
      formatParameters,
      formatResponses,
    }))
    setCurSelectedParam('')
  }

  const handleSelectApiParam = (selectedKeys: (string | number)[], info: any) => {
    if (info.selected) {
      const result = generateAccessorString(curApiDetail.responses, info.node.pos)
      setCurSelectedParam(result)
    } else {
      setCurSelectedParam('')
    }
  }

  // 页面关联接口
  const handleLinkApi = () => {
    if (!linkedApiArr.map(item => item.path).includes(selectedMenuKeys[0])) {
      setLinkedApiArr([...linkedApiArr, {
        ...flatApiObj[selectedMenuKeys[0]],
        path: selectedMenuKeys[0]
      }])
      message.success({ content: '关联接口成功' })
    } else {
      message.warning({ content: '已经存在关联' })
    }
  }

  // 取消页面关联接口
  const handleUnLinkApi = (path: string | undefined) => {
    const newLinkedApiArr = linkedApiArr.filter(item => item.path !== path)
    setLinkedApiArr(newLinkedApiArr)
  }

  // 页面文本关联字段
  const handleLinkColumn = () => {
    let myIframe = document.getElementById('myIframe') as any
    myIframe.contentWindow.postMessage({ linkedDataSoruce: true }, 'http://localhost:6969')
    console.log("=======当前关联信息")
    console.log("=======选择的元素信息", curSelectElement)
    console.log("=======选择的字段信息", curSelectedParam)
    const curLinkedColumn: ColumnData = {
      path: selectedMenuKeys[0],
      file: curSelectElement.path,
      line: Number(curSelectElement.line),
      column: curSelectedParam,
    }
    const isAllowPush = !linkedColumnArr.some(obj => obj.path === curLinkedColumn.path && obj.line === curLinkedColumn.line)
    if (isAllowPush) {
      setLinkedColumnArr([
        ...linkedColumnArr,
        curLinkedColumn
      ])
      message.success({ content: '关联字段成功' })
    } else {
      message.warning({ content: '已经存在关联' })
    }
  }

  // 确认关联数据
  const handleConfirm = () => {
    linkState.setLinkedApiArr(linkedApiArr)
    linkState.setLinkedColumnArr(linkedColumnArr)
    confirmCallback()
  }

  /**
   * 格式化 api 数据为菜单的数据格式
   * @param data 已经被格式化后的 api 数据
   */
  const formatToMenu = (data: ApiData[]) => {
    const result = data.map(item => {
      const children = item.data.map(v => {
        return {
          label: v.description,
          key: v.path,
        }
      })
      return {
        label: item.name,
        key: item.key,
        children,
      }
    })
    setMenuData(result)
  }

  const formatToTreeData = (data: any): any => {
    if (!data) {
      return null
    }
    const keyArr = Object.keys(data)
    return keyArr.map((key: string) => {
      return {
        title: key,
        key: Math.floor(Math.random() * 1e9).toString().padStart(10, '0'), // 随机数保证不重复就行，实际选中叶子时用不到它
        children: formatToTreeData(data[key])
      }
    })
  }


  const generateAccessorString = (obj: any, pos: string): string => {
    const indices = pos.split('-').map(Number);
    let curObj = obj
    let path = 'data';

    // 遍历索引并递归地构建访问路径字符串
    indices.forEach((index, i) => {
      if (i) {
        const keysArr = Object.keys(curObj || {})
        const key = keysArr[index]
        if (Number(key) || Number(key) === 0) {
          path += `[${key}]`
        } else {
          path += '.' + key
        }
        curObj = curObj[keysArr[index]]
      }
    });
    return path
  }

  return (
    <>
      <Card bordered={false} title="关联数据源" loading={loading}>
        <div className="preview-container">
          <iframe id="myIframe" className="iframe" width={375} height={812} src="http://localhost:6969/"></iframe>
          <Card className="source">
            <div className="content">
              <Menu className="menu" mode="inline" items={menuData} onClick={handleClickMenu} selectedKeys={selectedMenuKeys} />
              <div className="detail">
                <div className="button-wrapper">
                  <Button type="primary" onClick={handleLinkApi} disabled={!selectedMenuKeys.length}>关联接口</Button>
                  <Button type="primary" style={{ marginLeft: 20 }} onClick={handleLinkColumn} disabled={!curSelectedParam || !curSelectElement.line}>关联字段</Button>
                </div>
                {
                  curApiPath ? (
                    <Descriptions title="接口信息" className="api-info" bordered column={1} >
                      <Descriptions.Item label="接口地址">{curApiPath}</Descriptions.Item>
                      <Descriptions.Item label="接口描述">{curApiDetail.description}</Descriptions.Item>
                      <Descriptions.Item label="请求方式">{curApiDetail.method}</Descriptions.Item>
                      <Descriptions.Item label="请求参数">
                        {
                          curApiDetail.formatParameters?.length ? <Tree
                            showLine
                            switcherIcon={<DownOutlined rev={undefined} />}
                            treeData={curApiDetail.formatParameters}
                            selectable={false}
                          /> : <div>无</div>
                        }
                      </Descriptions.Item>
                      <Descriptions.Item label="响应参数">
                        {
                          curApiDetail.formatResponses?.length ? <Tree
                            showLine
                            switcherIcon={<DownOutlined rev={undefined} />}
                            onSelect={handleSelectApiParam}
                            treeData={curApiDetail.formatResponses}
                          /> : <div>无</div>
                        }
                      </Descriptions.Item>
                    </Descriptions>
                  ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请从左侧选择需要关联的接口" />
                }
              </div>
            </div>
          </Card>
        </div>
      </Card>
      <Card bordered={false} title="已经关联的数据" loading={loading}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="关联的接口">{
            linkedApiArr.map(item => {
              return (
                <div style={{ margin: '20px 0' }}>
                  <span>{item.description}</span>
                  <span style={{ marginLeft: 20 }}>{item.path}</span>
                  <Button type="primary" size="small" style={{ marginLeft: 20 }} onClick={() => handleUnLinkApi(item.path)}>取消关联</Button>
                </div>
              )
            })
          }</Descriptions.Item>
          <Descriptions.Item label="关联的字段">{
            linkedColumnArr.map(item => {
              return (
                <div style={{ margin: '20px 0' }}>
                  <div>文件：{item.file}</div>
                  <div>行数：{item.line}</div>
                  <div>接口：{item.path}</div>
                  <div>字段：{item.column}</div>
                </div>
              )
            })
          }</Descriptions.Item>
        </Descriptions>
        <Button type="primary" style={{ marginTop: 30 }} onClick={handleConfirm}>确定关联数据</Button>
      </Card>
    </>
  )
}

export default observer(PreviewPage);
