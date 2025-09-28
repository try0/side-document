import type { SideDocumentPersistedState } from "../types";

export function save(key: string, state: SideDocumentPersistedState): void {
    localStorage.setItem(key, JSON.stringify(state));
}
export function load(key: string): SideDocumentPersistedState | null {
    const item = localStorage.getItem(key);
    if (item) {
        return JSON.parse(item);
    }
    return null;
}

export function getStateKey(prefix: string | undefined): string {
    return `${(prefix || "sd-")}-state`;
}