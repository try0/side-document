

/**
 * オプション
 */
export interface SideDocumentOption {
    /**
     * コンテナセレクター
     */
    containerSelector?: string;
    /**
    * トグルボタンを有効にするか
    */
    enableToggleButton?: boolean | null;
    /**
    * トグルボタンの位置
    */
    toggleButtonPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    /**
     * ドキュメントのDrawerの位置
     */
    documentDrawerPosition?: 'left' | 'right';
    /**
     * ドキュメントDrawerの初期幅
     */
    drawerWidth: number;
    /**
     * ドキュメントDrawerの幅の単位
     */
    drawerWidthUnit?: 'px' | '%';
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