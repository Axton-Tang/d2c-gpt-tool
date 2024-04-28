# -*- coding: utf-8 -*-
import json
import requests
from lxml import etree
import os
import base64
import re
import sys


AZURE_OPENAI_API_KEY_SI = os.environ.get("OPENAI_API_KEY_YJ_SI_4")
headers = {
    "Content-Type": "application/json",
    "api-key": AZURE_OPENAI_API_KEY_SI,
}

GPT4V_ENDPOINT = "https://openaiyjus2.openai.azure.com/openai/deployments/gpt-4v/chat/completions?api-version=2023-07-01-preview"

transformClassPrompt = '''
    接下来我将会发给你 wxml 代码以及一张 UI 图片，wxml 的代码与 UI 图片是完全对应的关系，请帮我完成以下工作：
    - 请找出所有以 section_、group_、pos_、view_、image_、button_、text_ 开头的类名，结合代码的上下文与图片的内容，用清晰的语义化的名字进行表示出来，转化后的类名请用横线相接的命名规范
    - 有且只需要识别 section_、 group_、pos_、view_、image_、button_、text_ 开头的类名，其他无关的我不希望在 json 文件中出现，包括但不限于 text,  selectOption 等都不要出现
    - 对于 font_ 开头的类名请不要修改
    - 转化后的类名一定不要再包含数字，而且请不要使用英文数字
    - 当所在区域或文字不能用语义化表示出来时，可以在类名中适当的添加 top/bottom/left/right 等方位词
    - 请直接输出转换后对应的 json 映射文件，例如 {"group_1": "section-main-content"}。请不要输出代码
    - 转化后的 json 文件请按照转化前 section_、group_、pos_、view_、image_、button_、text_ 的顺序归类好
    
    - 最外层的页面容器使用 page 做为类名
    - 外层容器使用 wrapper 结尾
    - 内层容器使用 container 结尾
    - 图片使用 image 结尾
    - 按钮使用 button 结尾
    - 图标使用 icon 结尾
    - 文本使用 text 结尾，标题除外
    - 卡片使用 card 结尾
    - 列表使用 list 结尾
    - 列表项使用 item 结尾
    - 可以适当使用  list / box / title / name / header / item / desc / tip / tag / label  等名称加入类名里面
    
    - 对于以下情况请不要直接按照文本来转化语义：
        一个类名被多个地方使用的情况
        在 UI 图中出现需要渲染列表的地方
    这些情况请抽出他们的共同点，来提炼出一个通用化语义表示
    
    - 转化后的类名之间禁止重复，名字禁止相同，例如 {"text_5": "ingredient-name-text", "text_6": "ingredient-name-text"} 转化后类名相同禁止出现这样的情况，转化前后类名需为唯一对应关系
    - 长度请严格保持在 4 个单词及以内
'''

