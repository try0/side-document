import { mount } from 'svelte'
import App from './App.svelte'

// 開発用Appコンポーネント
const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
