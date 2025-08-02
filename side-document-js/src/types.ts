

/**
 * オプション
 */
export interface SideDocumentOption {
    /**
 * トグルボタンを有効にするか
 */
    enableToggleButton?: boolean | null;
    /**
 * トグルボタンの位置
 */
    toggleButtonPosition?: 'top' | 'bottom';
    /**
 * ドキュメントのDrawerの位置
 */
    documentDrawerPosition?: 'left' | 'right';
    /**
  * ドキュメントDrawerの幅
  */
    drawerWidth?: number;
    /**
  * ドキュメントDrawerのリサイズを可能にするか
  */
    resizable?: boolean;
    /**
 * ドキュメントDrawerを外部クリックで閉じるか
 */
    refreshFrameOnClose?: boolean;
    /**
  * ドキュメントDrawerを閉じたときにフレームをリフレッシュするか
  */
    closeOnOutsideClick?: boolean;
    /**
* 初期ページのURL
*/
    defaultSrc?: string;
    /**
     * プライマリカラー
     */
    primaryColor?: string;

    /**
     * ドキュメントDrawerのz-index
     */
    drawerZIndex?: number;
    /**
     * トグルボタンのz-index
     */
    toggleButtonZIndex?: number;
    /**
     * i18nテキスト
     */
    i18nText: SideDocumentI18NText;
}

export interface SideDocumentI18NText {
    toggleButtonOpenTooltip: string;
    toggleButtonCloseTooltip: string;
    closeButtonTooltip: string;
    externalLinkTooltip: string;
    positionChangeButtonTooltip: string;
    resizeBarTooltip: string;
    documentTitle: string;
}