/**
 * 格式化 swagger 接口返回数据
 * @param {*} data swagger 接口返回的 data
 */
export default function (data) {
  const paths = data.paths
  const keyArr = Object.keys(paths)

  // 最终列表平铺结果
  const result = {}

  for (let i = 0; i < keyArr.length; i++) {
    const key = keyArr[i]

    // 需要得到的数据结构
    const resObj = {
      method: "",
      description: "",
      parameters: {},
      responses: {},
    }

    const obj = paths[key]
    let method = 'get'
    if (obj?.get) {
      method = 'get'
    } else if (obj?.post) {
      method = 'post'
    }
    resObj.method = method
    const params = obj[method]
    resObj.description = params.description || params.summary
    resObj.parameters = params.parameters ? getParameters(data, params.parameters) : null
    resObj.responses = params.responses ? getResponses(data, params.responses) : null
    resObj.tag = params.tags[0] || '未知命名'
    result[key] = resObj
  }

  // 最终格式化后分类结果
  const formatRes = []

  // 遍历输入对象的每个属性
  for (const path in result) {
    if (result.hasOwnProperty(path)) {
      const item = result[path];
      const index = formatRes.findIndex(v => v.name === item.tag)
      if (index >= 0) {
        formatRes[index].data.push({
          path: path,
          method: item.method,
          description: item.description,
          parameters: item.parameters,
          responses: item.responses
        })
      } else {
        formatRes.push({
          key: path.split('/')[1],
          name: item.tag,
          data: [{
            path: path,
            method: item.method,
            description: item.description,
            parameters: item.parameters,
            responses: item.responses
          }]
        })
      }
    }
  }
  return {
    flatApiObj: result,
    formatApiData: formatRes
  }
}

/**
 * 获取请求参数
 * @param {*} data 原数据
 * @param {*} parameters 原请求参数
 * @returns 处理后的请求参数
 */
function getParameters(data, parameters) {
  let result = {}
  for (let i = 0; i < parameters.length; i++) {
    const obj = parameters[i]
    if (obj.name === 'command') {
      result = handleParametersDefinitions(data, obj.schema.$ref)
    } else {
      const value = generateParametersDefaultvalue(obj.type)
      result[obj.name] = value
    }
    delete result['userId']
  }
  return result
}

/**
 * 处理请求参数 Definitions
 * @param {*} data 原数据
 * @param {*} ref ref
 * @returns definitions 参数解析后的值
 */
function handleParametersDefinitions(data, ref) {
  const refs = ref.split('/')
  const definitionKey = refs[refs.length - 1]
  const params = data.definitions[definitionKey]
  if (params.type === 'object') {
    const obj = {}
    const propertiesKeys = Object.keys(params.properties)
    for (let i = 0; i < propertiesKeys.length; i++) {
      obj[propertiesKeys[i]] = generateParametersDefaultvalue(params.properties[propertiesKeys[i]].type)
    }
    return obj
  } else {
    return {}
  }
}

/**
 * 请求参数映射类型到值
 * @param {*} type 类型
 * @returns 类型映射的初始值
 */
function generateParametersDefaultvalue(type) {
  let value = ''
  switch (type) {
    case 'string': value = ''; break;
    case 'integer': value = 0; break;
    case 'boolean': value = false; break;
    case 'array': value = []; break;
    case 'object': value = {}; break;
    case 'file': value = {}; break;
    default: value = ''
  }
  return value
}

/**
 * 获取响应参数
 * @param {*} data 原数据
 * @param {*} responses 原响应参数
 * @returns 处理后的响应参数
 */
function getResponses(data, responses) {
  let result = null
  const ref = responses[200]?.schema?.$ref
  if (ref) {
    result = handleResponsesDefinitions(data, ref, 0)
  }
  return result
}

/**
 * 处理响应参数 Definitions
 * @param {*} data 原数据
 * @param {*} ref ref
 * @param {*} level 层级（每递归一次层级加一）
 * @returns definitions 参数解析后的值
 */
function handleResponsesDefinitions(data, ref, level) {
  if (!ref || level >= 3) {
    return {}
  }
  level++
  const refs = ref.split('/')
  const definitionKey = refs[refs.length - 1]
  const params = data.definitions[definitionKey]
  const properties = params?.properties
  if (properties && properties?.errorCode) {
    if (properties?.data?.$ref) {
      const newRef = properties.data.$ref
      let definitionsRes = null
      if (newRef) {
        definitionsRes = handleResponsesDefinitions(data, newRef, level)
      }
      return definitionsRes
    } else if (properties?.data?.items?.$ref) {
      const newRef = properties.data.items.$ref
      let definitionsRes = null
      if (newRef) {
        definitionsRes = [handleResponsesDefinitions(data, newRef, level)]
      }
    } else {
      return null
    }
  } else if (properties instanceof Object) {
    const obj = {}
    const propertiesKeys = Object.keys(properties)
    for (let i = 0; i < propertiesKeys.length; i++) {
      obj[propertiesKeys[i]] = generateResponsesDefaultvalue(data, properties[propertiesKeys[i]], level)
    }
    return obj
  } else {
    return {}
  }
}

/**
 * 响应参数映射类型到值
 * @param {*} data 原数据
 * @param {*} params 参数
 * @param {*} level 层级
 * @returns 映射或者处理后的值
 */
function generateResponsesDefaultvalue(data, params, level) {
  let value = ''
  const type = params.type
  if (type) {
    switch (type) {
      case 'string': value = ''; break;
      case 'integer': value = 0; break;
      case 'boolean': value = false; break;
      case 'array':
        if (params.items?.$ref) {
          value = [handleResponsesDefinitions(data, params.items.$ref, level)];
        } else {
          value = ['']
        }
        break;
      case 'object': value = {}; break;
      case 'file': value = {}; break;
      default: value = ''
    }
  } else {
    value = handleResponsesDefinitions(data, params.$ref, level)
  }
  return value
}