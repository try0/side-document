<script lang="ts">
    import type { SideDocumentOption } from "../types";
    import { str } from "./i18n";

    let {
        isOpened = $bindable(),
        toggleButtonPositionClass = $bindable(),
        toggleButtonTooltipPosition = $bindable(),
        toggleDrawer,
        option = $bindable(),
        drawerId = $bindable("side-document-drawer"),
    }: {
        isOpened: boolean;
        toggleDrawer: () => void;
        toggleButtonPositionClass: string;
        toggleButtonTooltipPosition: string;
        option: SideDocumentOption;
        drawerId: string;
    } = $props();
</script>

<!-- トグルボタン -->
<button
    type="button"
    class="sd-toggle-button {toggleButtonPositionClass}"
    data-sd-c-tooltip={isOpened
        ? str(option.i18nText, "toggleButtonCloseTooltip")
        : str(option.i18nText, "toggleButtonOpenTooltip")}
    data-sd-c-tooltip-position={toggleButtonTooltipPosition}
    on:click={toggleDrawer}
    aria-label={isOpened
        ? str(option.i18nText, "toggleButtonCloseTooltip")
        : str(option.i18nText, "toggleButtonOpenTooltip")}
    aria-expanded={isOpened}
    aria-controls={drawerId}
>
    {#if isOpened}
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
            ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
                d="M8 8a3.5 3 0 0 1 3.5 -3h1a3.5 3 0 0 1 3.5 3a3 3 0 0 1 -2 3a3 4 0 0 0 -2 4"
            /><path d="M12 19l0 .01" /></svg
        >
    {/if}
</button>

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
        transform: scale(0.95);
    }
    .sd-toggle-button:hover {
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

    .sd-toggle-button-icon {
        width: 28px;
        height: 28px;
        display: block;
        stroke: white;
        fill: none;
    }
</style>
