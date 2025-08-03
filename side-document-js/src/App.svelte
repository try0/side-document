<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import SideDocumentContainer from "./lib/SideDocumentContainer.svelte";
    import { SideDocument } from "./SideDocument";

    // 開発用Appコンポーネント
   
    let option = $state(Object.assign({}, SideDocument.defaultOption));
    let app = new SideDocument(option);

    let preOption = $state(Object.assign({}, SideDocument.defaultOption));
    $effect(() => {
        let upd = false;
        if (option.documentDrawerPosition !== preOption.documentDrawerPosition) {
            upd = true;
        }

        if (option.drawerWidthUnit !== preOption.drawerWidthUnit) {
            upd = true;
        }
        if (option.drawerWidth !== preOption.drawerWidth) {
            upd = true;
        }
        if (option.enableToggleButton !== preOption.enableToggleButton) {
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
        if (upd) {
            app.update(option);
            preOption = Object.assign({}, option);
        }
    });

    onMount(() => {
        // 初期化
        app.init();
    });

    onDestroy(() => {

    });

    // トグルボタン位置のオプション
    const positionOptions = [
        { value: "top-left", label: "Top Left" },
        { value: "top-right", label: "Top Right" },
        { value: "bottom-left", label: "Bottom Left" },
        { value: "bottom-right", label: "Bottom Right" },
    ];
</script>

<main >
    <div>
        <h1>Side Document Example</h1>
        <p>This is a simple example of using Side Document.</p>
    </div>

    <div class="settings-panel">
        <div class="setting-group">
            <h2>Toggle Button Settings</h2>

            <label class="setting-item">
                <input
                    type="checkbox"
                    bind:checked={option.enableToggleButton}
                />
                <span>Enable Toggle Button</span>
            </label>

            <div class="setting-item">
                <span>Button Position:</span>
                <div class="position-selectors">
                    {#each positionOptions as pos}
                        <label class="position-option">
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
        </div>

        <div class="setting-group">
            <h2>Drawer Settings</h2>

            <div class="setting-item">
                <span>Drawer Position:</span>
                <div class="position-selectors">
                    <label class="position-option">
                        <input
                            type="radio"
                            name="drawer-position"
                            value="left"
                            bind:group={option.documentDrawerPosition}
                        />
                        <span>Left</span>
                    </label>
                    <label class="position-option">
                        <input
                            type="radio"
                            name="drawer-position"
                            value="right"
                            bind:group={option.documentDrawerPosition}
                        />
                        <span>Right</span>
                    </label>
                </div>
            </div>

            <div class="setting-item">
                <span>Initial Width ({option.drawerWidthUnit}):</span>
                <input
                    type="number"
                    min={option.drawerWidthUnit === "px" ? 100 : 10}
                    max={option.drawerWidthUnit === "px"
                        ? 800
                        : option.drawerWidthUnit === "%"
                          ? 100
                          : 100}
                    bind:value={option.drawerWidth}
                    class="width-input"
                />
            </div>

            <div class="setting-item width-unit-container">
                <span>Width Unit:</span>
                <div class="position-selectors">
                    <label class="position-option">
                        <input
                            type="radio"
                            name="width-unit"
                            value="px"
                            bind:group={option.drawerWidthUnit}
                            on:change={() => {
                                if (
                                    option.drawerWidthUnit === "%" &&
                                    option.drawerWidth > 100
                                ) {
                                    option.drawerWidth = 100;
                                }
                            }}
                        />
                        <span>px</span>
                    </label>
                    <label class="position-option">
                        <input
                            type="radio"
                            name="width-unit"
                            value="%"
                            bind:group={option.drawerWidthUnit}
                            on:change={() => {
                                if (option.drawerWidth > 100) {
                                    option.drawerWidth = 100;
                                }
                            }}
                        />
                        <span>%</span>
                    </label>
                </div>
            </div>

            <label class="setting-item">
                <input type="checkbox" bind:checked={option.resizable} />
                <span>Enable Resizing</span>
            </label>
        </div>

        <div class="setting-group">
            <h2>Behavior Settings</h2>

            <label class="setting-item">
                <input
                    type="checkbox"
                    bind:checked={option.closeOnOutsideClick}
                />
                <span>Close on Outside Click</span>
            </label>
        </div>


        
        <div class="setting-group">
            <h2>Functions</h2>

            <div>
                <button on:click={() => app.openDrawer()}>Open Drawer</button>
                <button on:click={() => app.closeDrawer()}>Close Drawer</button>
                <button on:click={() => app.toggleDrawer()}>
                    Toggle Drawer
                </button>
            </div>
        </div>
    </div>
</main>

<style>
    .settings-panel {
        background-color: #f5f5f5;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
        max-width: 600px;
    }

    .setting-group {
        margin-bottom: 20px;
    }

    .setting-group h2 {
        font-size: 1.2rem;
        margin-bottom: 10px;
        color: #333;
    }

    .setting-item {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
    }

    .setting-item input[type="checkbox"] {
        margin-right: 8px;
    }

    .position-selectors {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 8px;
        margin-left: 8px;
    }

    .position-option {
        display: flex;
        align-items: center;
        cursor: pointer;
    }

    .position-option input {
        margin-right: 4px;
    }

    .width-input {
        margin-left: 8px;
        width: 80px;
        padding: 4px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
</style>
