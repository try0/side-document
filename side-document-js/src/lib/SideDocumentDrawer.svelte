<script lang="ts">
    import { getContext, onDestroy, onMount } from "svelte";
    import type { SideDocumentOption } from "../types";
    import { fade } from "svelte/transition";
    import type { SideDocumentDrawerState } from "./SideDocumentContainer.svelte";
    import { str } from "./i18n";

    /**
     * オプション
     */
    const option: SideDocumentOption = getContext("option");

    /**
     * コンポーネントステート
     */
    const documentPanelState: SideDocumentDrawerState = getContext(
        "documentDrawerState",
    );

    /**
     * rootコンテナ
     */
    let { containerElement }: { containerElement: HTMLDivElement } = $props();

    $effect(() => {
        if (documentPanelState.isOpened) {
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

    let isVisibleFrame = $state(true);
    /**
     * ドキュメントURL
     */
    let frameSrc = $state(option.defaultSrc);
    /**
     * 読み込み中フラグ
     */
    let isLoading = $state(true);
    /**
     * ドキュメントパネルの幅
     */
    let drawerWidthPx = $derived.by(() => {
        if (option.drawerWidthUnit) {
            return calculateInitialWidthInPx();
        }

        return Math.max(option.drawerWidth || 320, 320);
    });

    /**
     * ドキュメントパネルのトグル状態
     */
    let drawerToggleClass: "close" | "open" = $derived.by(() => {
        return documentPanelState.isOpened ? "open" : "close";
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
    let startWidthPx = $state(calculateInitialWidthInPx());

    // フォーカス状態管理
    let isResizeBarFocused = $state(false);
    let focusTimeout: ReturnType<typeof setTimeout> | null = null;

    let frameElement: HTMLIFrameElement | null = null;

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
    function calculateInitialWidthInPx(): number {
        // 初期値のデフォルト
        const defaultWidth = 320;

        // オプションが無い場合はデフォルト値
        if (!option || !option.drawerWidth) {
            return defaultWidth;
        }

        // 単位に応じて変換
        const unit = option.drawerWidthUnit || "px";
        const width = option.drawerWidth;

        if (unit === "px") {
            return Math.max(width, 100); // 最小幅は100px
        } else if (unit === "%") {
            // パーセント値をピクセルに変換
            return Math.max((width * window.innerWidth) / 100, 100);
        }
        return defaultWidth;
    }

    onMount(() => {
        if (option.closeOnOutsideClick) {
            window.addEventListener("mousedown", onClickOutside);
        }
    });

    onDestroy(() => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("mousedown", onClickOutside);
    });

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
            drawerWidthPx = Math.max(320, startWidthPx + dx);
        } else {
            drawerWidthPx = Math.max(320, startWidthPx - dx);
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

    /**
     * ドキュメントを新しいウィンドウで開くボタンのクリックイベントハンドラ
     *
     * @param event
     */
    function onClickOpenInNewWindow(
        event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement },
    ) {
        window.open(frameSrc, "_blank", "noopener");
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
            containerElement && containerElement.contains(target);
        const insideShadowRoot = isInsideShadowDOM(target);

        // ドロワー内でなく、かつShadow DOM内でもない場合のみ閉じる
        if (!isInsideDrawer && !insideShadowRoot) {
            close();
        }
    }

    export function open(frameSrc?: string) {
        if (frameSrc) {
            isVisibleFrame = true;
            isLoading = true;
            frameSrc = frameSrc;
        } else {
            console.warn("Frame source is not provided.");
        }

        documentPanelState.isOpened = true;
    }

    export function close() {
        documentPanelState.isOpened = false;
    }

    export function setFrameSrc(src: string) {
        frameSrc = src;
        isVisibleFrame = true;
        isLoading = true;
    }
</script>

<div
    class="sd-drawer {drawerToggleClass} {drawerPositionClass}"
    style="--drawer-width: {drawerWidthPx}px; "
>
    <!-- セパレーター-->
    {#if drawerPositionClass === "right"}
        <div
            class="sd-divider"
            style="background-color: {isResizeBarFocused || isResizing
                ? 'var(--sd-primary-color)'
                : 'rgb(235, 235, 235)'};
                opacity: {isResizeBarFocused || isResizing ? '0.7' : '1'};
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
        {#if isVisibleFrame}
            <iframe
                bind:this={frameElement}
                title={str(option.i18nText, "documentTitle")}
                src={frameSrc}
                style="width: 100%; height: 100%; border: none; 
            {isResizing
                    ? 'pointer-events: none; user-select: none;'
                    : 'pointer-events: auto; user-select: auto;'}
            {isLoading ? 'opacity: 0;' : ''}"
                on:load={() => {
                    isLoading = false;
                }}
            ></iframe>
        {/if}
    </div>

    <!-- セパレーター-->
    {#if drawerPositionClass === "left"}
        <div
            class="sd-divider"
            style="background-color: {isResizeBarFocused || isResizing
                ? 'var(--sd-primary-color)'
                : 'rgb(235, 235, 235)'};
                opacity: {isResizeBarFocused || isResizing ? '0.7' : '1'};
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

{#if documentPanelState.isOpened}
    <div
        class="sd-drawer-button-container {drawerPositionClass} {drawerToggleClass}"
        style="top:0.5rem; z-index: 1000;
                {drawerPositionClass === 'left'
            ? `left: calc(${drawerWidthPx}px + 5px); right: auto;`
            : `right: calc(${drawerWidthPx}px + 5px); left: auto;`}
        "
        in:fade={{ duration: 0, delay: 300 }}
        out:fade={{ duration: 0, delay: 0 }}
    >
        <button
            type="button"
            on:click={() => close()}
            aria-label={str(option.i18nText, "closeButtonTooltip")}
            data-sd-c-tooltip={str(option.i18nText, "closeButtonTooltip")}
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
                    ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
                        d="M5 12l14 0"
                    /><path d="M5 12l4 4" /><path d="M5 12l4 -4" /></svg
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
                    ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
                        d="M5 12l14 0"
                    /><path d="M15 16l4 -4" /><path d="M15 8l4 4" /></svg
                >
            {/if}
        </button>

        {#if frameSrc}
            <button
                type="button"
                class="sd-drawer-button"
                aria-label={str(option.i18nText, "externalLinkTooltip")}
                data-sd-c-tooltip={str(option.i18nText, "externalLinkTooltip")}
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
                    ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
                        d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"
                    /><path d="M11 13l9 -9" /><path d="M15 4h5v5" /></svg
                ></button
            >
        {/if}
        <button
            type="button"
            class="sd-drawer-button"
            aria-label={str(option.i18nText, "positionChangeButtonTooltip")}
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
                ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
                    d="M7 8l-4 4l4 4"
                /><path d="M17 8l4 4l-4 4" /><path d="M3 12l18 0" /></svg
            >
        </button>
    </div>
{/if}

<style lang="postcss">
    .sd-drawer {
        position: fixed;
        display: flex;
        top: 0;
        height: 100vh;
        width: var(--drawer-width, 320px);
        background: #fff;
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
        z-index: var(--sd-drawer-z-index, 1000);
        will-change: transform;
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
        width: 7px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgb(235, 235, 235);
        user-select: none;
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
    .sd-drawer-button {
        width: 2rem;
        height: 2rem;
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
    .sd-drawer-button svg {
        display: block;
        margin: auto;
    }
    .sd-drawer-button:active {
        transform: scale(0.92);
    }
    .sd-drawer-button:hover {
        filter: brightness(1.15) saturate(1.2);
        outline: 2px solid var(--sd-primary-color, #236ad4);
        outline-offset: 2px;
        box-shadow: 0 0 0 4px
            color-mix(in srgb, var(--sd-primary-color, #236ad4) 30%, #fff 70%);
    }
    .sd-panel-hidden {
        visibility: hidden;
        pointer-events: none;
    }
    .sd-drawer.close:not(.sd-panel-hidden) {
        pointer-events: none;
    }
</style>
