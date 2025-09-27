

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
    showToggleButton?: boolean | null;
    /**
    * トグルボタンの位置
    */
    toggleButtonPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    /**
     * トグルボタンがドキュメントのDrawerの位置に従うか
     */
    toggleButtonFollowsDrawerPosition ?: boolean;
    /**
     * ドキュメントのDrawerの位置
     */
    drawerPosition?: 'left' | 'right';
    /**
     * ドキュメントDrawerの初期幅
     */
    drawerWidth: number;
    /**
     * ドキュメントDrawerの最大幅
     */
    drawerMaxWidth?: number;
    /**
     * ドキュメントDrawerの最小幅
     */
    drawerMinWidth?: number;
    /**
     * ドキュメントDrawerの幅の単位
     */
    drawerWidthUnit?: 'px' | '%';
    /**
     * ドキュメントDrawerのリサイズを可能にするか
     */
    resizable?: boolean;
    /**
     * ドキュメントDrawerを閉じたときにフレームをリフレッシュするか
     */
    refreshFrameOnClose?: boolean;
    /**
     * ドキュメントDrawerを外部クリックで閉じるか
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
     * QRコードのドットカラー
     */
    qrcodeImageColor?: string;
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
    /**
     * ドキュメントDrawerのボタンを表示するか
     */
    showDrawerButtons: ("close" | "position-change" | "external-link" | "qrcode")[];
}

export interface SideDocumentI18NText {
    toggleButtonOpenTooltip: string;
    toggleButtonCloseTooltip: string;
    closeButtonTooltip: string;
    externalLinkTooltip: string;
    positionChangeButtonTooltip: string;
    qrcodeButtonTooltip: string;
    qrcodeCloseButton: string;
    resizeBarTooltip: string;
    documentTitle: string;
}