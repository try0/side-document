import { describe, it, expect, beforeEach } from 'vitest'
import { save, load, remove, getStateKey } from '../../src/lib/storage'
import type { SideDocumentPersistedState } from '../../src/types'

const STATE: SideDocumentPersistedState = {
    isOpened: true,
    drawerPosition: 'right',
    drawerWidthPx: 400,
    toggleButtonPosition: 'bottom-right',
    frameSrc: 'https://example.com',
    isPinned: false,
}

describe('storage', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    describe('save / load', () => {
        it('保存した状態を復元できる', () => {
            save('test-key', STATE)
            expect(load('test-key')).toEqual(STATE)
        })

        it('frameSrc が null でも保存できる', () => {
            const state = { ...STATE, frameSrc: null }
            save('test-key', state)
            expect(load('test-key')).toEqual(state)
        })

        it('isPinned が true でも保存できる', () => {
            const state = { ...STATE, isPinned: true }
            save('test-key', state)
            expect(load('test-key')?.isPinned).toBe(true)
        })
    })

    describe('load', () => {
        it('存在しないキーは null を返す', () => {
            expect(load('nonexistent')).toBeNull()
        })
    })

    describe('remove', () => {
        it('保存した状態を削除できる', () => {
            save('test-key', STATE)
            remove('test-key')
            expect(load('test-key')).toBeNull()
        })

        it('存在しないキーを削除してもエラーにならない', () => {
            expect(() => remove('nonexistent')).not.toThrow()
        })
    })

    describe('getStateKey', () => {
        it('プレフィックスを付けたキーを返す', () => {
            expect(getStateKey('myapp')).toBe('myapp-state')
        })

        it('undefined の場合はデフォルトプレフィックスを使う', () => {
            expect(getStateKey(undefined)).toBe('sd--state')
        })

        it('空文字の場合もデフォルトプレフィックスを使う', () => {
            expect(getStateKey('')).toBe('sd--state')
        })
    })
})
