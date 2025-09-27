<script lang="ts">
    import { getContext, onDestroy, onMount } from "svelte";
    import type { SideDocumentOption } from "../types";
    import { str } from "./i18n";
    import QRCode from "qrcode";

    /**
     * オプション
     */
    const option: SideDocumentOption = getContext("option");

    /**
     * rootコンテナ
     */
    let {
        containerRootElement,
        isOpened = $bindable(),
        drawerId = "sd-drawer-panel",
    }: {
        containerRootElement: HTMLElement;
        isOpened: boolean;
        drawerId: string;
    } = $props();

    $effect(() => {
        if (isOpened) {
            drawerToggleClass = "open";
        } else {
            drawerToggleClass = "close";

            if (option.refreshFrameOnClose && isVisibleFrame) {
                isVisibleFrame = false;
                setTimeout(() => {
                    isVisibleFrame = true;
                }, 300);
            }
        }
    });

    $effect(() => {
        if (option.closeOnOutsideClick) {
            window.addEventListener("mousedown", onClickOutside);
        } else {
            window.removeEventListener("mousedown", onClickOutside);
        }
    });

    let isVisibleFrame = $state(true);
    let documentMode: "iframe" | "page-element" = $state("iframe");
    let contentContainer: HTMLDivElement | null = null;

    /**
     * ドキュメントURL
     */
    let frameSrc: string | null | undefined = $state(option.defaultSrc);
    /**
     * 読み込み中フラグ
     */
    let isLoading = $state(true);
    /**
     * ドキュメントパネルの幅
     */
    let drawerWidthPx = $derived.by(() => {
        if (option.drawerWidthUnit) {
            return calculateWidthToPx(
                option.drawerWidth,
                option.drawerWidthUnit,
            );
        }

        return Math.max(option.drawerWidth || 320, 320);
    });

    let drawerMinWidthPx = $derived.by(() => {
        if (!option.drawerMinWidth) {
            return 0;
        }

        if (option.drawerWidthUnit) {
            return calculateWidthToPx(
                option.drawerMinWidth,
                option.drawerWidthUnit,
            );
        }

        return Math.max(option.drawerMinWidth || 100, 100);
    });

    let drawerMaxWidthPx = $derived.by(() => {
        if (!option.drawerMaxWidth) {
            return 2000;
        }

        if (option.drawerWidthUnit) {
            return calculateWidthToPx(
                option.drawerMaxWidth,
                option.drawerWidthUnit,
            );
        }

        return Math.max(option.drawerMaxWidth || 800, 800);
    });

    /**
     * ドキュメントパネルのトグル状態
     */
    let drawerToggleClass: "close" | "open" = $derived.by(() => {
        return isOpened ? "open" : "close";
    });

    /**
     * ドキュメントパネルの位置
     */
    let drawerPositionClass: "right" | "left" = $derived.by(() => {
        const position = option.drawerPosition || "left";
        return position;
    });

    /**
     * ドキュメントパネルのリサイズ状態
     */
    let isResizing = $state(false);
    /**
     * ドキュメントパネルのリサイズ開始位置
     */
    let startX = 0;
    /**
     * ドキュメントパネルのリサイズ開始時の幅
     */
    let startWidthPx = $state(
        calculateWidthToPx(option.drawerWidth, option.drawerWidthUnit ?? "px"),
    );

    // フォーカス状態管理
    let isResizeBarFocused = $state(false);
    let focusTimeout: ReturnType<typeof setTimeout> | null = null;

    // svelte-ignore non_reactive_update
    let frameElement: HTMLIFrameElement | null = null;

    let windowWidth = window.innerWidth;

    let showQrCode: boolean = $state(false);
    let qrCodeUrl: string | null = $state(null);
    let qrCodeDataUrl: string | null = $state(null);

    function setResizeBarActiveWithDelay() {
        focusTimeout = setTimeout(() => {
            isResizeBarFocused = true;
        }, 300);
    }
    function clearResizeBarActive() {
        if (focusTimeout) clearTimeout(focusTimeout);
        isResizeBarFocused = false;
    }

    /**
     * 初期幅をpx単位に変換して取得する関数
     */
    function calculateWidthToPx(width: number, unit: "px" | "%"): number {
        if (!width) return unit === "px" ? 320 : 0.25 * windowWidth;
        if (unit === "px") return Math.max(width, 100);
        if (unit === "%") return Math.max((width * windowWidth) / 100, 100);
        return 320;
    }

    function updateDrawerWidthPx() {
        drawerWidthPx = calculateWidthToPx(
            option.drawerWidth,
            option.drawerWidthUnit ?? "px",
        );
        drawerMinWidthPx = calculateWidthToPx(
            option.drawerMinWidth ?? 100,
            option.drawerWidthUnit ?? "px",
        );
        drawerMaxWidthPx = calculateWidthToPx(
            option.drawerMaxWidth ?? 800,
            option.drawerWidthUnit ?? "px",
        );
    }

    onMount(() => {
        window.addEventListener("resize", onResizeWindow);
    });

    onDestroy(() => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("mousedown", onClickOutside);
        window.removeEventListener("resize", onResizeWindow);
    });

    function onResizeWindow() {
        windowWidth = window.innerWidth;
        updateDrawerWidthPx();
    }

    /**
     * ドキュメントパネルのリサイズバーをマウスダウンしたときのイベントハンドラ
     */
    function onResizeBarMouseDown(event: MouseEvent) {
        isResizing = true;
        startX = event.clientX;
        startWidthPx = drawerWidthPx;
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }

    /**
     * ドキュメントパネルのリサイズ中のマウスムーブイベントハンドラ
     * @param event マウスイベント
     */
    function onMouseMove(event: MouseEvent) {
        if (!isResizing) return;
        const dx = event.clientX - startX;
        if (drawerPositionClass === "left") {
            drawerWidthPx = startWidthPx + dx;
        } else {
            drawerWidthPx = startWidthPx - dx;
        }

        if (option.drawerMaxWidth && drawerWidthPx > drawerMaxWidthPx) {
            drawerWidthPx = drawerMaxWidthPx;
        } else if (option.drawerMinWidth && drawerWidthPx < drawerMinWidthPx) {
            drawerWidthPx = drawerMinWidthPx;
        }
    }

    /**
     * ドキュメントパネルのリサイズを終了したときのマウスアップイベントハンドラ
     */
    function onMouseUp() {
        isResizing = false;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);

        if (frameElement) {
            frameElement.style.pointerEvents = "auto";
            frameElement.style.userSelect = "auto";
            frameElement.style.opacity = "1";
        }
    }

    /**
     * ドキュメントパネルの位置を変更するボタンのクリックイベントハンドラ
     *
     * @param event
     */
    function onChangeDrawerPosition(
        event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement },
    ) {
        if (drawerPositionClass === "left") {
            option.drawerPosition = "right";
            drawerPositionClass = "right";
        } else {
            option.drawerPosition = "left";
            drawerPositionClass = "left";
        }
    }

    function getOpenUrl(): string | null {
        let urlToOpen = frameSrc;

        // iframe内の現在のURLを取得できる場合はそれを優先
        if (frameElement && frameElement.contentWindow) {
            try {
                const currentUrl = frameElement.contentWindow.location.href;
                // クロスオリジンでなければ、現在のURLを使用
                if (currentUrl && currentUrl !== "about:blank") {
                    urlToOpen = currentUrl;
                }
            } catch (e) {
                // クロスオリジンの場合は frameSrc を使う
            }
        }

        if (!urlToOpen) {
            return null;
        }

        const isAbsolute =
            urlToOpen.startsWith("http://") || urlToOpen.startsWith("https://");
        if (isAbsolute) {
            return urlToOpen;
        }

        // 相対パスの場合は絶対URLに変換
        const baseUrl = window.location.origin;
        return new URL(urlToOpen, baseUrl).href;
    }

    /**
     * ドキュメントを新しいウィンドウで開くボタンのクリックイベントハンドラ
     *
     * @param event
     */
    function onClickOpenInNewWindow(
        event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement },
    ) {
        let urlToOpen = getOpenUrl();
        if (!urlToOpen) {
            console.warn("Frame source is not set.");
            return;
        }

        window.open(urlToOpen, "_blank", "noopener");
    }

    /**
     * ドキュメントパネルの外側をクリックしたときにドキュメントパネルを閉じる
     *
     * @param event
     */
    function onClickOutside(this: Window, event: MouseEvent) {
        if (!option.closeOnOutsideClick) {
            return;
        }

        // クリックされた要素が Shadow DOM 内部かどうかを確認
        const isInsideShadowDOM = (element: Node | null): boolean => {
            if (!element) return false;

            // Shadow DOM のルート要素またはホスト要素かどうかを確認
            if (
                element.nodeType === Node.DOCUMENT_FRAGMENT_NODE ||
                (element instanceof HTMLElement &&
                    element.id === "sd-container")
            ) {
                return true;
            }

            // 親要素で再帰的に確認
            if (element.parentNode) {
                return isInsideShadowDOM(element.parentNode);
            }

            return false;
        };

        // クリックされた要素がドロワー内かShadow DOM内かを確認
        const target = event.target as Node;
        const isInsideDrawer =
            containerRootElement && containerRootElement.contains(target);
        const insideShadowRoot = isInsideShadowDOM(target);

        // ドロワー内でなく、かつShadow DOM内でもない場合のみ閉じる
        if (!isInsideDrawer && !insideShadowRoot) {
            close();
        }
    }

    /**
     * ドロワーを表示します。
     *
     * @param url
     */
    export function open(url?: string) {
        if (url) {
            documentMode = "iframe";
            isVisibleFrame = true;
            if (!isOpened) {
                isLoading = true;
            }
            frameSrc = url;
        } else {
            isVisibleFrame = documentMode === "iframe";
        }

        isOpened = true;
    }

    /**
     * ドロワーを閉じます。
     */
    export function close() {
        isOpened = false;
    }

    /**
     * ドキュメントURLを設定します。
     *
     * @param src
     */
    export function setFrameSrc(src: string) {
        documentMode = "iframe";
        frameSrc = src;
        isVisibleFrame = true;
        isLoading = true;
    }

    /**
     * 表示コンテンツを設定します。
     *
     * @param content
     */
    export function setContent(content: HTMLElement | string) {
        documentMode = "page-element";
        isVisibleFrame = false;
        frameSrc = null;

        if (contentContainer) {
            if (typeof content === "string") {
                contentContainer.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                contentContainer.innerHTML = ""; // 既存の内容をクリア
                contentContainer.appendChild(content);
            } else {
                console.warn(
                    "SideDocumentDrawer is not initialized. Call init() before setContent().",
                );
            }
        }
    }

    async function onClickQRCode(
        event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement },
    ) {
        event.preventDefault();

        if (showQrCode) {
            showQrCode = false;
            return;
        }

        const urlToOpen = getOpenUrl();
        if (!urlToOpen) {
            console.warn("Frame source is not set.");
            return;
        }

        qrCodeDataUrl = await generateQrCode(urlToOpen);
        qrCodeUrl = urlToOpen;
        if (!qrCodeDataUrl) {
            console.warn("Failed to generate QR code.");
            return;
        }

        showQrCode = true;
    }

    async function generateQrCode(url: string): Promise<string> {
        let qrCodeImageColor =
            option.qrcodeImageColor || option.primaryColor || "#000";
        return await QRCode.toDataURL(url, {
            width: 192,
            margin: 2,
            color: {
                dark: qrCodeImageColor,
                light: "#fff",
            },
        });
    }
