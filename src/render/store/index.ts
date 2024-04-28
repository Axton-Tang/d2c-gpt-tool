// store/index.ts
import { useContext, createContext } from 'react'
import fileState from './state/FileState'
import linkState from './state/LinkState'

class RootStore {
  fileState = fileState
  linkState = linkState
}
const store = new RootStore()

const Context = createContext(store)

// 自定义 hooks
export const useStore = () => {
  return useContext(Context)
}