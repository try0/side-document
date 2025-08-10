<script lang="ts">
    import { onMount, onDestroy } from "svelte";

    let {
        targetElement,
        active = true,
        padding = 12,
        borderColor = "var(--sd-primary-color,#236ad4)",
        fillColor = "color-mix(in srgb, var(--sd-primary-color) 0%, transparent)",
        pulse = true,
        pollInterval = 0,
        positioning = "fixed",
        trackScroll = true,
        trackResize = true,
    }: {
        targetElement?: HTMLElement | null;
        active?: boolean;
        padding?: number;
        borderColor?: string;
        fillColor?: string;
        pulse?: boolean;
        pollInterval?: number;
        positioning?: "absolute" | "fixed";
        trackScroll?: boolean;
        trackResize?: boolean;
    } = $props();

    let boxElement: HTMLDivElement | null = null;
    let lastRectKey = $state("");
    let pollTimer: number | null = null;
    let resizeObserver: ResizeObserver | null = null;

    function applyRect() {
        if (!boxElement) {
            return;
        }

        if (!active || !targetElement) {
            boxElement.style.opacity = "0";
            return;
        }
        const targetElementRect = targetElement.getBoundingClientRect();
        const top =
            targetElementRect.top -
            padding +
            (positioning === "absolute" ? scrollY : 0);
        const left =
            targetElementRect.left -
            padding +
            (positioning === "absolute" ? scrollX : 0);
        const width = targetElementRect.width + padding * 2;
        const height = targetElementRect.height + padding * 2;
        const key = `${top}|${left}|${width}|${height}`;
        if (key === lastRectKey) return;
        lastRectKey = key;
        Object.assign(boxElement.style, {
            top: `${top}px`,
            left: `${left}px`,
            width: `${width}px`,
            height: `${height}px`,
            opacity: "1",
        });
    }

    function attachResizeObserver() {
        if (resizeObserver) {
            resizeObserver.disconnect();
            resizeObserver = null;
        }
        if (trackResize && targetElement && "ResizeObserver" in window) {
            resizeObserver = new ResizeObserver(() => applyRect());
            resizeObserver.observe(targetElement);
        }
    }

    function start() {
        if (trackScroll) window.addEventListener("scroll", applyRect, true);
        if (trackResize) window.addEventListener("resize", applyRect, true);
        if (pollInterval > 0) {
            pollTimer = window.setInterval(applyRect, pollInterval);
        }
        attachResizeObserver();
        queueMicrotask(applyRect);
    }

    function stop() {
        window.removeEventListener("scroll", applyRect, true);
        window.removeEventListener("resize", applyRect, true);
        if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
        }
        if (resizeObserver) {
            resizeObserver.disconnect();
            resizeObserver = null;
        }
    }

    $effect(() => {
        applyRect();
    });

    $effect(() => {
        attachResizeObserver();
    });

    onMount(() => {
        start();
    });

    onDestroy(() => {
        stop();
    });
</script>

<div
    bind:this={boxElement}
    class="sd-related-effect {pulse ? 'pulse' : ''}"
    aria-hidden="true"
    style="
        --sd-related-border-color: {borderColor};
        --sd-related-fill-color: {fillColor};
        --sd-related-position: {positioning};
    "
></div>

<style lang="postcss">
    .sd-related-effect {
        position: var(--sd-related-position, fixed);
        pointer-events: none;
        box-sizing: border-box;
        border: 2px solid var(--sd-related-border-color, #236ad4);
        background: var(--sd-related-fill-color, rgba(35, 106, 212, 0.1));
        border-radius: 6px;
        opacity: 0;
        transition:
            opacity 0.18s ease,
            top 0.12s ease,
            left 0.12s ease,
            width 0.12s ease,
            height 0.12s ease;
        z-index: var(--sd-drawer-z-index, 2147482000);
    }

    .sd-related-effect.pulse {
        animation: sd-related-pulse 1.2s ease-out infinite;
    }

    @keyframes sd-related-pulse {
        0% {
            box-shadow: 0 0 0 0
                color-mix(in srgb, var(--sd-primary-color) 55%, transparent);
        }
        70% {
            box-shadow: 0 0 0 10px
                color-mix(in srgb, var(--sd-primary-color) 0%, transparent);
        }
        100% {
            box-shadow: 0 0 0 0
                color-mix(in srgb, var(--sd-primary-color) 0%, transparent);
        }
    }
</style>
