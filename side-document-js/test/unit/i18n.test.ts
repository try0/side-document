import { describe, it, expect } from 'vitest'
import { str } from '../../src/lib/i18n'
import { SideDocument } from '../../src/SideDocument'

const TEXT = SideDocument.DEFAULT_I18N_TEXT

describe('i18n str()', () => {
    it('指定キーのテキストを返す', () => {
        expect(str(TEXT, 'closeButtonTooltip')).toBe('閉じる')
        expect(str(TEXT, 'toggleButtonOpenTooltip')).toBe('開く')
        expect(str(TEXT, 'documentTitle')).toBe('ドキュメント')
    })

    it('テキストが空の場合は defaultValue を返す', () => {
        const empty = { ...TEXT, closeButtonTooltip: '' }
        expect(str(empty, 'closeButtonTooltip', 'fallback')).toBe('fallback')
    })

    it('テキストが空で defaultValue も指定なしの場合は空文字を返す', () => {
        const empty = { ...TEXT, closeButtonTooltip: '' }
        expect(str(empty, 'closeButtonTooltip')).toBe('')
    })

    it('defaultValue が null でも空文字を返す', () => {
        const empty = { ...TEXT, closeButtonTooltip: '' }
        expect(str(empty, 'closeButtonTooltip', null)).toBe('')
    })
})
