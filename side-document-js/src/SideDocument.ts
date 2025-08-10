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
    public static DEFAULT_I18N_TEXT: SideDocumentI18NText = Object.freeze({
        toggleButtonOpenTooltip: '開く',
        toggleButtonCloseTooltip: '閉じる',
        closeButtonTooltip: '閉じる',
        externalLinkTooltip: '新しいタブで開く',
        positionChangeButtonTooltip: '表示位置を変更',
        resizeBarTooltip: 'サイズを変更',
        documentTitle: "ドキュメント"
    });

    /**
     * デフォルトのオプション
     */
    public static DEFAULT_OPTION: SideDocumentOption = Object.freeze({
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
        i18nText: SideDocument.DEFAULT_I18N_TEXT,
        /**
         * ドキュメントDrawerのボタンを表示するか
         */
        showDrawerButtons: ["close", "position-change", "external-link"] as ("close" | "position-change" | "external-link")[],
    });



    container?: HTMLElement;
    option: SideDocumentOption;
    documentContainer: SideDocumentContainer;

    constructor(option?: SideDocumentOption) {
        this.option = Object.assign({}, SideDocument.DEFAULT_OPTION, option);
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
            this.option = Object.assign({}, SideDocument.DEFAULT_OPTION, this.option, option);
        }

        if (this.documentContainer) {
            this.documentContainer.updateOption(this.option);
        }
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

    /**
     * Drawerのコンテンツを設定します。
     * 
     * @param content 
     */
    public setDrawerContent(content: HTMLElement | string | undefined = undefined): void {
        if (this.documentContainer) {
            if (!content) {
                const nodes = Array.from(document.querySelectorAll('[data-sd-document]')) as HTMLElement[];

                const wrapper = document.createElement('div');
                nodes.forEach(node => {

                    let docElement: HTMLElement | DocumentFragment;
                    if (node.tagName === 'TEMPLATE') {
                        const template = node as HTMLTemplateElement;
                        docElement = template.content.cloneNode(true) as DocumentFragment;
                    } else {
                        // それ以外の要素はそのまま追加
                        docElement = node.cloneNode(true) as HTMLElement;
                    }

                    // ドキュメント→ページ内要素へのリンク生成
                    const linkHolders = Array.from(docElement.querySelectorAll('[data-sd-link-target]')) as HTMLElement[];
                    linkHolders.forEach(linkHolder => {
                        let linkElementSelector: string | null = linkHolder.getAttribute('data-sd-link-target');
                        if (!linkElementSelector) return;
                        linkElementSelector = linkElementSelector.trim();
                        if (!linkElementSelector) return;

                        const linkButton = document.createElement('button');
                        linkButton.className = 'sd-link-button';
                        linkButton.type = 'button';
                        linkButton.innerHTML =
                            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" ' +
                            'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
                            'stroke-linecap="round" stroke-linejoin="round">' +
                            '<path stroke="none" d="M0 0h24v24H0z" fill="none"/>' +
                            '<path d="M16 4h2a2 2 0 0 1 2 2v2" />' +
                            '<path d="M20 16v2a2 2 0 0 1 -2 2h-2" />' +
                            '<path d="M8 20h-2a2 2 0 0 1 -2 -2v-2" />' +
                            '<path d="M4 8v-2a2 2 0 0 1 2 -2h2" />' +
                            '</svg>';

                        linkButton.addEventListener('click', () => {
                            const targetElement = document.querySelector(linkElementSelector!) as HTMLElement | null;
                            if (targetElement) {
                                const offset = 80;
                                const rect = targetElement.getBoundingClientRect();
                                const fullyVisible =
                                    rect.top >= offset &&
                                    rect.bottom <= window.innerHeight;

                                if (!fullyVisible) {
                                    const top = Math.max(0, rect.top + window.scrollY - offset);
                                    window.scrollTo({ top, behavior: 'smooth' });
                                }
                                this.documentContainer.addEffectTargetElement(targetElement);
                            }
                        });

                        linkHolder.appendChild(linkButton);
                    });

                    wrapper.appendChild(docElement);
                });
                this.documentContainer.setDrawerContent(wrapper);
            } else {
                this.documentContainer.setDrawerContent(content);
            }
        } else {
            console.warn("SideDocument is not initialized. Call init() before setDrawerContent().");
        }
    }

    public setFrameSrc(src: string | undefined | null): void {
        if (this.documentContainer) {
            this.documentContainer.setFrameSrc(src);
        } else {
            console.warn("SideDocument is not initialized. Call init() before setFrameSrc().");
        }
    }

}