import type { SideDocumentI18NText } from "../types";

/**
 * 指定キーのi18nテキストを取得する
 * 
 * @param i18nText 
 * @param key 
 * @param defaultValue 
 * @returns 
 */
export function str(i18nText: SideDocumentI18NText, key: keyof SideDocumentI18NText, defaultValue: string | null = null): string {
    return i18nText[key] || defaultValue || "";
}
