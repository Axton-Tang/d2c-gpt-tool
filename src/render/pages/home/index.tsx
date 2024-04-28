import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Steps } from "antd";
import UploadPage from './components/upload';
import SettingPage from './components/setting';
import PreviewPage from "./components/preview";
import ResultPage from './components/result';
import "./index.less";


function Home() {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0)

  const handleUploadCallbck = () => {
    setStepIndex(1)
  }

  const handleConfigCallback = () => {
    setStepIndex(2)
  }

  const handleAgainCallback = () => {
    setStepIndex(0)
  }

  return (
    <>
      <Card bordered={false} style={{ marginBottom: 50 }}>
        <Steps
          current={stepIndex}
          items={[
            {
              title: '导入源码',
              description: '请将 codeFun 生成的代码下载后导入',
            },
            {
              title: '配置修改',
              description: '对生成的规则进行必要的配置',
            },
            {
              title: '下载代码',
              description: '代码生成完毕，下载代码到本地',
            },
          ]}
        />
      </Card>
      {stepIndex === 0 && <UploadPage uploadCallbck={handleUploadCallbck} />}
      {stepIndex === 1 && <SettingPage confirmCallback={handleConfigCallback} />}
      {stepIndex === 2 && <ResultPage againCallback={handleAgainCallback} />}
    </>
  );
}

export default Home;
