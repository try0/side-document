<script lang="ts">
    import { onDestroy, onMount, setContext } from "svelte";

    import SideDocumentDrawer from "./SideDocumentDrawer.svelte";
    import type { SideDocumentOption } from "../types";
    import RelatedElementEffect from "./RelatedElementEffect.svelte";
    import ToggleButton from "./ToggleButton.svelte";

    /**
     * 初期オプション値
     */
    let {
        initOption,
        drawerId = "sd-drawer-panel",
    }: { initOption: SideDocumentOption; drawerId: string | undefined } =
        $props();
    let option = $state(initOption);
    setContext("option", option);

    /**
     * コンテナー内のルート要素
     */
    let containerRootElement: HTMLDivElement | null = $state(null);
    /**
     * Drawerのラッパー要素
     * popover属性を持つ場合がある
     */
    let drawerWrapperElement: HTMLDivElement | null = $state(null);

    let effectTargetElements: HTMLElement[] = $state([]);


    $effect(() => {
        if (isOpened) {
            if (option.renderAsPopover) {
                drawerWrapperElement?.showPopover();
            }
        } else {
            setTimeout(() => {
                if (!isPinned) {
                    drawerWrapperElement?.hidePopover();
                }
            }, 320);
        }
    });

    /**
     * トグルボタンの位置クラス
     */
    let toggleButtonPositionClass = $derived.by(() => {
        if (option.toggleButtonFollowsDrawerPosition && option.drawerPosition) {
            // drawerPositionが"left"なら"bottom-left"、"right"なら"bottom-right"
            if (option.toggleButtonPosition?.startsWith("bottom")) {
                return option.drawerPosition === "left"
                    ? "bottom-left"
                    : "bottom-right";
            } else if (option.toggleButtonPosition?.startsWith("top")) {
                return option.drawerPosition === "left"
                    ? "top-left"
                    : "top-right";
            }
        }
        // 通常はoption.toggleButtonPosition
        const position = option.toggleButtonPosition || "bottom-right";
        return position;
    });

    /**
     * トグルボタンのツールチップ位置
     */
    let toggleButtonTooltipPosition = $derived.by(() => {
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

    /**
     * トグルボタンの表示制御
     * option.showToggleButtonがtrueの場合のみ表示
     */
    let isVisibleToggleButton: boolean = $derived.by(() => {
        // option.showToggleButtonがtrueの場合のみ表示
        return option.showToggleButton ?? true;
    });

    /**
     * ドキュメントのDrawerの状態を管理するためのコンテキスト
     */
    let isOpened: boolean = $state(false);

    /**
     * Drawerがピン留めされているかどうか
     */
    let isPinned: boolean = $state(false);

    // svelte-ignore non_reactive_update
    let documentDrawer: SideDocumentDrawer;

    onMount(() => {
        window.addEventListener("keydown", handleKeyDown);
    });
    onDestroy(() => {
        window.removeEventListener("keydown", handleKeyDown);
    });

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape" && isOpened) {
            closeDrawer();
        }
    }

    export function isRendered(): boolean {
        return !!documentDrawer;
    }

    /**
     * オプションを更新します。
     *
     * @param updOption
     */
    export function updateOption(updOption: SideDocumentOption) {
        // オプションを更新
        Object.assign(option, updOption);
    }

    /**
     * Drawerの表示状態を切り替えます。
     */
    export function toggleDrawer() {
        isOpened = !isOpened;
    }

    /**
     * Drawerを開きます。
     *
     * @param frameSrc
     */
    export function openDrawer(frameSrc?: string) {
        if (documentDrawer) {
            documentDrawer.open(frameSrc);
        } else {
            console.warn(
                "SideDocumentDrawer is not initialized. Call render() before open().",
            );
        }
    }

    /**
     * Drawerを閉じます。
     */
    export function closeDrawer() {
        if (documentDrawer) {
            documentDrawer.close();
        } else {
            console.warn(
                "SideDocumentDrawer is not initialized. Call render() before close().",
            );
        }
    }

    /**
     * Drawerが開いているかどうかを返します。
     */
    export function isOpenedDrawer(): boolean {
        return isOpened;
    }

    /**
     * urlを設定します。
     *
     * @param src
     */
    export function setFrameSrc(src: string) {
        if (documentDrawer) {
            documentDrawer.setFrameSrc(src);
        } else {
            console.warn(
                "SideDocumentDrawer is not initialized. Call render() before setFrameSrc().",
            );
        }
    }

    /**
     * Drawerのコンテンツを設定します。
     *
     * @param content
     */
    export function setDrawerContent(content: HTMLElement | string) {
        if (documentDrawer) {
            documentDrawer.setContent(content);
        } else {
            console.warn(
                "SideDocumentDrawer is not initialized. Call render() before setDrawerContent().",
            );
        }
    }

    export function addEffectTargetElement(element: HTMLElement) {
        if (!effectTargetElements.includes(element)) {
            effectTargetElements.push(element);
        }

        setTimeout(() => {
            effectTargetElements = effectTargetElements.filter(
                (el) => el !== element,
            );
        }, 2000);
    }
