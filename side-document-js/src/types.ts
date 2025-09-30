

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
    toggleButtonFollowsDrawerPosition?: boolean;
    /**
     * ドキュメントのDrawerの位置
     */
    drawerPosition?: 'left' | 'right';
    /**
     * ドキュメントDrawerの初期幅
     */
    drawerWidth?: number;
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
    i18nText?: SideDocumentI18NText;
    /**
     * ドキュメントDrawerのボタンを表示するか
     */
    showDrawerButtons: ("close" | "position-change" | "external-link" | "qrcode" | "resize" | "pin")[];
    /**
     * 状態をローカルストレージに保存するか
     * ドロワーの開閉状態、位置、幅
     * トグルボタンの位置
     */
    persistState?: boolean;
    /**
     * persistStateがtrueの場合に、保存しないプロパティ
     * 例えば、['isOpen']とすると、ドロワーの開閉状態は保存されない
     */
    ignorePersistProps?: ("is-opened" | "drawer-position" | "drawer-width-px" | "toggle-button-position" | "is-pinned")[];
    /**
     * ローカルストレージのキーのプレフィックス
     */
    storageKeyPrefix?: string;
    /**
     * ポップオーバーとして表示するか
     */
    renderAsPopover?: boolean;
    /**
     * ポップオーバー表示時にバックドロップを表示するか
     */
    showBackdrop?: boolean;
}

export interface SideDocumentI18NText {
    toggleButtonOpenTooltip: string;
    toggleButtonCloseTooltip: string;
    closeButtonTooltip: string;
    externalLinkTooltip: string;
    positionChangeButtonTooltip: string;
    qrcodeButtonTooltip: string;
    pinButtonTooltip: string;
    unpinButtonTooltip: string;
    qrcodeCloseButton: string;
    qrcodeDownloadButtonTooltip: string;
    qrcodeCopyButtonTooltip: string;
    qrcodeCopySuccessMessage: string;
    qrcodeCopyErrorMessage: string;
    resizeBarTooltip: string;
    documentTitle: string;
}

export interface SideDocumentPersistedState {
    isOpened: boolean;
    drawerPosition: 'left' | 'right';
    drawerWidthPx: number;
    toggleButtonPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    frameSrc?: string | null;
    isPinned?: boolean;
}