<script lang="ts">
    import { onDestroy, onMount, tick } from "svelte";
    import { SideDocument } from "./SideDocument";
    import type {
        SideDocumentI18NText,
        SideDocumentInternalOption,
    } from "./types";

    // 開発用Appコンポーネント

    type DemoLanguage = "ja" | "en";
    type IgnorePersistProp =
        SideDocumentInternalOption["ignorePersistProps"][number];
    type DrawerButton = SideDocumentInternalOption["showDrawerButtons"][number];

    const DEMO_OPTION_STORAGE_KEY = "demoAppOption";
    const DEMO_LANGUAGE_STORAGE_KEY = "demoAppLanguage";
    const DEMO_OPTION_STORAGE_VERSION = 2;

    type DemoSavedOption = Partial<SideDocumentInternalOption> & {
        demoOptionStorageVersion?: number;
    };

    const sideDocumentI18nText: Record<DemoLanguage, SideDocumentI18NText> = {
        ja: SideDocument.DEFAULT_I18N_TEXT,
        en: {
            toggleButtonOpenTooltip: "Open",
            toggleButtonCloseTooltip: "Close",
            closeButtonTooltip: "Close",
            externalLinkTooltip: "Open in new tab",
            positionChangeButtonTooltip: "Change position",
            qrcodeButtonTooltip: "Show QR code",
            pinButtonTooltip: "Pin",
            unpinButtonTooltip: "Unpin",
            qrcodeCloseButton: "Close",
            qrcodeDownloadButtonTooltip: "Download image",
            qrcodeCopyButtonTooltip: "Copy image",
            qrcodeCopySuccessMessage: "Copied",
            qrcodeCopyErrorMessage: "Copy failed",
            resizeBarTooltip: "Resize",
            documentTitle: "Document",
        },
    };

    const demoI18n = {
        ja: {
            title: "Side Document サンプル",
            languageLabel: "言語",
            reset: "リセット",
            pageElementTab: "ページ要素",
            pageElementDoc:
                "ページからdata-sd-documentアトリビュートを持つ要素を、Drawerコンテンツとして設定できます。",
            settingsTitle: "設定",
            functionsTitle: "機能",
            toggleButtonGroup: "トグルボタン",
            drawerGroup: "ドロワー",
            behaviorGroup: "動作",
            stylingGroup: "スタイル",
            drawerControlGroup: "ドロワー操作",
            showToggleButtonLabel: "表示する",
            showToggleButtonDocLine1:
                "トグルボタンを表示するかどうかを設定します。",
            showToggleButtonDocLine2:
                "トグルボタンはDrawerの開閉を切り替えるためのボタンです。",
            toggleButtonPositionLabel: "ボタンの位置",
            toggleButtonPositionDocPrefix: "トグルボタンの位置を設定します。",
            toggleButtonPositionDocSuffix:
                "が有効な場合、Drawerの位置に応じて自動的に位置が調整されます。",
            toggleButtonFollowsDrawerPositionLabel:
                "Drawer位置にトグルボタン位置を追従させる",
            toggleButtonFollowsDrawerPositionDoc:
                "Drawer位置にトグルボタン位置を追従させるかどうかを設定します。",
            drawerPositionLabel: "Drawerの位置",
            drawerPositionDocLine1: "Drawerの位置を設定します。",
            drawerPositionDocLine2:
                "Drawerは画面の左または右に表示されます。",
            drawerWidthLabel: "初期サイズ",
            drawerWidthDoc: "Drawerの初期サイズを設定します。",
            drawerWidthUnitLabel: "初期サイズの単位",
            drawerWidthUnitDoc: "Drawerの初期サイズの単位を設定します。",
            drawerMinWidthLabel: "最小サイズ",
            drawerMinWidthDoc:
                "ドロワーの最小サイズを設定します。リサイズ時に適用されます。",
            drawerMaxWidthLabel: "最大サイズ",
            drawerMaxWidthDoc:
                "ドロワーの最大サイズを設定します。リサイズ時に適用されます。",
            resizableLabel: "リサイズを有効にする",
            resizableDoc: "Drawerのリサイズを有効にするかどうかを設定します。",
            persistStateLabel: "状態を保存する",
            persistStateDoc: "Drawerの状態を保存するかどうかを設定します。",
            renderAsPopoverBefore: "",
            popoverLink: "ポップオーバー",
            renderAsPopoverMiddle: "として",
            renderAsPopoverAfter: "で表示する",
            renderAsPopoverDoc:
                "Drawerをポップオーバーとして表示するかどうかを設定します。",
            ignorePersistPropsLabel: "保存しないプロパティ",
            ignorePersistPropsDoc:
                "Drawerの状態を保存しないプロパティを設定します。",
            defaultSrcLabel: "デフォルトドキュメントURL",
            defaultSrcDoc: "Drawerに表示するデフォルトurlを指定します。",
            showDrawerButtonsLabel: "ドロワー内に表示するボタン",
            showDrawerButtonsDoc: "Drawer操作用のボタンを設定します。",
            showBackdropLabel:
                "Drawer表示時にバックグラウンドをグレーアウトする",
            showBackdropDoc:
                "Drawer表示時にバックグラウンドをグレーアウトするかどうかを設定します。",
            closeOnOutsideClickLabel: "外部クリックで閉じる",
            closeOnOutsideClickDoc:
                "ドロワー外をクリックしたときにドロワーを閉じるかどうかを設定します。",
            refreshFrameOnCloseLabel: "ドロワーを閉じた時にiframeを再読み込み",
            refreshFrameOnCloseDocLine1:
                "ドロワーを閉じた際にiframeの内容を再読み込みするかどうかを設定します。",
            refreshFrameOnCloseDocLine2:
                "iframe内でのインタラクティブな変更を元に戻したい場合に有効化します。",
            primaryColorLabel: "プライマリカラー",
            qrcodeImageColorLabel: "QRコードの画像カラー",
            openDrawerDescription: "Drawerを開く",
            closeDrawerDescription: "Drawerを閉じる",
            toggleDrawerDescription: "Drawerを切り替える",
            left: "左",
            right: "右",
            topLeft: "左上",
            topRight: "右上",
            bottomLeft: "左下",
            bottomRight: "右下",
            isOpened: "開閉状態",
            drawerWidthPx: "Drawer幅(px)",
            drawerPosition: "Drawer位置",
            toggleButtonPosition: "トグルボタン位置",
            isPinned: "ピン留め状態",
            close: "閉じる",
            externalLink: "外部リンク",
            qrcode: "QRコード",
            resize: "リサイズ",
            positionChange: "位置切替",
            pin: "ピン留め",
        },
        en: {
            title: "Side Document Example",
            languageLabel: "Language",
            reset: "Reset",
            pageElementTab: "Page element",
            pageElementDoc:
                "Elements with the data-sd-document attribute can be used as Drawer content.",
            settingsTitle: "Settings",
            functionsTitle: "Functions",
            toggleButtonGroup: "Toggle Button",
            drawerGroup: "Drawer",
            behaviorGroup: "Behavior",
            stylingGroup: "Styling",
            drawerControlGroup: "Drawer Control",
            showToggleButtonLabel: "Show",
            showToggleButtonDocLine1:
                "Configure whether the toggle button is shown.",
            showToggleButtonDocLine2:
                "The toggle button opens and closes the Drawer.",
            toggleButtonPositionLabel: "Button position",
            toggleButtonPositionDocPrefix:
                "Configure the toggle button position.",
            toggleButtonPositionDocSuffix:
                "is enabled, the position is adjusted automatically from the Drawer position.",
            toggleButtonFollowsDrawerPositionLabel:
                "Follow the Drawer position",
            toggleButtonFollowsDrawerPositionDoc:
                "Configure whether the toggle button follows the Drawer position.",
            drawerPositionLabel: "Drawer position",
            drawerPositionDocLine1: "Configure the Drawer position.",
            drawerPositionDocLine2:
                "The Drawer is displayed on the left or right side of the screen.",
            drawerWidthLabel: "Initial size",
            drawerWidthDoc: "Configure the initial Drawer size.",
            drawerWidthUnitLabel: "Initial size unit",
            drawerWidthUnitDoc: "Configure the unit for the initial Drawer size.",
            drawerMinWidthLabel: "Minimum size",
            drawerMinWidthDoc:
                "Configure the minimum Drawer size. It is applied while resizing.",
            drawerMaxWidthLabel: "Maximum size",
            drawerMaxWidthDoc:
                "Configure the maximum Drawer size. It is applied while resizing.",
            resizableLabel: "Enable resizing",
            resizableDoc: "Configure whether the Drawer can be resized.",
            persistStateLabel: "Persist state",
            persistStateDoc: "Configure whether the Drawer state is saved.",
            renderAsPopoverBefore: "Show as ",
            popoverLink: "Popover",
            renderAsPopoverMiddle: " in the ",
            renderAsPopoverAfter: "",
            renderAsPopoverDoc:
                "Configure whether the Drawer is displayed as a popover.",
            ignorePersistPropsLabel: "Properties not saved",
            ignorePersistPropsDoc:
                "Configure which Drawer state properties should not be saved.",
            defaultSrcLabel: "Default document URL",
            defaultSrcDoc: "Specify the default URL displayed in the Drawer.",
            showDrawerButtonsLabel: "Buttons shown in the Drawer",
            showDrawerButtonsDoc:
                "Configure the buttons used to control the Drawer.",
            showBackdropLabel: "Dim the background while the Drawer is open",
            showBackdropDoc:
                "Configure whether the background is dimmed while the Drawer is open.",
            closeOnOutsideClickLabel: "Close on outside click",
            closeOnOutsideClickDoc:
                "Configure whether the Drawer closes when clicking outside it.",
            refreshFrameOnCloseLabel: "Reload iframe when the Drawer closes",
            refreshFrameOnCloseDocLine1:
                "Configure whether iframe content is reloaded when the Drawer closes.",
            refreshFrameOnCloseDocLine2:
                "Enable this when you want to reset interactive changes inside the iframe.",
            primaryColorLabel: "Primary color",
            qrcodeImageColorLabel: "QR code image color",
            openDrawerDescription: "Open the Drawer",
            closeDrawerDescription: "Close the Drawer",
            toggleDrawerDescription: "Toggle the Drawer",
            left: "Left",
            right: "Right",
            topLeft: "Top left",
            topRight: "Top right",
            bottomLeft: "Bottom left",
            bottomRight: "Bottom right",
            isOpened: "Open state",
            drawerWidthPx: "Drawer width (px)",
            drawerPosition: "Drawer position",
            toggleButtonPosition: "Toggle button position",
            isPinned: "Pinned state",
            close: "Close",
            externalLink: "External link",
            qrcode: "QR code",
            resize: "Resize",
            positionChange: "Change position",
            pin: "Pin",
        },
    } as const;

    function getInitialLanguage(): DemoLanguage {
        const savedLanguage = localStorage.getItem(DEMO_LANGUAGE_STORAGE_KEY);
        if (savedLanguage === "ja" || savedLanguage === "en") {
            return savedLanguage;
        }
        return navigator.language.toLowerCase().startsWith("ja") ? "ja" : "en";
    }

    function getSampleSrc(language: DemoLanguage): string {
        return `./sample.html?lang=${language}`;
    }

    function isSampleSrc(src: string | null | undefined): boolean {
        return !src || /^\.\/sample\.html(?:\?.*)?$/.test(src);
    }

    function createInitialOption(): SideDocumentInternalOption {
        const initialOption = Object.assign({}, SideDocument.DEFAULT_OPTION);
        initialOption.defaultSrc = getSampleSrc(language);
        initialOption.qrcodeImageColor = initialOption.primaryColor;

        const savedOption = loadOption();
        if (savedOption) {
            Object.assign(initialOption, savedOption);
        }
        if (isSampleSrc(initialOption.defaultSrc)) {
            initialOption.defaultSrc = getSampleSrc(language);
        }
        initialOption.i18nText = sideDocumentI18nText[language];

        return initialOption;
    }

    function applyLanguage(nextLanguage: DemoLanguage): void {
        document.documentElement.lang = nextLanguage;
        localStorage.setItem(DEMO_LANGUAGE_STORAGE_KEY, nextLanguage);

        let shouldUpdateApp = false;
        if (isSampleSrc(option.defaultSrc)) {
            const nextSampleSrc = getSampleSrc(nextLanguage);
            if (option.defaultSrc !== nextSampleSrc) {
                option.defaultSrc = nextSampleSrc;
                app.setFrameSrc(nextSampleSrc);
                shouldUpdateApp = true;
            }
        }
        if (option.i18nText !== sideDocumentI18nText[nextLanguage]) {
            option.i18nText = sideDocumentI18nText[nextLanguage];
            shouldUpdateApp = true;
        }
        if (shouldUpdateApp) {
            app.update(option);
        }
    }

    async function changeLanguage(event: Event): Promise<void> {
        const target = event.target as HTMLSelectElement | null;
        const nextLanguage: DemoLanguage =
            target?.value === "en" ? "en" : "ja";

        if (language === nextLanguage) {
            return;
        }
        language = nextLanguage;
        await tick();
        applyLanguage(nextLanguage);
        if (contentType === "page-element") {
            app.setDrawerContent();
        }
    }

    let language: DemoLanguage = $state(getInitialLanguage());
    let t = $derived(demoI18n[language]);

    let contentType: "iframe" | "page-element" = $state("iframe");
    $effect(() => {
        if (contentType === "iframe") {
            app.setFrameSrc(option.defaultSrc ?? "");
        } else if (contentType === "page-element") {
            option.showToggleButton = true;
            option.drawerWidth = 400;
            option.drawerWidthUnit = "px";

            app.setDrawerContent();
        }
    });

    let option = $state(createInitialOption());
    let app = new SideDocument(option);

    let updatingId: number | null = null;
    let preOption = $state(Object.assign({}, SideDocument.DEFAULT_OPTION));

    $effect(() => {
        let refresh = false;
        let upd = false;
        if (option.drawerPosition !== preOption.drawerPosition) {
            upd = true;
        }

        if (option.drawerWidthUnit !== preOption.drawerWidthUnit) {
            upd = true;
        }
        if (option.drawerWidth !== preOption.drawerWidth) {
            upd = true;
        }

        if (option.drawerMinWidth !== preOption.drawerMinWidth) {
            upd = true;
        }

        if (option.drawerMaxWidth !== preOption.drawerMaxWidth) {
            upd = true;
        }

        if (option.showToggleButton !== preOption.showToggleButton) {
            upd = true;
        }
        if (option.toggleButtonPosition !== preOption.toggleButtonPosition) {
            upd = true;
        }
        if (option.resizable !== preOption.resizable) {
            upd = true;
        }
        if (option.closeOnOutsideClick !== preOption.closeOnOutsideClick) {
            upd = true;
        }
        if (option.refreshFrameOnClose !== preOption.refreshFrameOnClose) {
            upd = true;
        }

        if (option.primaryColor !== preOption.primaryColor) {
            upd = true;
        }

        if (option.qrcodeImageColor !== preOption.qrcodeImageColor) {
            upd = true;
        }

        if (option.defaultSrc !== preOption.defaultSrc) {
            upd = true;
        }

        if (option.i18nText !== preOption.i18nText) {
            upd = true;
        }

        if (
            option.toggleButtonFollowsDrawerPosition !==
            preOption.toggleButtonFollowsDrawerPosition
        ) {
            upd = true;
            refresh = true;
        }

        if (option.persistState !== preOption.persistState) {
            upd = true;
            refresh = true;
            if (option.persistState === false) {
                // 状態保存を無効にした場合、保存された状態をクリア
                app.clearPersistedState();
            }
        }

        if (option.renderAsPopover !== preOption.renderAsPopover) {
            upd = true;
            refresh = true;
        }

        if (option.showBackdrop !== preOption.showBackdrop) {
            upd = true;
        }

        if (
            JSON.stringify(option.ignorePersistProps) !==
            JSON.stringify(preOption.ignorePersistProps)
        ) {
            upd = true;
            refresh = true;
        }

        if (
            JSON.stringify(option.showDrawerButtons) !==
            JSON.stringify(preOption.showDrawerButtons)
        ) {
            upd = true;
        }

        if (upd) {
            saveOption();
            if (updatingId) {
                clearTimeout(updatingId);
            }
            updatingId = window.setTimeout(() => {
                if (refresh) {
                    app.destroy();
                    app = new SideDocument(option);
                    app.render();
                } else {
                    app.update(option);
                }
                preOption = Object.assign({}, option);
                updatingId = null;
            }, 200);
        }
    });

    function saveOption() {
        const {
            i18nText: _i18nText,
            showToggleButton: _showToggleButton,
            ...savedOption
        } = option;
        localStorage.setItem(
            DEMO_OPTION_STORAGE_KEY,
            JSON.stringify(
                {
                    ...savedOption,
                    demoOptionStorageVersion: DEMO_OPTION_STORAGE_VERSION,
                },
                null,
                2,
            ),
        );
    }

    function loadOption(): Partial<SideDocumentInternalOption> | null {
        const v = localStorage.getItem(DEMO_OPTION_STORAGE_KEY);
        if (v) {
            try {
                const savedOption = JSON.parse(v) as DemoSavedOption;
                if (
                    savedOption.demoOptionStorageVersion !==
                    DEMO_OPTION_STORAGE_VERSION
                ) {
                    localStorage.removeItem(DEMO_OPTION_STORAGE_KEY);
                    return null;
                }
                const {
                    demoOptionStorageVersion: _demoOptionStorageVersion,
                    ...rest
                } = savedOption;
                rest.showToggleButton = true;
                return rest;
            } catch (e) {
                console.error(e);
            }
        }
        return null;
    }

    function resetOption() {
        option = Object.assign({}, SideDocument.DEFAULT_OPTION);
        option.defaultSrc = getSampleSrc(language); // 初期ページURLを設定
        option.qrcodeImageColor = option.primaryColor; // QRコードのドットカラーを設定
        option.i18nText = sideDocumentI18nText[language];
        saveOption();
    }

    onMount(async () => {
        document.documentElement.lang = language;
        localStorage.setItem(DEMO_LANGUAGE_STORAGE_KEY, language);
        option.showToggleButton = true;
        preOption = Object.assign({}, option);
        await app.render();
    });

    onDestroy(() => {});

    // トグルボタン位置のオプション
    let positionOptions = $derived.by(() => [
        { value: "top-left", label: t.topLeft },
        { value: "top-right", label: t.topRight },
        { value: "bottom-left", label: t.bottomLeft },
        { value: "bottom-right", label: t.bottomRight },
    ]);

    // 記録無効プロパティー
    let ignorePersistPropsOptions = $derived.by(
        (): { value: IgnorePersistProp; label: string }[] => [
            { value: "is-opened", label: t.isOpened },
            { value: "drawer-width-px", label: t.drawerWidthPx },
            { value: "drawer-position", label: t.drawerPosition },
            { value: "toggle-button-position", label: t.toggleButtonPosition },
            { value: "is-pinned", label: t.isPinned },
        ],
    );

    // ドロワーボタン
    let showDrawerButtonsOptions = $derived.by(
        (): { value: DrawerButton; label: string }[] => [
            { value: "close", label: t.close },
            { value: "external-link", label: t.externalLink },
            { value: "qrcode", label: t.qrcode },
            { value: "resize", label: t.resize },
            { value: "position-change", label: t.positionChange },
            { value: "pin", label: t.pin },
        ],
    );