</script>

<div
    bind:this={containerRootElement}
    style="
    --sd-primary-color: {option.primaryColor || '#d80000'};
    --sd-drawer-z-index: {option.drawerZIndex || 1000};
    --sd-toggle-button-z-index: {option.toggleButtonZIndex || 1001};"
>
    {#each effectTargetElements as effectTargetElement (effectTargetElement)}
        <RelatedElementEffect targetElement={effectTargetElement} active={true}
        ></RelatedElementEffect>
    {/each}

    <!-- Drawerのラッパー要素 popoverの場合あり-->
    <div
        bind:this={drawerWrapperElement}
        {...option.renderAsPopover ? { popover: "manual" } : {}}
    >

        <SideDocumentDrawer
            bind:this={documentDrawer}
            {containerRootElement}
            bind:isOpened
            bind:isPinned
            {drawerId}
            bind:toggleButtonPositionClass
        />

        {#if isVisibleToggleButton && isOpened}
            <!-- トグルボタン popoverを考慮して内部にも設置-->
            <div>
                <ToggleButton
                    bind:isOpened
                    bind:toggleButtonPositionClass
                    bind:toggleButtonTooltipPosition
                    bind:option
                    {drawerId}
                    {toggleDrawer}
                />
            </div>
        {/if}
    </div>
    {#if isVisibleToggleButton && !isOpened}
                <!-- トグルボタン -->
        <div>
            <ToggleButton
                bind:isOpened
                bind:toggleButtonPositionClass
                bind:toggleButtonTooltipPosition
                bind:option
                {drawerId}
                {toggleDrawer}
            />
        </div>
    {/if}
</div>

<style lang="postcss">
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
        transform: translateX(-50%) translateY(7px);
        margin-bottom: 7px;
    }
    :global([data-sd-c-tooltip-position="top"]):hover::after {
        transform: translateX(-50%) translateY(0);
    }

    :global([data-sd-c-tooltip-position="bottom"])::after {
        top: 100%;
        left: 50%;
        transform: translateX(-50%) translateY(-7px);
        margin-top: 7px;
    }
    :global([data-sd-c-tooltip-position="bottom"]):hover::after {
        transform: translateX(-50%) translateY(0);
    }

    :global([data-sd-c-tooltip-position="left"])::after {
        right: 100%;
        top: 50%;
        transform: translateY(-50%) translateX(7px);
        margin-right: 7px;
    }
    :global([data-sd-c-tooltip-position="left"]):hover::after {
        transform: translateY(-50%) translateX(0);
    }

    :global([data-sd-c-tooltip-position="right"])::after {
        left: 100%;
        top: 50%;
        transform: translateY(-50%) translateX(-7px);
        margin-left: 7px;
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
        margin-bottom: -3px;
    }

    :global([data-sd-c-tooltip-position="bottom"])::before {
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-bottom-color: #dadada;
        margin-top: -3px;
    }

    :global([data-sd-c-tooltip-position="left"])::before {
        top: 50%;
        right: 100%;
        transform: translateY(-50%);
        border-left-color: #dadada;
        margin-right: -3px;
    }

    :global([data-sd-c-tooltip-position="right"])::before {
        top: 50%;
        left: 100%;
        transform: translateY(-50%);
        border-right-color: #dadada;
        margin-left: -3px;
    }

    :global([data-sd-c-tooltip]):hover::before {
        opacity: 1;
    }

    dialog {
        position: fixed;
        top: 0;
        left: 0;
        right: auto;
        bottom: auto;
        margin: 0;
        padding: 0;
        width: auto;
        height: auto;
        background: none;
        border: none;
        box-shadow: none;
        max-width: none;
        max-height: none;
        overflow: visible;
    }
    .sd-dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: 0;
        padding: 0;
        width: 100vw;
        height: 100vh;
        background: none;
        border: none;
        box-shadow: none;
        max-width: none;
        max-height: none;
        overflow: visible;
    }
    .sd-dialog-backdrop {
        position: fixed;
        inset: 0;
        background: transparent;
        z-index: 0;
    }
    dialog::backdrop {
        background: none !important;
        pointer-events: none !important;
    }
    div[popover] {
        position: fixed;
        top: 0;
        left: 0;
        margin: 0;
        padding: 0;
        width: 0;
        height: 0;
        background: none;
        border: none;
        box-shadow: none;
        max-width: none;
        max-height: none;
        overflow: visible;
    }
</style>