addNetwordRequestPrompt = '''
    接下来我将会发给你 wxml 代码、接口的 curl、接口返回的 json 数据以及一张 UI wxml 的代码与 UI 图片是完全对应的关系，请帮我完成以下工作：
    - 你的工作分成两部分，第一部分为编写 js 代码，获取网络请求；第二部分为编写 wxml 代码，替换页面的显示为网络请求得到的数据

    - 首先，输出一个 <script></script> 标签，在其里面编写网络请求方法请求接口拿到数据，并且在 data 中赋值变量，最后调用方法
        网络请求示例代码如下：
        async handleGetEvaluationList() {
            this.setData({
                loadingStatus: true,
            })
            const Res = await queryEvaluationList({ pageIndex: this.data.pageIndex, pageSize: this.data.pageSize })
            if (Res.success) {
                this.setData({
                    evaluationList: [...this.data.evaluationList, ...Res.data],
                    loadingStatus: false
                })
                if (Res.data.length < this.data.pageSize) {
                    this.setData({
                        loadedAll: true
                    })
                }
            }
        }
        请严格按照此格式进行网络请求，禁止使用 fetch / axios 库进行请求
        其中，网路请求方法 queryEvaluationList 为封装后的方法，请帮助我进行导入，导入例如 import { queryEvaluationList } from '../../network/api/recuperate'
        注意：这只是一个示例导入与请求，请按照实际请求的接口进行命名与赋值
        你不需要传入 userId / ticket 做为入参，这个参数会在请求时默认带入
    
    - 然后，输出一个 <wxml></wxml> 标签。将网络请求赋值的数据，按字段填写到 wxml 当中，需要替换现有固定文本为变量，在页面上渲染出来。
    - 输出的代码需要符合 微信小程序 的语法规范
    - 替换后的变量名请完全确定一个根据语义来说最合适的，严禁使用不在 json 文件里面的参数
    - 如果模板代码中需要进行格式化字段展示，请在 methods 中进行添加对应方法，并且在模板语法中调用
    - 请不要对图片地址、类名、wxml 格式进行任何形式的修改，不要对层级结构进行任何修改
    - 对于 wx:for 出来的元素，请注意第一项和后面的样式差异，避免样式错乱
    - 对于 UI 图上看上去就是列表的元素，只是内部少部分元素有差异，请使用 wx:if 进行区分判断该展示哪一个即可
    - 页面中每一个文本对应的字段请你根据文字语义并且结合 UI 图片，找到最合适的字段
    - 如果字段找不到，有可能为页面固定内容，则不用进行替换
    - 最后，请将替换后的代码输出，有且只需要输出修改后的代码，请不要输出多余的其他文本信息
    - 输出的顺序为 properties、data、onLoad、methods
    - 如果是页面请将网络请求方法放到 onLoad 中，如果是组件请放到 lifetimes 的 attached 中
    - 请给出修改后的完整代码，请严格按照返回示例返回
    - 返回示例：
        <script>这里为接口请求代码加入后的具体内容</script>
        <wxml>这里为替换接口请求后的代码</wxml>
'''

# 调用 gpt 进行优化


def request_openai(prompt, encoded_image):
    print("===========prompt=========", prompt)
    payload = {
        "messages": [
            {
                "role": "system",
                "content": [
                    {
                        "type": "text",
                        "text": "你是一个前端开发工程师，这里有一个微信小程序的 wxml 的代码，它是使用工具生成的代码，你需要帮我优化代码，使之便于维护"
                    }
                ]
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{encoded_image}"
                        }
                    }
                ]
            }
        ],
        "temperature": 0,
        "top_p": 0.95,
        "max_tokens": 4096
    }
    try:
        response = requests.post(GPT4V_ENDPOINT, headers=headers, json=payload)
        response.raise_for_status()
    except requests.RequestException as e:
        raise SystemExit(f"Failed to make the request. Error: {e}")

    data = response.json()
    content = data['choices'][0]['message']['content'].replace(
        '```json', '').replace('```', '')
    print(content)
    return content


# 读取源文件夹除 pages 所有 wxml 文件和 less 文件
def read_source_file(source_path):
    # 设置你想要开始的目录
    file_contents = {}
    for dirName, subdirList, fileList in os.walk(source_path):
        print('找到目录: %s' % dirName)
        # 检查是否在 pages 目录下
        if "pages" in dirName.split(os.sep):
            for fname in fileList:
                if fname.endswith('.wxml'):
                    print('文件：\t%s' % fname)
                    with open(os.path.join(dirName, fname), 'r') as f:
                        data = f.read()
                        file_contents[fname] = data
                if fname.endswith('.less'):
                    print('文件：\t%s' % fname)
                    with open(os.path.join(dirName, fname), 'r') as f:
                        data = f.read()
                        file_contents[fname] = data
    return file_contents

# 上传图片至我们自己的 cdn


def upload_to_cdn(image_path):
    response = requests.get(image_path)
    filename = image_path.split('/')[-1]
    file_content = response.content

    url = 'https://t-do-dev.yunjiglobal.com/tuantuanadmin/platform/upload'
    headers = {}
    files = {'file': (filename, file_content)}

    response = requests.post(url, headers=headers, files=files)
    if response.status_code == 200:
        data = response.json()
        return data['data']
    else:
        print('Error:', response.status_code, response.text)
        return '请替换url'  