</script>

<div
    id={drawerId}
    class="sd-drawer {drawerToggleClass} {drawerPositionClass}"
    style="--drawer-width: {drawerWidthPx}px; "
>
    <!-- セパレーター-->
    {#if drawerPositionClass === "right"}
        <div
            class="sd-divider {option.resizable ? 'sd-resizable' : ''}"
            style="background-color: {isResizeBarFocused || isResizing
                ? 'color-mix(in srgb, var(--sd-primary-color, #236ad4) 30%, #fff 70%);'
                : 'rgb(235, 235, 235)'};
                "
        >
            {#if option.resizable}
                <span
                    class="sd-resize-bar"
                    role="separator"
                    tabindex="0"
                    aria-orientation="vertical"
                    data-sd-c-tooltip={str(option.i18nText, "resizeBarTooltip")}
                    data-sd-c-tooltip-position="right"
                    on:mousedown={onResizeBarMouseDown}
                    on:focus={setResizeBarActiveWithDelay}
                    on:blur={clearResizeBarActive}
                    on:mouseenter={setResizeBarActiveWithDelay}
                    on:mouseleave={clearResizeBarActive}
                ></span>
            {/if}
        </div>
    {/if}

    <!-- メインドキュメント -->
    <div style="width: 100%; height: 100%; border: none; ">
        <!-- ページURLのQRコード画像 -->
        {#if showQrCode && qrCodeDataUrl}
            <div class="sd-qr-code-popup sd-qr-popup-active">
                <img
                    src={qrCodeDataUrl}
                    alt="QRCode"
                    width="192"
                    height="192"
                />
                <div class="sd-qr-code-url">{qrCodeUrl}</div>
                <button
                    type="button"
                    class="sd-qr-close"
                    on:click={() => (showQrCode = false)}
                    >{str(option.i18nText, "qrcodeCloseButton")}</button
                >
            </div>
        {/if}

        <!-- iframeコンテンツ -->
        {#if isVisibleFrame}
            <iframe
                bind:this={frameElement}
                title={str(option.i18nText, "documentTitle")}
                src={frameSrc}
                loading="lazy"
                style="width: 100%; height: 100%; border: none; 
                {documentMode === 'iframe' ? '' : 'display: none;'}
                {isResizing
                    ? 'pointer-events: none; user-select: none;'
                    : 'pointer-events: auto; user-select: auto;'}
                {isLoading ? 'opacity: 0;' : ''}"
                on:load={() => {
                    isLoading = false;
                }}
            ></iframe>
        {/if}

        <!-- ページ要素コンテンツ -->
        <div
            bind:this={contentContainer}
            class="sd-page-element-content"
            style="width: 100%; height: 100%; overflow: auto; 
                {documentMode === 'page-element' ? '' : 'display: none;'}"
        ></div>
    </div>

    <!-- セパレーター-->
    {#if drawerPositionClass === "left"}
        <div
            class="sd-divider {option.resizable ? 'sd-resizable' : ''}"
            style="background-color: {isResizeBarFocused || isResizing
                ? 'color-mix(in srgb, var(--sd-primary-color, #236ad4) 30%, #fff 70%);'
                : 'rgb(235, 235, 235)'};
                "
        >
            {#if option.resizable}
                <span
                    class="sd-resize-bar"
                    role="separator"
                    tabindex="0"
                    aria-orientation="vertical"
                    data-sd-c-tooltip={str(option.i18nText, "resizeBarTooltip")}
                    data-sd-c-tooltip-position="left"
                    on:mousedown={onResizeBarMouseDown}
                    on:focus={setResizeBarActiveWithDelay}
                    on:blur={clearResizeBarActive}
                    on:mouseenter={setResizeBarActiveWithDelay}
                    on:mouseleave={clearResizeBarActive}
                ></span>
            {/if}
        </div>
    {/if}
</div>

{#if isOpened}
    <div
        class="sd-drawer-button-container {drawerPositionClass} {drawerToggleClass}"
        style="top:0.5rem; z-index: 1000;
                {drawerPositionClass === 'left'
            ? `left: calc(${drawerWidthPx}px + 5px); right: auto;`
            : `right: calc(${drawerWidthPx}px + 5px); left: auto;`}
        "
    >
        {#each option.showDrawerButtons as buttonType}
            {#if buttonType === "close"}
                <!-- 閉じるボタン -->
                <button
                    type="button"
                    on:click={() => close()}
                    aria-label={str(option.i18nText, "closeButtonTooltip")}
                    data-sd-c-tooltip={str(
                        option.i18nText,
                        "closeButtonTooltip",
                    )}
                    data-sd-c-tooltip-position={drawerPositionClass === "left"
                        ? "right"
                        : "left"}
                    class="sd-drawer-button"
                >
                    {#if drawerPositionClass === "left"}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            ><path
                                stroke="none"
                                d="M0 0h24v24H0z"
                                fill="none"
                            /><path d="M5 12l14 0" /><path d="M5 12l4 4" /><path
                                d="M5 12l4 -4"
                            /></svg
                        >
                    {:else}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            ><path
                                stroke="none"
                                d="M0 0h24v24H0z"
                                fill="none"
                            /><path d="M5 12l14 0" /><path
                                d="M15 16l4 -4"
                            /><path d="M15 8l4 4" /></svg
                        >
                    {/if}
                </button>
            {:else if buttonType === "external-link" && frameSrc}
                <!-- 外部リンクボタン -->
                <button
                    type="button"
                    class="sd-drawer-button"
                    aria-label={str(option.i18nText, "externalLinkTooltip")}
                    data-sd-c-tooltip={str(
                        option.i18nText,
                        "externalLinkTooltip",
                    )}
                    data-sd-c-tooltip-position={drawerPositionClass === "left"
                        ? "right"
                        : "left"}
                    on:click={onClickOpenInNewWindow}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        ><path
                            stroke="none"
                            d="M0 0h24v24H0z"
                            fill="none"
                        /><path
                            d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"
                        /><path d="M11 13l9 -9" /><path d="M15 4h5v5" /></svg
                    >
                </button>
            {:else if buttonType === "position-change"}
                <!-- 位置変更ボタン -->
                <button
                    type="button"
                    class="sd-drawer-button"
                    aria-label={str(
                        option.i18nText,
                        "positionChangeButtonTooltip",
                    )}
                    data-sd-c-tooltip={str(
                        option.i18nText,
                        "positionChangeButtonTooltip",
                    )}
                    data-sd-c-tooltip-position={drawerPositionClass === "left"
                        ? "right"
                        : "left"}
                    on:click={onChangeDrawerPosition}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        ><path
                            stroke="none"
                            d="M0 0h24v24H0z"
                            fill="none"
                        /><path d="M7 8l-4 4l4 4" /><path
                            d="M17 8l4 4l-4 4"
                        /><path d="M3 12l18 0" /></svg
                    >
                </button>
            {:else if buttonType === "qrcode" && frameSrc}
                <!-- QRコードボタン -->
                <button
                    type="button"
                    class="sd-drawer-button"
                    aria-label={!showQrCode
                        ? str(option.i18nText, "qrcodeButtonTooltip")
                        : str(option.i18nText, "qrcodeCloseButton")}
                    data-sd-c-tooltip={!showQrCode
                        ? str(option.i18nText, "qrcodeButtonTooltip")
                        : str(option.i18nText, "qrcodeCloseButton")}
                    data-sd-c-tooltip-position={drawerPositionClass === "left"
                        ? "right"
                        : "left"}
                    on:click={onClickQRCode}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        ><path
                            stroke="none"
                            d="M0 0h24v24H0z"
                            fill="none"
                        /><path
                            d="M4 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"
                        /><path d="M7 17l0 .01" /><path
                            d="M14 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"
                        /><path d="M7 7l0 .01" /><path
                            d="M4 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"
                        /><path d="M17 7l0 .01" /><path d="M14 14l3 0" /><path
                            d="M20 14l0 .01"
                        /><path d="M14 14l0 3" /><path d="M14 20l3 0" /><path
                            d="M17 17l3 0"
                        /><path d="M20 17l0 3" /></svg
                    >
                </button>
            {/if}
        {/each}
    </div>
{/if}

<style lang="postcss">
    .sd-drawer {
        position: fixed;
        display: flex;
        top: 0;
        height: 100dvh;
        min-height: 100dvh;
        width: var(--drawer-width, 320px);
        background: #fff;
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
        z-index: var(--sd-drawer-z-index, 1000);
        will-change: transform;
        transform: translateZ(0);
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        overflow: hidden;
        transition:
            left 0.3s ease,
            right 0.3s ease;
    }

    .sd-drawer.right {
        right: -320px;
        left: auto;
    }

    .sd-drawer.left {
        left: -320px;
        right: auto;
    }

    .sd-drawer.left.open {
        left: 0;
    }

    .sd-drawer.right.open {
        right: 0;
    }
    .sd-drawer.left.close {
        left: calc(-1 * var(--drawer-width, 320px));
        opacity: 0;
        transition:
            left 0.3s ease,
            opacity 0.3s ease;
        user-event: none;
    }
    .sd-drawer.right.close {
        right: calc(-1 * var(--drawer-width, 320px));
        opacity: 0;
        transition:
            right 0.3s ease,
            opacity 0.3s ease;
        user-event: none;
    }

    .sd-divider {
        width: 4px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgb(235, 235, 235);
        user-select: none;
    }
    .sd-divider.sd-resizable {
        width: 7px;
    }
    .sd-resize-bar {
        width: 3px;
        height: 1.5rem;
        margin: auto;
        cursor: ew-resize;
        background-color: rgb(172, 172, 172);
        border-radius: 1.5px;
        user-select: none;
    }

    .sd-drawer-button-container {
        position: fixed;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        opacity: 0;
        visibility: hidden;
        transition:
            opacity 100ms ease-in-out 300ms,
            visibility 0ms linear 300ms;
    }

    .sd-drawer-button-container.open {
        opacity: 1;
        visibility: visible;
    }

    .sd-drawer-button-container.close {
        opacity: 0;
        visibility: hidden;
        transition:
            opacity 100ms ease-in-out,
            visibility 0ms linear 100ms;
    }

    .sd-drawer-button-container.left {
        left: calc(var(--drawer-width, 320px) + 5px);
        right: auto;
    }
    .sd-drawer-button-container.right {
        right: calc(var(--drawer-width, 320px) + 5px);
        left: auto;
    }

    .sd-button-base {
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: white;
        background-color: var(--sd-primary-color, #236ad4);
        border: none;
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
        padding: 0;
        border-radius: 0.25em;
        cursor: pointer;
        z-index: var(--sd-drawer-z-index, 1000);
    }
    .sd-drawer-button {
        width: 2rem;
        height: 2rem;
        @extend .sd-button-base;
    }
    .sd-drawer-button svg {
        display: block;
        margin: auto;
    }
    .sd-drawer-button:active {
        transform: scale(0.95);
    }

    .sd-button-hover {
        background: color-mix(
            in srgb,
            var(--sd-primary-color, #236ad4) 90%,
            #fff 10%
        );
        outline: 2px solid var(--sd-primary-color, #236ad4);
        outline-offset: 2px;
        box-shadow: 0 0 0 4px
            color-mix(in srgb, var(--sd-primary-color, #236ad4) 30%, #fff 70%);
    }
    .sd-drawer-button:hover {
        @extend .sd-button-hover;
    }
    .sd-panel-hidden {
        visibility: hidden;
        pointer-events: none;
    }
    .sd-drawer.close:not(.sd-panel-hidden) {
        pointer-events: none;
    }
    .sd-page-element-content {
        white-space: normal;
        word-break: break-word;
        overflow-wrap: break-word;
    }

    :global([data-sd-link-target]) {
        display: inline;
        white-space: normal;
    }

    :global(.sd-link-button) {
        display: inline-block;
        vertical-align: text-bottom;
        margin-left: 0.4em;
        width: 1.5rem;
        height: 1.5rem;
        padding: 0;
        line-height: 1;
        background: color-mix(
            in srgb,
            var(--sd-primary-color, #236ad4) 40%,
            #fff 60%
        );
        color: #fff;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
        box-shadow: 0 2px 4px #0002;
        transition:
            background 0.15s ease,
            box-shadow 0.15s ease,
            transform 0.1s;
    }

    :global(.sd-link-button) svg {
        display: block;
        margin: auto;
    }
    :global(.sd-link-button):active {
        transform: scale(0.95);
    }
    :global(.sd-link-button):hover {
        background: color-mix(
            in srgb,
            var(--sd-primary-color, #236ad4) 90%,
            #fff 10%
        );
        outline: 2px solid var(--sd-primary-color, #236ad4);
        outline-offset: 2px;
        box-shadow: 0 0 0 4px
            color-mix(in srgb, var(--sd-primary-color, #236ad4) 30%, #fff 70%);
    }

    .sd-qr-code-popup {
        position: fixed;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        top: 2rem;
        left: 50%;
        transform: translateX(-50%) scale(0.8);
        background: #fff;
        border: 1px solid #e2e2e2;
        box-shadow: 0 4px 12px #0002;
        padding: 1.5rem;
        border-radius: 0.25rem;
        z-index: 9999;
        text-align: center;
        opacity: 0;
        transition:
            opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1),
            transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: none;
        max-width: 350px;
    }
    .sd-qr-popup-active {
        opacity: 1;
        transform: translateX(-50%) scale(1);
        pointer-events: auto;
    }
    .sd-qr-code-url {
        margin-top: 1rem;
        font-size: 0.9rem;
        color: var(--sd-primary-color, #236ad4);
        word-break: break-all;
        display: -webkit-box;
        /* 最大2行 */
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 320px;
        line-height: 1.3;
    }
    .sd-qr-close {
        margin-top: 1rem;
        height: 2rem;
        width: 5rem;
        @extend .sd-button-base;
    }
    .sd-qr-close:hover {
        @extend .sd-button-hover;
    }
</style>
