<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { SideDocument } from "./SideDocument";

    // 開発用Appコンポーネント

    let contentType: "iframe" | "page-element" = $state("iframe");
    $effect(() => {
        if (contentType === "iframe") {
            app.setFrameSrc(option.defaultSrc);
        } else if (contentType === "page-element") {
            option.showToggleButton = true;
            option.drawerWidth = 400;
            option.drawerWidthUnit = "px";

            app.setDrawerContent();
        }
    });

    let option = $state(Object.assign({}, SideDocument.DEFAULT_OPTION));
    option.defaultSrc = "./sample.html"; // 初期ページURLを設定
    let app = new SideDocument(option);

    let updatingId: number | null = null;
    let preOption = $state(Object.assign({}, SideDocument.DEFAULT_OPTION));
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

        if (option.defaultSrc !== preOption.defaultSrc) {
            upd = true;
        }

        if (
            option.toggleButtonFollowsDrawerPosition !==
            preOption.toggleButtonFollowsDrawerPosition
        ) {
            upd = true;
        }

        if (
            JSON.stringify(option.showDrawerButtons) !==
            JSON.stringify(preOption.showDrawerButtons)
        ) {
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
        <div class="tab-bar">
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
                ページ要素
            </button>
            <template data-sd-document>
                <div style="padding: 10px;">
                    <h1>setDrawerContent()</h1>
                    <p>
                        ページからdata-sd-documentアトリビュートを持つ要素を、Drawerコンテンツとして設定できます。
                    </p>
                </div>
            </template>
        </div>

        <!-- 左側：設定パネル -->
        <div class="settings-panel">
            <h2 class="panel-title">Settings</h2>

            <!-- トグルボタン設定 -->
            <div class="setting-group">
                <div class="setting-header">Toggle Button</div>

                <div class="setting-content">
                    <div id="showToggleButton" class="setting-row">
                        <div class="setting-label">
                            <code>showToggleButton</code>
                            <div class="label-description">表示する</div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#showToggleButton">
                                    showToggleButton
                                </h3>
                                <p>
                                    トグルボタンを表示するかどうかを設定します。
                                    <br />
                                    トグルボタンはDrawerの開閉を切り替えるためのボタンです。
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
                            <div class="label-description">ボタンの位置</div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#toggleButtonPosition">
                                    toggleButtonPosition
                                </h3>
                                <p>
                                    トグルボタンの位置を設定します。
                                    <span
                                        data-sd-link-target="#toggleButtonFollowsDrawerPosition"
                                        >toggleButtonFollowsDrawerPosition</span
                                    >
                                    が有効な場合、Drawerの位置に応じて自動的に位置が調整されます。
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
                                Drawer位置にトグルボタン位置を追従させる
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
                                    Drawer位置にトグルボタン位置を追従させるかどうかを設定します。
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
                <div class="setting-header">Drawer</div>

                <div class="setting-content">
                    <div id="drawerPosition" class="setting-row">
                        <div class="setting-label">
                            <code>drawerPosition</code>
                            <div class="label-description">Drawerの位置</div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#drawerPosition">
                                    drawerPosition
                                </h3>
                                <p>
                                    Drawerの位置を設定します。
                                    <br />
                                    Drawerは画面の左または右に表示されます。
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

                    <div id="drawerWidth" class="setting-row">
                        <div class="setting-label">
                            <code>drawerWidth</code>
                            <div class="label-description">初期サイズ</div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#drawerWidth">
                                    drawerWidth
                                </h3>
                                <p>Drawerの初期サイズを設定します。</p>
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
                                初期サイズの単位
                            </div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#drawerWidthUnit">
                                    drawerWidthUnit
                                </h3>
                                <p>Drawerの初期サイズの単位を設定します。</p>
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
                            <div class="label-description">最小サイズ</div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#drawerMinWidth">
                                    drawerMinWidth
                                </h3>
                                <p>
                                    ドロワーの最小サイズを設定します。リサイズ時に適用されます。
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
                            <div class="label-description">最大サイズ</div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#drawerMaxWidth">
                                    drawerMaxWidth
                                </h3>
                                <p>
                                    ドロワーの最大サイズを設定します。リサイズ時に適用されます。
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
                                リサイズを有効にする
                            </div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#resizable">
                                    resizable
                                </h3>
                                <p>
                                    Drawerのリサイズを有効にするかどうかを設定します。
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

                    <div id="defaultSrc" class="setting-row">
                        <div class="setting-label">
                            <code>defaultSrc</code>
                            <div class="label-description">
                                デフォルトドキュメントURL
                            </div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#defaultSrc">
                                    defaultSrc
                                </h3>
                                <p>
                                    Drawerに表示するデフォルトurlを指定します。
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
                                ドロワー内に表示するボタン
                            </div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#showDrawerButtons">
                                    showDrawerButtons
                                </h3>
                                <p>Drawer操作用のボタンを設定します。</p>
                            </div>
                        </template>
                        <div class="setting-control">
                            <label
                                class="radio-option"
                                style="margin-right:12px;"
                            >
                                <input
                                    type="checkbox"
                                    value="close"
                                    checked={option.showDrawerButtons.includes(
                                        "close",
                                    )}
                                    on:change={(e) => {
                                        const target =
                                            e.target as HTMLInputElement | null;
                                        if (target && target.checked) {
                                            option.showDrawerButtons = [
                                                ...option.showDrawerButtons,
                                                "close",
                                            ];
                                        } else if (target) {
                                            option.showDrawerButtons =
                                                option.showDrawerButtons.filter(
                                                    (v) => v !== "close",
                                                );
                                        }
                                    }}
                                />
                                <span>閉じる</span>
                            </label>

                            <label class="radio-option">
                                <input
                                    type="checkbox"
                                    value="external-link"
                                    checked={option.showDrawerButtons.includes(
                                        "external-link",
                                    )}
                                    on:change={(e) => {
                                        const target =
                                            e.target as HTMLInputElement | null;
                                        if (target && target.checked) {
                                            option.showDrawerButtons = [
                                                ...option.showDrawerButtons,
                                                "external-link",
                                            ];
                                        } else if (target) {
                                            option.showDrawerButtons =
                                                option.showDrawerButtons.filter(
                                                    (v) =>
                                                        v !== "external-link",
                                                );
                                        }
                                    }}
                                />
                                <span>外部リンク</span>
                            </label>
                            <label
                                class="radio-option"
                                style="margin-right:12px;"
                            >
                                <input
                                    type="checkbox"
                                    value="position-change"
                                    checked={option.showDrawerButtons.includes(
                                        "position-change",
                                    )}
                                    on:change={(e) => {
                                        const target =
                                            e.target as HTMLInputElement | null;
                                        if (target && target.checked) {
                                            option.showDrawerButtons = [
                                                ...option.showDrawerButtons,
                                                "position-change",
                                            ];
                                        } else if (target) {
                                            option.showDrawerButtons =
                                                option.showDrawerButtons.filter(
                                                    (v) =>
                                                        v !== "position-change",
                                                );
                                        }
                                    }}
                                />
                                <span>位置切替</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 動作設定 -->
            <div class="setting-group">
                <div class="setting-header">Behavior</div>

                <div class="setting-content">
                    <div id="closeOnOutsideClick" class="setting-row">
                        <div class="setting-label">
                            <code>closeOnOutsideClick</code>
                            <div class="label-description">
                                外部クリックで閉じる
                            </div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#closeOnOutsideClick">
                                    closeOnOutsideClick
                                </h3>
                                <p>
                                    ドロワー外をクリックしたときにドロワーを閉じるかどうかを設定します。
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
                                ドロワーを閉じた時にiframeを再読み込み
                            </div>
                        </div>
                        <template data-sd-document>
                            <div style="padding: 10px;">
                                <h3 data-sd-link-target="#refreshFrameOnClose">
                                    refreshFrameOnClose
                                </h3>
                                <p>
                                    ドロワーを閉じた際にiframeの内容を再読み込みするかどうかを設定します。
                                    iframe内でのインタラクティブな変更を元に戻したい場合に有効化します。
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
                <div class="setting-header">Styling</div>

                <div class="setting-content">
                    <div id="primaryColor" class="setting-row">
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
</style>
