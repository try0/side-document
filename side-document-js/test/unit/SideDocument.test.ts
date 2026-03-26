import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushSync, tick } from 'svelte'
import { SideDocument, initialize } from '../../src/SideDocument'

// QRCode は Canvas が必要なためモック
vi.mock('qrcode', () => ({
    default: {
        toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mock'),
    },
}))

/** Shadow DOM 内の要素を取得するヘルパー */
function getShadowElement<T extends Element>(selector: string): T | null {
    const host = document.querySelector('#sd-container')
    return (host?.shadowRoot?.querySelector(selector) ?? null) as T | null
}

describe('SideDocument', () => {
    let sd: SideDocument

    afterEach(() => {
        sd?.destroy()
        localStorage.clear()
    })

    // ─────────────────────────────────────────────
    // 初期化
    // ─────────────────────────────────────────────
    describe('initialize()', () => {
        it('SideDocument インスタンスを返す', async () => {
            sd = await initialize()
            expect(sd).toBeInstanceOf(SideDocument)
        })

        it('#sd-container が document.body に追加される', async () => {
            sd = await initialize()
            expect(document.querySelector('#sd-container')).not.toBeNull()
        })

        it('initialize() の関数エクスポートでも初期化できる', async () => {
            sd = await initialize({ primaryColor: '#ff0000' })
            expect(sd).toBeInstanceOf(SideDocument)
        })
    })

    // ─────────────────────────────────────────────
    // destroy()
    // ─────────────────────────────────────────────
    describe('destroy()', () => {
        it('#sd-container が DOM から削除される', async () => {
            sd = await initialize()
            sd.destroy()
            expect(document.querySelector('#sd-container')).toBeNull()
        })

        it('destroy() を複数回呼んでもエラーにならない', async () => {
            sd = await initialize()
            expect(() => {
                sd.destroy()
                sd.destroy()
            }).not.toThrow()
        })
    })

    // ─────────────────────────────────────────────
    // ドロワー開閉
    // ─────────────────────────────────────────────
    describe('ドロワーの開閉', () => {
        beforeEach(async () => {
            sd = await initialize()
        })

        it('初期状態では閉じている', () => {
            expect(sd.isOpenedDrawer()).toBe(false)
        })

        it('openDrawer() で開く', async () => {
            sd.openDrawer()
            flushSync()
            expect(sd.isOpenedDrawer()).toBe(true)
        })

        it('closeDrawer() で閉じる', async () => {
            sd.openDrawer()
            flushSync()
            sd.closeDrawer()
            flushSync()
            expect(sd.isOpenedDrawer()).toBe(false)
        })

        it('toggleDrawer() で開閉を切り替える', async () => {
            sd.toggleDrawer()
            flushSync()
            expect(sd.isOpenedDrawer()).toBe(true)

            sd.toggleDrawer()
            flushSync()
            expect(sd.isOpenedDrawer()).toBe(false)
        })
    })

    // ─────────────────────────────────────────────
    // コールバック
    // ─────────────────────────────────────────────
    describe('コールバック', () => {
        describe('onOpen', () => {
            it('openDrawer(url) 呼び出し時に url を渡して呼ばれる', async () => {
                const onOpen = vi.fn()
                sd = await initialize({ onOpen })
                sd.openDrawer('https://example.com')
                expect(onOpen).toHaveBeenCalledOnce()
                expect(onOpen).toHaveBeenCalledWith('https://example.com')
            })

            it('openDrawer() を url なしで呼んだ場合は defaultSrc を渡す', async () => {
                const onOpen = vi.fn()
                sd = await initialize({ defaultSrc: 'https://default.com', onOpen })
                sd.openDrawer()
                expect(onOpen).toHaveBeenCalledWith('https://default.com')
            })

            it('openDrawer() を url なしかつ defaultSrc なしの場合は空文字を渡す', async () => {
                const onOpen = vi.fn()
                sd = await initialize({ onOpen })
                sd.openDrawer()
                expect(onOpen).toHaveBeenCalledWith('')
            })

            it('openDrawer() を複数回呼ぶと呼び出し回数が増える', async () => {
                const onOpen = vi.fn()
                sd = await initialize({ onOpen })
                sd.openDrawer('https://a.com')
                sd.closeDrawer()
                sd.openDrawer('https://b.com')
                expect(onOpen).toHaveBeenCalledTimes(2)
                expect(onOpen).toHaveBeenLastCalledWith('https://b.com')
            })
        })

        describe('onClose', () => {
            it('closeDrawer() 呼び出し時に呼ばれる', async () => {
                const onClose = vi.fn()
                sd = await initialize({ onClose })
                sd.openDrawer()
                sd.closeDrawer()
                expect(onClose).toHaveBeenCalledOnce()
            })

            it('ドロワーが閉じている状態で closeDrawer() を呼んでも呼ばれる', async () => {
                const onClose = vi.fn()
                sd = await initialize({ onClose })
                sd.closeDrawer()
                expect(onClose).toHaveBeenCalledOnce()
            })
        })

        describe('onOpen / onClose の組み合わせ', () => {
            it('open → close → open の順で正しく呼ばれる', async () => {
                const onOpen = vi.fn()
                const onClose = vi.fn()
                sd = await initialize({ onOpen, onClose })

                sd.openDrawer('https://a.com')
                sd.closeDrawer()
                sd.openDrawer('https://b.com')

                expect(onOpen).toHaveBeenCalledTimes(2)
                expect(onClose).toHaveBeenCalledTimes(1)
            })
        })

        describe('onPositionChange', () => {
            it('位置変更ボタンをクリックすると呼ばれる', async () => {
                const onPositionChange = vi.fn()
                sd = await initialize({
                    drawerPosition: 'right',
                    onPositionChange,
                })
                sd.openDrawer()
                await tick() // Svelte が {#if isOpened} ブロックを描画するのを待つ

                const btn = getShadowElement<HTMLButtonElement>(
                    '[aria-label="表示位置を変更"]',
                )
                expect(btn).not.toBeNull()
                btn!.click()

                expect(onPositionChange).toHaveBeenCalledOnce()
                expect(onPositionChange).toHaveBeenCalledWith(
                    expect.stringMatching(/^(left|right)$/),
                )
            })

            it('right → left → right と交互に切り替わる', async () => {
                const onPositionChange = vi.fn()
                sd = await initialize({
                    drawerPosition: 'right',
                    onPositionChange,
                })
                sd.openDrawer()
                await tick()

                const btn = getShadowElement<HTMLButtonElement>(
                    '[aria-label="表示位置を変更"]',
                )!
                btn.click()
                expect(onPositionChange).toHaveBeenLastCalledWith('left')
                btn.click()
                expect(onPositionChange).toHaveBeenLastCalledWith('right')
            })
        })

        describe('onResize', () => {
            it('リサイズバーのドラッグ完了時に新しい幅で呼ばれる', async () => {
                const onResize = vi.fn()
                sd = await initialize({ onResize, drawerWidth: 380 })
                sd.openDrawer()
                await tick()

                const resizeBar = getShadowElement<HTMLSpanElement>('.sd-resize-bar')
                expect(resizeBar).not.toBeNull()

                // mousedown でリサイズ開始
                resizeBar!.dispatchEvent(
                    new MouseEvent('mousedown', { bubbles: true, clientX: 500 }),
                )
                // mousemove でドラッグ（左へ 100px）
                window.dispatchEvent(
                    new MouseEvent('mousemove', { bubbles: true, clientX: 400 }),
                )
                // mouseup でリサイズ完了
                window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))

                expect(onResize).toHaveBeenCalledOnce()
                expect(onResize).toHaveBeenCalledWith(expect.any(Number))
            })
        })
    })

    // ─────────────────────────────────────────────
    // persistState / clearPersistedState
    // ─────────────────────────────────────────────
    describe('clearPersistedState()', () => {
        it('localStorage からドロワーの状態を削除する', async () => {
            sd = await initialize({ persistState: true, storageKeyPrefix: 'test' })
            sd.openDrawer()
            await tick()

            // localStorage に何か保存されていることを確認
            const key = 'test-state'
            // 少し待って save のスロットリングが走るようにする
            await new Promise(resolve => setTimeout(resolve, 600))
            expect(localStorage.getItem(key)).not.toBeNull()

            sd.clearPersistedState()
            expect(localStorage.getItem(key)).toBeNull()
        })
    })

    // ─────────────────────────────────────────────
    // update()
    // ─────────────────────────────────────────────
    describe('update()', () => {
        it('オプションを動的に更新できる', async () => {
            sd = await initialize({ primaryColor: '#000000' })
            await expect(sd.update({ primaryColor: '#ff0000' })).resolves.not.toThrow()
        })
    })
})
