import { mount } from "svelte";
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
         * トグルボタンを有効にするか
         */
        enableToggleButton: true,
        /**
         * トグルボタンの位置
         */
        toggleButtonPosition: 'bottom',
        /**
         * ドキュメントのDrawerの位置
         */
        documentDrawerPosition: 'right',
        /**
         * ドキュメントDrawerの幅
         */
        drawerWidth: 320,
        /**
         * ドキュメントDrawerのリサイズを可能にするか
         */
        resizable: true,
        /**
         * ドキュメントDrawerを外部クリックで閉じるか
         */
        closeOnOutsideClick: true,
        /**
         * ドキュメントDrawerを閉じたときにフレームをリフレッシュするか
         */
        refreshFrameOnClose: false,
        /**
         * 初期ページのURL
         */
        defaultSrc: 'https://try0.github.io/mkdocs-toc-md/sample/site/mkdocs-toc-md.html#usage',
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
    };



    container?: HTMLDivElement;
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

    public setOption(option: SideDocumentOption): void {
        this.option = { ...this.option, ...option };
    }


    public init(): void {
        console.log("SideDocument initialized");
        if (!this.container) {
            this.container = this.createContainer();
        } else {
            this.container.shadowRoot!.innerHTML = '';
        }

        this.documentContainer = mount(SideDocumentContainer, {
            target: this.container.shadowRoot!,
            props: {
                option: this.option,
            },
        });

    }

}