</script>

<main class="app-container">
    <div style="display:flex; align-items: center; gap: 0.5rem; padding-bottom: 0.5rem;">
        <h1 style="flex:1;">{t.title}</h1>
        <a href="https://github.com/try0/side-document" aria-label="GitHub"
            ><img
                src="data:image/svg+xml,%3csvg%20width='98'%20height='96'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M48.854%200C21.839%200%200%2022%200%2049.217c0%2021.756%2013.993%2040.172%2033.405%2046.69%202.427.49%203.316-1.059%203.316-2.362%200-1.141-.08-5.052-.08-9.127-13.59%202.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015%204.934.326%207.523%205.052%207.523%205.052%204.367%207.496%2011.404%205.378%2014.235%204.074.404-3.178%201.699-5.378%203.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283%200-5.378%201.94-9.778%205.014-13.2-.485-1.222-2.184-6.275.486-13.038%200%200%204.125-1.304%2013.426%205.052a46.97%2046.97%200%200%201%2012.214-1.63c4.125%200%208.33.571%2012.213%201.63%209.302-6.356%2013.427-5.052%2013.427-5.052%202.67%206.763.97%2011.816.485%2013.038%203.155%203.422%205.015%207.822%205.015%2013.2%200%2018.905-11.404%2023.06-22.324%2024.283%201.78%201.548%203.316%204.481%203.316%209.126%200%206.6-.08%2011.897-.08%2013.526%200%201.304.89%202.853%203.316%202.364%2019.412-6.52%2033.405-24.935%2033.405-46.691C97.707%2022%2075.788%200%2048.854%200z'%20fill='%2324292f'/%3e%3c/svg%3e"
                alt=""
                style="height: 2rem;width: 2rem;"
            /></a
        >
    </div>
    <div style="padding: 0.5rem 0; display: flex; gap: 0.5rem;">
        <div style="flex: auto"></div>
        <label class="language-control">
            <span>{t.languageLabel}</span>
            <select
                value={language}
                on:change={changeLanguage}
                aria-label={t.languageLabel}
            >
                <option value="ja">日本語</option>
                <option value="en">English</option>
            </select>
        </label>
        <button on:click={resetOption} class="button-base">{t.reset}</button>
    </div>

    <div class="container">
        <!-- <div class="tab-bar">
            <button
                type="button"
                class:tab-active={contentType === "iframe"}
                on:click={() => (contentType = "iframe")}
            >
                iframe
            </button>
            <button
                type="button"
                class:tab-active={contentType === "page-element"}
                on:click={() => (contentType = "page-element")}
            >
                {t.pageElementTab}
            </button>
            <template data-sd-document>
                <div style="padding: 10px;">
                    <h1>setDrawerContent()</h1>
                    <p>
                        {t.pageElementDoc}
                    </p>
                </div>
            </template>
        </div> -->

        <!-- 左側：設定パネル -->
        <div class="settings-panel">
            <h2 class="panel-title">{t.settingsTitle}</h2>

            <!-- トグルボタン設定 -->
            <div class="setting-group">
                <div class="setting-header">{t.toggleButtonGroup}</div>

                <div class="setting-content">
                    <div id="showToggleButton" class="setting-row">
                        <div class="setting-label">
                            <code>showToggleButton</code>
                            <div class="label-description">
                                {t.showToggleButtonLabel}
                            </div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#showToggleButton">
                                    showToggleButton
                                </h3>
                                <p>
                                    {t.showToggleButtonDocLine1}
                                    <br />
                                    {t.showToggleButtonDocLine2}
                                </p>
                            </div>
                        </template>
                        <div class="setting-control">
                            <label class="toggle-switch">
                                <input
                                    type="checkbox"
                                    bind:checked={option.showToggleButton}
                                />
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    <div id="toggleButtonPosition" class="setting-row">
                        <div class="setting-label">
                            <code>toggleButtonPosition</code>
                            <div class="label-description">
                                {t.toggleButtonPositionLabel}
                            </div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#toggleButtonPosition">
                                    toggleButtonPosition
                                </h3>
                                <p>
                                    {t.toggleButtonPositionDocPrefix}
                                    <span
                                        data-sd-link-target="#toggleButtonFollowsDrawerPosition"
                                        >toggleButtonFollowsDrawerPosition</span
                                    >
                                    {t.toggleButtonPositionDocSuffix}
                                    <br />
                                </p>
                            </div>
                        </template>
                        <div class="setting-control radio-group">
                            {#each positionOptions as pos}
                                <label class="radio-option">
                                    <input
                                        type="radio"
                                        name="position"
                                        value={pos.value}
                                        bind:group={option.toggleButtonPosition}
                                    />
                                    <span>{pos.label}</span>
                                </label>
                            {/each}
                        </div>
                    </div>

                    <div
                        id="toggleButtonFollowsDrawerPosition"
                        class="setting-row"
                    >
                        <div class="setting-label">
                            <code>toggleButtonFollowsDrawerPosition</code>
                            <div class="label-description">
                                {t.toggleButtonFollowsDrawerPositionLabel}
                            </div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3
                                    data-sd-link-target="#toggleButtonFollowsDrawerPosition"
                                >
                                    toggleButtonFollowsDrawerPosition
                                </h3>
                                <p>
                                    {t.toggleButtonFollowsDrawerPositionDoc}
                                </p>
                            </div>
                        </template>
                        <div class="setting-control">
                            <label class="toggle-switch">
                                <input
                                    type="checkbox"
                                    bind:checked={
                                        option.toggleButtonFollowsDrawerPosition
                                    }
                                />
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ドロワー設定 -->
            <div class="setting-group">
                <div class="setting-header">{t.drawerGroup}</div>

                <div class="setting-content">
                    <div id="drawerPosition" class="setting-row">
                        <div class="setting-label">
                            <code>drawerPosition</code>
                            <div class="label-description">
                                {t.drawerPositionLabel}
                            </div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#drawerPosition">
                                    drawerPosition
                                </h3>
                                <p>
                                    {t.drawerPositionDocLine1}
                                    <br />
                                    {t.drawerPositionDocLine2}
                                </p>
                            </div>
                        </template>
                        <div class="setting-control radio-group">
                            <label class="radio-option">
                                <input
                                    type="radio"
                                    name="drawer-position"
                                    value="left"
                                    bind:group={option.drawerPosition}
                                />
                                <span>{t.left}</span>
                            </label>
                            <label class="radio-option">
                                <input
                                    type="radio"
                                    name="drawer-position"
                                    value="right"
                                    bind:group={option.drawerPosition}
                                />
                                <span>{t.right}</span>
                            </label>
                        </div>
                    </div>

                    <div id="drawerWidth" class="setting-row">
                        <div class="setting-label">
                            <code>drawerWidth</code>
                            <div class="label-description">
                                {t.drawerWidthLabel}
                            </div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#drawerWidth">
                                    drawerWidth
                                </h3>
                                <p>{t.drawerWidthDoc}</p>
                            </div>
                        </template>
                        <div class="setting-control size-input-group">
                            <input
                                type="number"
                                min={option.drawerWidthUnit === "px" ? 100 : 10}
                                max={option.drawerWidthUnit === "px"
                                    ? 800
                                    : option.drawerWidthUnit === "%"
                                      ? 80
                                      : 320}
                                bind:value={option.drawerWidth}
                                class="width-input"
                            />
                            <span class="unit-text"
                                >{option.drawerWidthUnit}</span
                            >
                        </div>
                    </div>

                    <div id="drawerWidthUnit" class="setting-row">
                        <div class="setting-label">
                            <code>drawerWidthUnit</code>
                            <div class="label-description">
                                {t.drawerWidthUnitLabel}
                            </div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#drawerWidthUnit">
                                    drawerWidthUnit
                                </h3>
                                <p>{t.drawerWidthUnitDoc}</p>
                            </div>
                        </template>
                        <div class="setting-control unit-selector">
                            <label class="radio-option">
                                <input
                                    type="radio"
                                    name="width-unit"
                                    value="px"
                                    bind:group={option.drawerWidthUnit}
                                    on:change={() => {
                                        if (option.drawerWidth > 800) {
                                            option.drawerWidth = 800;
                                        }
                                    }}
                                />
                                <span>px</span>
                            </label>
                            <label class="radio-option">
                                <input
                                    type="radio"
                                    name="width-unit"
                                    value="%"
                                    bind:group={option.drawerWidthUnit}
                                    on:change={() => {
                                        if (option.drawerWidth > 80) {
                                            option.drawerWidth = 80;
                                        }
                                    }}
                                />
                                <span>%</span>
                            </label>
                        </div>
                    </div>
                    <!-- drawerWidthUnit 設定の後に追加 -->
                    <div id="drawerMinWidth" class="setting-row">
                        <div class="setting-label">
                            <code>drawerMinWidth</code>
                            <div class="label-description">
                                {t.drawerMinWidthLabel}
                            </div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#drawerMinWidth">
                                    drawerMinWidth
                                </h3>
                                <p>
                                    {t.drawerMinWidthDoc}
                                </p>
                            </div>
                        </template>
                        <div class="setting-control size-input-group">
                            <input
                                type="number"
                                min={option.drawerWidthUnit === "px" ? 100 : 10}
                                max={option.drawerWidthUnit === "px"
                                    ? 500
                                    : option.drawerWidthUnit === "%"
                                      ? 40
                                      : 320}
                                bind:value={option.drawerMinWidth}
                                class="width-input"
                            />
                            <span class="unit-text"
                                >{option.drawerWidthUnit}</span
                            >
                        </div>
                    </div>

                    <div id="drawerMaxWidth" class="setting-row">
                        <div class="setting-label">
                            <code>drawerMaxWidth</code>
                            <div class="label-description">
                                {t.drawerMaxWidthLabel}
                            </div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#drawerMaxWidth">
                                    drawerMaxWidth
                                </h3>
                                <p>
                                    {t.drawerMaxWidthDoc}
                                </p>
                            </div>
                        </template>
                        <div class="setting-control size-input-group">
                            <input
                                type="number"
                                min={option.drawerWidthUnit === "px" ? 300 : 20}
                                max={option.drawerWidthUnit === "px"
                                    ? 1200
                                    : option.drawerWidthUnit === "%"
                                      ? 95
                                      : 320}
                                bind:value={option.drawerMaxWidth}
                                class="width-input"
                            />
                            <span class="unit-text"
                                >{option.drawerWidthUnit}</span
                            >
                        </div>
                    </div>
                    <div id="resizable" class="setting-row">
                        <div class="setting-label">
                            <code>resizable</code>
                            <div class="label-description">
                                {t.resizableLabel}
                            </div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#resizable">
                                    resizable
                                </h3>
                                <p>
                                    {t.resizableDoc}
                                </p>
                            </div>
                        </template>
                        <div class="setting-control">
                            <label class="toggle-switch">
                                <input
                                    type="checkbox"
                                    bind:checked={option.resizable}
                                />
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    <div id="persistState" class="setting-row">
                        <div class="setting-label">
                            <code>persistState</code>
                            <div class="label-description">
                                {t.persistStateLabel}
                            </div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#persistState">
                                    persistState
                                </h3>
                                <p>
                                    {t.persistStateDoc}
                                </p>
                            </div>
                        </template>
                        <div class="setting-control">
                            <label class="toggle-switch">
                                <input
                                    type="checkbox"
                                    bind:checked={option.persistState}
                                />
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    <div id="renderAsPopover" class="setting-row">
                        <div class="setting-label">
                            <code>renderAsPopover</code>
                            <div class="label-description">
                                {t.renderAsPopoverBefore}
                                <a
                                    href="https://developer.mozilla.org/ja/docs/Web/API/HTMLElement/showPopover"
                                    target="_blank">{t.popoverLink}</a
                                >{t.renderAsPopoverMiddle}<a
                                    href="https://developer.mozilla.org/ja/docs/Glossary/Top_layer"
                                    target="_blank">Top layer</a
                                >{t.renderAsPopoverAfter}
                            </div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#renderAsPopover">
                                    renderAsPopover
                                </h3>
                                <p>
                                    {t.renderAsPopoverDoc}
                                </p>
                            </div>
                        </template>
                        <div class="setting-control">
                            <label class="toggle-switch">
                                <input
                                    type="checkbox"
                                    bind:checked={option.renderAsPopover}
                                />
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    <div id="ignorePersistProps" class="setting-row">
                        <div class="setting-label">
                            <code>ignorePersistProps</code>
                            <div class="label-description">
                                {t.ignorePersistPropsLabel}
                            </div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#ignorePersistProps">
                                    ignorePersistProps
                                </h3>
                                <p>
                                    {t.ignorePersistPropsDoc}
                                </p>
                            </div>
                        </template>
                        <div class="setting-control">
                            {#each ignorePersistPropsOptions as opt}
                                <label class="radio-option">
                                    <input
                                        type="checkbox"
                                        value={opt.value}
                                        checked={option.ignorePersistProps?.includes(
                                            opt.value,
                                        )}
                                        on:change={(e) => {
                                            const target =
                                                e.target as HTMLInputElement | null;
                                            if (target && target.checked) {
                                                option.ignorePersistProps = [
                                                    ...(option.ignorePersistProps ??
                                                        []),
                                                    opt.value,
                                                ];
                                            } else if (target) {
                                                option.ignorePersistProps =
                                                    option.ignorePersistProps?.filter(
                                                        (v) => v !== opt.value,
                                                    );
                                            }
                                        }}
                                    />
                                    <span>{opt.label}</span>
                                </label>
                            {/each}
                        </div>
                    </div>

                    <div id="defaultSrc" class="setting-row">
                        <div class="setting-label">
                            <code>defaultSrc</code>
                            <div class="label-description">
                                {t.defaultSrcLabel}
                            </div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#defaultSrc">
                                    defaultSrc
                                </h3>
                                <p>
                                    {t.defaultSrcDoc}
                                </p>
                            </div>
                        </template>
                        <div class="setting-control full-width">
                            <input
                                type="text"
                                bind:value={option.defaultSrc}
                                placeholder="https://example.com/docs"
                                class="url-input"
                            />
                        </div>
                    </div>
                    <div id="showDrawerButtons" class="setting-row">
                        <div class="setting-label">
                            <code>showDrawerButtons</code>
                            <div class="label-description">
                                {t.showDrawerButtonsLabel}
                            </div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#showDrawerButtons">
                                    showDrawerButtons
                                </h3>
                                <p>{t.showDrawerButtonsDoc}</p>
                            </div>
                        </template>
                        <div class="setting-control">
                            {#each showDrawerButtonsOptions as opt}
                                <label class="radio-option">
                                    <input
                                        type="checkbox"
                                        value={opt.value}
                                        checked={option.showDrawerButtons.includes(
                                            opt.value,
                                        )}
                                        on:change={(e) => {
                                            const target =
                                                e.target as HTMLInputElement | null;
                                            if (target && target.checked) {
                                                option.showDrawerButtons = [
                                                    ...option.showDrawerButtons,
                                                    opt.value,
                                                ];
                                            } else if (target) {
                                                option.showDrawerButtons =
                                                    option.showDrawerButtons.filter(
                                                        (v) => v !== opt.value,
                                                    );
                                            }
                                        }}
                                    />
                                    <span>{opt.label}</span>
                                </label>
                            {/each}
                        </div>
                    </div>

                    <div id="showBackdrop" class="setting-row">
                        <div class="setting-label">
                            <code>showBackdrop</code>
                            <div class="label-description">
                                {t.showBackdropLabel}
                            </div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#showBackdrop">
                                    showBackdrop
                                </h3>
                                <p>
                                    {t.showBackdropDoc}
                                </p>
                            </div>
                        </template>
                        <div class="setting-control">
                            <label class="toggle-switch">
                                <input
                                    type="checkbox"
                                    bind:checked={option.showBackdrop}
                                />
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 動作設定 -->
            <div class="setting-group">
                <div class="setting-header">{t.behaviorGroup}</div>

                <div class="setting-content">
                    <div id="closeOnOutsideClick" class="setting-row">
                        <div class="setting-label">
                            <code>closeOnOutsideClick</code>
                            <div class="label-description">
                                {t.closeOnOutsideClickLabel}
                            </div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#closeOnOutsideClick">
                                    closeOnOutsideClick
                                </h3>
                                <p>
                                    {t.closeOnOutsideClickDoc}
                                </p>
                            </div>
                        </template>
                        <div class="setting-control">
                            <label class="toggle-switch">
                                <input
                                    type="checkbox"
                                    bind:checked={option.closeOnOutsideClick}
                                />
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    <div id="refreshFrameOnClose" class="setting-row">
                        <div class="setting-label">
                            <code>refreshFrameOnClose</code>
                            <div class="label-description">
                                {t.refreshFrameOnCloseLabel}
                            </div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#refreshFrameOnClose">
                                    refreshFrameOnClose
                                </h3>
                                <p>
                                    {t.refreshFrameOnCloseDocLine1}
                                    {t.refreshFrameOnCloseDocLine2}
                                </p>
                            </div>
                        </template>
                        <div class="setting-control">
                            <label class="toggle-switch">
                                <input
                                    type="checkbox"
                                    bind:checked={option.refreshFrameOnClose}
                                />
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- スタイリング設定 -->
            <div class="setting-group">
                <div class="setting-header">{t.stylingGroup}</div>

                <div class="setting-content">
                    <div id="primaryColor" class="setting-row">
                        <div class="setting-label">
                            <code>primaryColor</code>
                            <div class="label-description">
                                {t.primaryColorLabel}
                            </div>
                        </div>
                        <div class="setting-control color-picker-control">
                            <input
                                type="color"
                                bind:value={option.primaryColor}
                                class="color-picker"
                            />
                            <input
                                type="text"
                                bind:value={option.primaryColor}
                                class="color-text"
                                placeholder="#236ad4"
                            />
                        </div>
                    </div>
                    <div id="qrcodeImageColor" class="setting-row">
                        <div class="setting-label">
                            <code>qrcodeImageColor</code>
                            <div class="label-description">
                                {t.qrcodeImageColorLabel}
                            </div>
                        </div>
                        <div class="setting-control color-picker-control">
                            <input
                                type="color"
                                bind:value={option.qrcodeImageColor}
                                class="color-picker"
                            />
                            <input
                                type="text"
                                bind:value={option.qrcodeImageColor}
                                class="color-text"
                                placeholder="#236ad4"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 右側：機能パネル -->
        <div class="functions-panel">
            <h2 class="panel-title">{t.functionsTitle}</h2>

            <div class="function-group">
                <div class="function-header">{t.drawerControlGroup}</div>

                <div class="function-content">
                    <button
                        class="function-button"
                        on:click={() => app.openDrawer()}
                    >
                        <div class="function-name">openDrawer()</div>
                        <div class="function-description">
                            {t.openDrawerDescription}
                        </div>
                    </button>

                    <button
                        class="function-button"
                        on:click={() => app.closeDrawer()}
                    >
                        <div class="function-name">closeDrawer()</div>
                        <div class="function-description">
                            {t.closeDrawerDescription}
                        </div>
                    </button>

                    <button
                        class="function-button"
                        on:click={() => app.toggleDrawer()}
                    >
                        <div class="function-name">toggleDrawer()</div>
                        <div class="function-description">
                            {t.toggleDrawerDescription}
                        </div>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- SideDocumentコンポーネント -->
    <!-- <SideDocumentContainer {option} /> -->
</main>
<style>
    .app-container {
        font-family: Arial, sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
    }

    .container {
        /* display: flex; */
        gap: 20px;
        flex-wrap: wrap;
    }

    .tab-bar {
        display: flex;
        gap: 8px;
        padding: 10px;
        background: #f0f0f0;
        border-radius: 6px;
    }
    .tab-bar button {
        padding: 8px 22px;
        border: none;
        border-radius: 6px 6px;
        background: #e3e8f0;
        color: #236ad4;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition:
            background 0.18s,
            color 0.18s;
        outline: none;
    }
    .tab-bar button.tab-active {
        background: #236ad4;
        color: #fff;
        font-weight: bold;
        box-shadow: 0 2px 8px #236ad420;
        z-index: 1;
    }

    .panel-title {
        font-size: 1.5rem;
        margin-bottom: 20px;
        color: #333;
        border-bottom: 2px solid #eee;
        padding-bottom: 10px;
    }

    /* 設定パネル */
    .settings-panel,
    .functions-panel {
        background-color: #f8f9fa;
        border-radius: 10px;
        padding: 15px;
        flex: 1;
        min-width: 350px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .setting-group,
    .function-group {
        margin-bottom: 25px;
        border: 1px solid #e6e6e6;
        border-radius: 8px;
        overflow: hidden;
    }

    .setting-header,
    .function-header {
        background-color: #f0f0f0;
        padding: 12px 15px;
        font-weight: bold;
        color: #333;
    }

    .setting-content,
    .function-content {
        padding: 15px;
        background-color: #fff;
    }

    .setting-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 12px 0;
        border-bottom: 1px solid #eee;
    }

    .setting-row:last-child {
        border-bottom: none;
    }

    .setting-label {
        font-size: 14px;
        color: #555;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    code {
        font-family: monospace;
        font-size: 13px;
        color: #0066cc;
        font-weight: 500;
    }

    .label-description {
        color: #555;
        font-size: 14px;
    }

    .setting-control {
        display: flex;
        align-items: center;
    }

    /* ラジオボタングループ */
    .radio-group {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
    }

    .radio-option {
        display: flex;
        align-items: center;
        cursor: pointer;
    }

    .radio-option input {
        margin-right: 5px;
    }

    /* サイズ入力 */
    .size-input-group {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .width-input {
        width: 70px;
        padding: 6px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    .unit-text {
        color: #666;
        font-size: 14px;
    }

    .unit-selector {
        display: flex;
        gap: 15px;
    }

    .language-control {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        color: #555;
        font-size: 0.9rem;
    }

    .language-control select {
        padding: 0.25rem 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        background: #fff;
        color: #222;
    }

    /* トグルスイッチ */
    .toggle-switch {
        position: relative;
        display: inline-block;
        width: 40px;
        height: 20px;
    }

    .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        border-radius: 20px;
        transition: 0.3s;
    }

    .toggle-slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        border-radius: 50%;
        transition: 0.3s;
    }

    input:checked + .toggle-slider {
        background-color: #236ad4;
    }

    input:checked + .toggle-slider:before {
        transform: translateX(20px);
    }

    /* 機能ボタン */
    .function-button {
        display: flex;
        flex-direction: column;
        padding: 12px 15px;
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.2s;
        margin-bottom: 10px;
        text-align: left;
    }

    .function-button:hover {
        background-color: #f5f5f5;
        border-color: #ccc;
    }

    .function-button:last-child {
        margin-bottom: 0;
    }

    .function-name {
        font-family: monospace;
        font-size: 14px;
        color: #0066cc;
        margin-bottom: 5px;
    }

    .function-description {
        font-size: 13px;
        color: #555;
    }

    /* 入力欄の共通スタイル */
    input[type="text"],
    input[type="number"],
    input[type="color"] {
        padding: 6px 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 15px;
        background: #fff;
        color: #222;
        transition:
            border-color 0.2s,
            box-shadow 0.2s;
        outline: none;
        box-sizing: border-box;
    }

    input[type="text"]:focus,
    input[type="number"]:focus,
    input[type="color"]:focus {
        border-color: #236ad4;
        box-shadow: 0 0 0 2px color-mix(in srgb, #236ad4 30%, #fff 70%);
        outline: 2px solid #236ad4;
        outline-offset: 2px;
        z-index: 2;
    }

    /* カラーピッカーとテキストカラー入力の並び調整 */
    .color-picker-control {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .color-picker {
        width: 32px;
        height: 32px;
        padding: 0 1px !important;
        border: none;
        background: none;
    }

    .color-text {
        width: 110px;
        min-width: 80px;
        max-width: 140px;
        font-family: monospace;
    }

    @media (max-width: 600px) {
        .app-container {
            max-width: 100vw;
            padding: 0px;
        }

        .container {
            display: block;
            gap: 0;
        }

        .settings-panel,
        .functions-panel {
            min-width: 0;
            width: 100%;
            box-sizing: border-box;
            padding: 10px 4px;
            margin-bottom: 18px;
        }

        .panel-title {
            font-size: 1.1rem;
            padding-bottom: 6px;
            margin-bottom: 12px;
        }

        .setting-content,
        .function-content {
            padding: 8px 2px;
        }

        .setting-row {
            flex-direction: column;
            align-items: stretch;
            padding: 8px 5px;
        }

        .setting-label {
            font-size: 13px;
            margin-bottom: 4px;
        }

        .setting-control,
        .radio-group,
        .size-input-group,
        .unit-selector,
        .color-picker-control {
            flex-wrap: wrap;
            gap: 8px;
        }

        .width-input,
        .color-text {
            width: 100%;
            min-width: 0;
            max-width: 100%;
        }

        .function-button {
            padding: 10px 8px;
            font-size: 15px;
        }
    }

    .button-base {
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: white;
        background-color: #236ad4;
        border: none;
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
        padding: 0.25rem;
        border-radius: 0.25em;
        cursor: pointer;
        z-index: var(--sd-drawer-z-index, 1000);
    }

    .button-base:hover {
        background-color: #1a4f9c;
    }
</style>
