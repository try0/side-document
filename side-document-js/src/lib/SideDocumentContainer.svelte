<script lang="ts">
    import { onDestroy, onMount, setContext } from "svelte";

    import { fade } from "svelte/transition";
    import SideDocumentDrawer from "./SideDocumentDrawer.svelte";
    import type { SideDocumentOption } from "../types";
    import { SideDocument } from "../SideDocument";
    import { str } from "./i18n";

    /**
     * コンテナー、Drawer間の状態を管理するためのインターフェース
     */
    export interface SideDocumentDrawerState {
        isOpened: boolean;
        isVisibleToggleButton: boolean;
    }

    let { initOption }: { initOption: SideDocumentOption } = $props();
    let option = $state(initOption);
    setContext("option", option);

    $effect(() => {
        documentDrawerState.isVisibleToggleButton =
            option.enableToggleButton ?? true;
    });

    // トグルボタンの位置クラスを計算
    let toggleButtonPositionClass = $derived.by(() => {
        if (option.toggleButtonFollowsDrawerPosition && option.drawerPosition) {
            // drawerPositionが"left"なら"bottom-left"、"right"なら"bottom-right"
            if (option.toggleButtonPosition?.startsWith("bottom")) {
                return option.drawerPosition === "left" ? "bottom-left" : "bottom-right";
            } else if (option.toggleButtonPosition?.startsWith("top")) {
                return option.drawerPosition === "left" ? "top-left" : "top-right";
            }
        }
        // 通常はoption.toggleButtonPosition
        const position = option.toggleButtonPosition || "bottom-right";
        return position;
    });

    // ツールチップの位置を計算
    let tooltipPosition = $derived.by(() => {
        // toggleButtonPositionClassを参照
        const position = toggleButtonPositionClass;
        if (position.startsWith("top")) {
            return "bottom";
        } else if (position.startsWith("bottom")) {
            return "top";
        } else if (position.endsWith("left")) {
            return "right";
        } else {
            return "left";
        }
    });

    let containerElement: HTMLDivElement | null = $state(null);

    // ドキュメントのDrawerの状態を管理するためのコンテキスト
    let documentDrawerState: SideDocumentDrawerState = $state({
        isOpened: false,
        isVisibleToggleButton: option.enableToggleButton ?? true,
    });
    setContext("documentDrawerState", documentDrawerState);

    // svelte-ignore non_reactive_update
    let documentDrawer: SideDocumentDrawer;

    onMount(() => {
        documentDrawerState.isOpened = false;
    });

    // onDestroy(() => {});

    export function toggleDrawer() {
        if (documentDrawerState.isOpened) {
            documentDrawer.close();
        } else {
            documentDrawer.open();
        }
    }

    export function openDrawer(frameSrc?: string) {
        if (documentDrawer) {
            documentDrawer.open(frameSrc);
        } else {
            console.warn("SideDocumentDrawer is not initialized. Call init() before open().");
        }
    }

    export function closeDrawer() {
        if (documentDrawer) {
            documentDrawer.close();
        } else {
            console.warn("SideDocumentDrawer is not initialized. Call init() before close().");
        }
    }


</script>

<div
    bind:this={containerElement}
    style="
    --sd-primary-color: {option.primaryColor || '#d80000'};
    --sd-drawer-z-index: {option.drawerZIndex || 1000};
    --sd-toggle-button-z-index: {option.toggleButtonZIndex || 1001};"
