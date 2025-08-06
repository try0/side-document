import { mount } from 'svelte'
import DemoApp from './DemoApp.svelte'

// 開発用Appコンポーネント
const app = mount(DemoApp, {
  target: document.getElementById('app')!,
})

export default app
