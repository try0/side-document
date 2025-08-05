<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import SideDocumentContainer from "./lib/SideDocumentContainer.svelte";
    import { SideDocument } from "./SideDocument";

    // 開発用Appコンポーネント

    let option = $state(Object.assign({}, SideDocument.defaultOption));
    option.defaultSrc = "./sample.html"; // 初期ページURLを設定
    let app = new SideDocument(option);

    let updatingId: number | null = null;
    let preOption = $state(Object.assign({}, SideDocument.defaultOption));
    $effect(() => {
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

        if (option.primaryColor !== preOption.primaryColor) {
            upd = true;
        }

        if (option.defaultSrc !== preOption.defaultSrc) {
            upd = true;
        }

        if (option.toggleButtonFollowsDrawerPosition !== preOption.toggleButtonFollowsDrawerPosition) {
            upd = true;
        }

        if (upd) {
            if (updatingId) {
                clearTimeout(updatingId);
            }
            updatingId = window.setTimeout(() => {
                app.update(option);
                preOption = Object.assign({}, option);
                updatingId = null;
            }, 200);
        }
    });

    onMount(() => {
        // 初期化
        app.init();
    });

    onDestroy(() => {});

    // トグルボタン位置のオプション
    const positionOptions = [
        { value: "top-left", label: "左上" },
        { value: "top-right", label: "右上" },
        { value: "bottom-left", label: "左下" },
        { value: "bottom-right", label: "右下" },
    ];
</script>

<main class="app-container">
    <div>
        <h1>Side Document Example</h1>
        <p>使い方とサンプル</p>
    </div>

    <div class="container">
        <!-- 左側：設定パネル -->
        <div class="settings-panel">
            <h2 class="panel-title">Settings</h2>

            <!-- トグルボタン設定 -->
            <div class="setting-group">
                <div class="setting-header">Toggle Button</div>

                <div class="setting-content">
                    <div class="setting-row">
                        <div class="setting-label">
                            <code>enableToggleButton</code>
                            <div class="label-description">表示する</div>
                        </div>
                        <div class="setting-control">
                            <label class="toggle-switch">
                                <input
                                    type="checkbox"
                                    bind:checked={option.enableToggleButton}
                                />
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    <div class="setting-row">
                        <div class="setting-label">
                            <code>toggleButtonPosition</code>
                            <div class="label-description">ボタンの位置</div>
                        </div>
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

                    <div class="setting-row">
                        <div class="setting-label">
                            <code>toggleButtonFollowsDrawerPosition</code>
                            <div class="label-description">
                                Drawer位置にトグルボタン位置を追従させる
                            </div>
                        </div>
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
                <div class="setting-header">Drawer</div>

                <div class="setting-content">
                    <div class="setting-row">
                        <div class="setting-label">
                            <code>drawerPosition</code>
                            <div class="label-description">Drawerの位置</div>
                        </div>
                        <div class="setting-control radio-group">
                            <label class="radio-option">
                                <input
                                    type="radio"
                                    name="drawer-position"
                                    value="left"
                                    bind:group={option.drawerPosition}
                                />
                                <span>左</span>
                            </label>
                            <label class="radio-option">
                                <input
                                    type="radio"
                                    name="drawer-position"
                                    value="right"
                                    bind:group={option.drawerPosition}
                                />
                                <span>右</span>
                            </label>
                        </div>
                    </div>

                    <div class="setting-row">
                        <div class="setting-label">
                            <code>drawerWidth</code>
                            <div class="label-description">初期サイズ</div>
                        </div>
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

                    <div class="setting-row">
                        <div class="setting-label">
                            <code>drawerWidthUnit</code>
                            <div class="label-description">
                                初期サイズの単位
                            </div>
                        </div>
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

                    <div class="setting-row">
                        <div class="setting-label">
                            <code>resizable</code>
                            <div class="label-description">
                                リサイズを有効にする
                            </div>
                        </div>
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

                    <div class="setting-row">
                        <div class="setting-label">
                            <code>defaultSrc</code>
                            <div class="label-description">
                                デフォルトドキュメントURL
                            </div>
                        </div>
                        <div class="setting-control full-width">
                            <input
                                type="text"
                                bind:value={option.defaultSrc}
                                placeholder="https://example.com/docs"
                                class="url-input"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <!-- 動作設定 -->
            <div class="setting-group">
                <div class="setting-header">Behavior</div>

                <div class="setting-content">
                    <div class="setting-row">
                        <div class="setting-label">
                            <code>closeOnOutsideClick</code>
                            <div class="label-description">
                                外部クリックで閉じる
                            </div>
                        </div>
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
                </div>
            </div>

            <!-- スタイリング設定 -->
            <div class="setting-group">
                <div class="setting-header">Styling</div>

                <div class="setting-content">
                    <div class="setting-row">
                        <div class="setting-label">
                            <code>primaryColor</code>
                            <div class="label-description">
                                プライマリカラー
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
                </div>
            </div>
        </div>

        <!-- 右側：機能パネル -->
        <div class="functions-panel">
            <h2 class="panel-title">Functions</h2>

            <div class="function-group">
                <div class="function-header">Drawer Control</div>

                <div class="function-content">
                    <button
                        class="function-button"
                        on:click={() => app.openDrawer()}
                    >
                        <div class="function-name">openDrawer()</div>
                        <div class="function-description">Drawerを開く</div>
                    </button>

                    <button
                        class="function-button"
                        on:click={() => app.closeDrawer()}
                    >
                        <div class="function-name">closeDrawer()</div>
                        <div class="function-description">Drawerを閉じる</div>
                    </button>

                    <button
                        class="function-button"
                        on:click={() => app.toggleDrawer()}
                    >
                        <div class="function-name">toggleDrawer()</div>
                        <div class="function-description">
                            Drawerを切り替える
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
    transition: border-color 0.2s, box-shadow 0.2s;
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
    padding: 0;
    border: none;
    background: none;
}

.color-text {
    width: 110px;
    min-width: 80px;
    max-width: 140px;
    font-family: monospace;
}
</style>
