import { action, makeObservable, observable } from 'mobx'

class LinkState {
  constructor() {
    makeObservable(this, {
      linkedApiArr: observable,
      linkedColumnArr: observable,
      setLinkedApiArr: action,
      setLinkedColumnArr: action,
    })
  }

  linkedApiArr = [] // 当前已经关联的接口数据
  linkedColumnArr = [] // 当前已经关联的字段数据

  setLinkedApiArr(arr: any) {
    this.linkedApiArr = arr
  }
  setLinkedColumnArr(arr: any) {
    this.linkedColumnArr = arr
  }
}
const linkState = new LinkState()
export default linkState