>
    <!-- ドキュメント　メインコンポーネント -->

        <SideDocumentDrawer bind:this={documentDrawer} {containerElement} />


    {#if documentDrawerState.isVisibleToggleButton}
        <div>
            <!-- トグルボタン -->
            <button
                type="button"
                class="sd-toggle-button {toggleButtonPositionClass}"
                data-sd-c-tooltip={documentDrawerState.isOpened
                    ? str(option.i18nText, "toggleButtonCloseTooltip")
                    : str(option.i18nText, "toggleButtonOpenTooltip")}
                data-sd-c-tooltip-position={tooltipPosition}
                on:click={toggleDrawer}
                aria-label={documentDrawerState.isOpened
                    ? str(option.i18nText, "toggleButtonCloseTooltip")
                    : str(option.i18nText, "toggleButtonOpenTooltip")}
            >
                {#if documentDrawerState.isOpened}
                    <svg
                        class="sd-toggle-button-icon"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18 17.94 6M18 18 6.06 6"
                        />
                    </svg>
                {:else}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="sd-toggle-button-icon"
                        aria-hidden="true"
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
                            d="M8 8a3.5 3 0 0 1 3.5 -3h1a3.5 3 0 0 1 3.5 3a3 3 0 0 1 -2 3a3 4 0 0 0 -2 4"
                        /><path d="M12 19l0 .01" /></svg
                    >
                {/if}
            </button>
        </div>
    {/if}
</div>

<style lang="postcss">
    .sd-toggle-button {
        position: fixed;
        background: var(--sd-primary-color, #236ad4);
        color: white;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: var(--sd-toggle-button-z-index, 1001);
        border: var(--sd-primary-color, #236ad4);
        padding: 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        transition: transform 0.12s cubic-bezier(0.4, 2, 0.6, 1);
    }

    /* 位置クラス */
    .sd-toggle-button.top-left {
        top: 25px;
        left: 25px;
    }

    .sd-toggle-button.top-right {
        top: 25px;
        right: 25px;
    }

    .sd-toggle-button.bottom-left {
        bottom: 25px;
        left: 25px;
    }

    .sd-toggle-button.bottom-right {
        bottom: 25px;
        right: 25px;
    }

    .sd-toggle-button:active {
        transform: scale(0.92);
    }
    .sd-toggle-button:hover {
        opacity: 0.9;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    .sd-toggle-button-icon {
        width: 28px;
        height: 28px;
        display: block;
        stroke: white;
        fill: none;
    }
    :global([data-sd-c-tooltip]) {
        position: relative;
    }

    :global([data-sd-c-tooltip])::after {
        content: attr(data-sd-c-tooltip);
        position: absolute;
        background: #dadada;
        color: #303030;
        padding: 5px 10px;
        border-radius: 0.25rem;
        font-size: 0.85rem;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition:
            opacity 0.15s,
            transform 0.15s;
        z-index: var(--sd-toggle-button-z-index, 1001);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
    }

    :global([data-sd-c-tooltip-position="top"])::after {
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%) translateY(5px);
        margin-bottom: 5px;
    }
    :global([data-sd-c-tooltip-position="top"]):hover::after {
        transform: translateX(-50%) translateY(0);
    }

    :global([data-sd-c-tooltip-position="bottom"])::after {
        top: 100%;
        left: 50%;
        transform: translateX(-50%) translateY(-5px);
        margin-top: 5px;
    }
    :global([data-sd-c-tooltip-position="bottom"]):hover::after {
        transform: translateX(-50%) translateY(0);
    }

    :global([data-sd-c-tooltip-position="left"])::after {
        right: 100%;
        top: 50%;
        transform: translateY(-50%) translateX(5px);
        margin-right: 5px;
    }
    :global([data-sd-c-tooltip-position="left"]):hover::after {
        transform: translateY(-50%) translateX(0);
    }

    :global([data-sd-c-tooltip-position="right"])::after {
        left: 100%;
        top: 50%;
        transform: translateY(-50%) translateX(-5px);
        margin-left: 5px;
    }
    :global([data-sd-c-tooltip-position="right"]):hover::after {
        transform: translateY(-50%) translateX(0);
    }

    :global([data-sd-c-tooltip]):hover::after {
        opacity: 1;
    }

    :global([data-sd-c-tooltip])::before {
        content: "";
        position: absolute;
        width: 0;
        height: 0;
        border: 5px solid transparent;
        opacity: 0;
        transition: opacity 0.15s;
        z-index: var(--sd-toggle-button-z-index, 1001);
    }

    :global([data-sd-c-tooltip-position="top"])::before {
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-top-color: #dadada;
        margin-bottom: -5px;
    }

    :global([data-sd-c-tooltip-position="bottom"])::before {
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-bottom-color: #dadada;
        margin-top: -5px;
    }

    :global([data-sd-c-tooltip-position="left"])::before {
        top: 50%;
        right: 100%;
        transform: translateY(-50%);
        border-left-color: #dadada;
        margin-right: -5px;
    }

    :global([data-sd-c-tooltip-position="right"])::before {
        top: 50%;
        left: 100%;
        transform: translateY(-50%);
        border-right-color: #dadada;
        margin-left: -5px;
    }

    :global([data-sd-c-tooltip]):hover::before {
        opacity: 1;
    }
</style>
