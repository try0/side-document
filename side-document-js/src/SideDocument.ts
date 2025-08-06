import { mount, unmount } from "svelte";
import SideDocumentContainer from "./lib/SideDocumentContainer.svelte";
import type { SideDocumentI18NText, SideDocumentOption } from "./types";


/**
 * メインクラス
 */
export class SideDocument {
    /**
     * デフォルトのi18nテキスト
     */
    public static defaultI18NText: SideDocumentI18NText = {
        toggleButtonOpenTooltip: '開く',
        toggleButtonCloseTooltip: '閉じる',
        closeButtonTooltip: '閉じる',
        externalLinkTooltip: '新しいタブで開く',
        positionChangeButtonTooltip: '表示位置を変更',
        resizeBarTooltip: 'サイズを変更',
        documentTitle: "ドキュメント"
    };

    /**
     * デフォルトのオプション
     */
    public static defaultOption: SideDocumentOption = {
        /**
         * コンテナセレクター
         */
        containerSelector: undefined,
        /**
         * トグルボタンを有効にするか
         */
        showToggleButton: true,
        /**
         * トグルボタンの位置
         */
        toggleButtonPosition: 'bottom-right',
        /**
         * ドキュメントのDrawerの位置
         */
        drawerPosition: 'right',
        /**
         * ドキュメントDrawerの幅
         */
        drawerWidth: 320,
        /**
         * ドキュメントDrawerの幅の単位
         */
        drawerWidthUnit: 'px',
        /**
         * ドキュメントDrawerのリサイズを可能にするか
         */
        resizable: true,
        /**
         * ドキュメントDrawerを外部クリックで閉じるか
         */
        closeOnOutsideClick: false,
        /**
         * ドキュメントDrawerを閉じたときにフレームをリフレッシュするか
         */
        refreshFrameOnClose: false,
        /**
         * 初期ページのURL
         */
        defaultSrc: '',
        /**
         * プライマリカラー
         */
        primaryColor: '#236ad4',
        /**
         * ドキュメントDrawerのz-index
         */
        drawerZIndex: 1000,
        /**
         * トグルボタンのz-index
         */
        toggleButtonZIndex: 1001,
        /**
         * i18nテキスト
         */
        i18nText: SideDocument.defaultI18NText,
        /**
         * ドキュメントDrawerのボタンを表示するか
         */
        showDrawerButtons: ["close", "position-change", "external-link"],
    };



    container?: HTMLElement;
    option: SideDocumentOption;
    documentContainer: SideDocumentContainer;

    constructor(option?: SideDocumentOption) {
        this.option = Object.assign({}, SideDocument.defaultOption, option);
    }

    private createContainer() {

        const existingContainer = document.querySelector("#sd-container");
        if (existingContainer) {
            existingContainer.shadowRoot!.innerHTML = '';
            return existingContainer as HTMLDivElement;
        }

        const container = document.createElement('div');
        container.id = 'sd-container';
        container.classList.add('sd-container');
        document.body.appendChild(container);
        container.attachShadow({ mode: 'open' });
        container.shadowRoot;
        return container;
    }

    /**
     * オプションを更新します。
     * 
     * @param option 
     */
    public async update(option: SideDocumentOption | null = null): Promise<void> {
        if (option) {
            this.option = Object.assign({}, SideDocument.defaultOption, this.option, option);
        }

        if (this.documentContainer) {
            await unmount(this.documentContainer);
        }

        this.init();
    }

    /**
     * SideDocumentを初期化します。
     * 
     * @returns void
     */
    public init(): void {
        console.log("SideDocument initialized");

        if (this.option.containerSelector) {
            this.container = document.querySelector(this.option.containerSelector) as HTMLDivElement;
            if (!this.container) {
                console.warn(`Container with selector "${this.option.containerSelector}" not found. Creating a new container.`);
            }
        }

        if (!this.container) {
            this.container = this.createContainer();
        }

        this.documentContainer = mount(SideDocumentContainer, {
            target: this.container.shadowRoot ? this.container.shadowRoot : this.container,
            props: {
                initOption: this.option,
            },
        });

    }

    /**
     * Drawerを開きます。
     * 
     * @param frameSrc 
     */
    public openDrawer(frameSrc?: string): void {
        if (this.documentContainer) {
            this.documentContainer.openDrawer(frameSrc);
        } else {
            console.warn("SideDocument is not initialized. Call init() before open().");
        }
    }

    /**
     * Drawerを閉じます。
     */
    public closeDrawer(): void {
        if (this.documentContainer) {
            this.documentContainer.closeDrawer();
        } else {
            console.warn("SideDocument is not initialized. Call init() before close().");
        }
    }

    /**
     * Drawerの展開を切り替えます。
     */
    public toggleDrawer(): void {
        if (this.documentContainer) {
            this.documentContainer.toggleDrawer();
        } else {
            console.warn("SideDocument is not initialized. Call init() before toggle().");
        }
    }

}