# 处理 CDN 链接替换


def process_file(data, has_api, reuqest_curl, response_json, styleCode, image_path):
    encoded_image = base64.b64encode(open(image_path, 'rb').read()).decode('ascii')
    tree = etree.HTML(data)

    # 第一步：查找所有 image 标签，上传我们自己的 cdn 并且替换
    # 查找 <image> 标签中的 src 属性
    src_list = tree.xpath("//image/@src")

    for src in src_list:
        new_src = upload_to_cdn(src)
        data = data.replace(src, new_src)
        src = src.replace('&', '&amp;')
        data = data.replace(src, new_src)

    # 第二步： 请求 gpt，替换类名，包括替换 template 中和 style 中的类名
    gptRes = request_openai(transformClassPrompt + data, encoded_image)
    gpt_json = json.loads(gptRes)
    replaceClassRes = convert_file(data, gpt_json)
    style_content = convert_file(styleCode, gpt_json)

    # 如果 api 存在，需要继续执行下面两个步骤
    if has_api:
        # 第三步：请求 gpt，拿到网路请求的代码
        gptRes = request_openai(addNetwordRequestPrompt + '代码如下：' + replaceClassRes +
                                'curl如下：' + reuqest_curl + '接口返回 json 数据如下：' + response_json, encoded_image)

        # 第四步：格式化后返回
        # 使用正则表达式提取<script>和<wxml>中的内容
        script_content = re.findall(r'<script>(.*?)</script>', gptRes, re.DOTALL)[0]
        wxml_content = re.findall(r'<wxml>(.*?)</wxml>', gptRes, re.DOTALL)[0]
        return script_content, wxml_content, style_content
    # 如果 api 不存在，则直接返回数据即可
    else:
        return '', replaceClassRes, style_content

# 替换类名


def convert_file(text, replacements):
    # 构建一个正则表达式，它匹配所有的替换目标，并使用捕获组来提取匹配部分
    # 这里使用 sorted 函数和 lambda 表达式来确保最长的替换目标首先被考虑
    pattern = '|'.join(
        # 使用 re.escape 来避免正则表达式特殊字符的问题，并添加先行断言以避免部分匹配
        re.escape(old) + '(?![\w-])'
        for old in sorted(replacements.keys(), key=len, reverse=True)
    )

    # 定义一个替换函数，它查找字典中的替换字符串
    def replace_func(match):
        matched_text = match.group(0)  # 获取匹配到的文本
        return replacements[matched_text]  # 返回替换后的文本

    # 使用 re.sub 和 replace_func 来替换所有匹配的字符串
    return re.sub(pattern, replace_func, text)

def str2bool(str):
	return True if str.lower() == 'true' else False

def main():
    # 读取配置
    source_path = sys.argv[1]
    has_api = str2bool(sys.argv[2])
    image_path = sys.argv[3]
    reuqest_curl = sys.argv[4]
    response_json = sys.argv[5]
    result_path = sys.argv[6]
    
    styleCode = '' # 处理前的 style
    style_content = '' # 处理后的 style

    # 读取源文件
    file_contents = read_source_file(source_path)

    for filename, data in file_contents.items():
        if (filename.endswith('.less')):
            styleCode = data
    
    for filename, data in file_contents.items():
        if (filename.endswith('.wxml')):
            script_content, wxml_content, style_content = process_file(
                data, has_api, reuqest_curl, response_json, styleCode, image_path)

    filename = filename.replace('.wxml', '')
    filename = filename.replace('.less', '')
    
    print("========wxml_content", wxml_content)
    print("========script_content", script_content)
    print("========styleCode", style_content)
    with open(os.path.join(result_path, filename + '.wxml'), 'w') as f:
        f.write(wxml_content)
    with open(os.path.join(result_path, filename + '.js'), 'w') as f:
        f.write(script_content)
    with open(os.path.join(result_path, filename + '.less'), 'w') as f:
        f.write(style_content)

    print("处理完成")


if __name__ == '__main__':
    main()
