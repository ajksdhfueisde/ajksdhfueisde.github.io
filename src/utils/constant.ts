const ENV = "https://cdn.jsdelivr.net/gh/ajksdhfueisde/ajksdhfueisde.github.io/";

export const CURRENT_LANGUAGE_KEY_URL: ILanguageObject = {
    de_DE: `${ENV}/static/i18n/current_i18n/de_DE.json`,
    en_GB: `${ENV}/static/i18n/current_i18n/en_GB.json`,
    en_US: `${ENV}/static/i18n/current_i18n/en_US.json`,
    en_ES: `${ENV}/static/i18n/current_i18n/en_ES.json`,
    fr_FR: `${ENV}/static/i18n/current_i18n/fr_FR.json`,
    it_IT: `${ENV}/static/i18n/current_i18n/it_IT.json`,
    pl_PL: `${ENV}/static/i18n/current_i18n/pl_PL.json`,
    pt_PT: `${ENV}/static/i18n/current_i18n/pt_PT.json`,
    ru_RU: `${ENV}/static/i18n/current_i18n/ru_RU.json`,
    zh_CN: `${ENV}/static/i18n/current_i18n/zh_CN.json`,
};

export const CONFIRM_LANGUAGE_KEY_URL: ILanguageObject = {
    de_DE: `${ENV}/static/i18n/confirm_i18n/de_DE.json`,
    en_GB: `${ENV}/static/i18n/confirm_i18n/en_GB.json`,
    en_US: `${ENV}/static/i18n/confirm_i18n/en_US.json`,
    en_ES: `${ENV}/static/i18n/confirm_i18n/en_ES.json`,
    fr_FR: `${ENV}/static/i18n/confirm_i18n/fr_FR.json`,
    it_IT: `${ENV}/static/i18n/confirm_i18n/it_IT.json`,
    pl_PL: `${ENV}/static/i18n/confirm_i18n/pl_PL.json`,
    pt_PT: `${ENV}/static/i18n/confirm_i18n/pt_PT.json`,
    ru_RU: `${ENV}/static/i18n/confirm_i18n/ru_RU.json`,
    zh_CN: `${ENV}/static/i18n/confirm_i18n/zh_CN.json`,
};

interface IValueProps {
    value: string;
    original: string;
    confirm: string;
    isEdited?: boolean;
    isConfirmChanged?: boolean;
    // isNewKey?: boolean;
    isEmpty?: boolean;
}

interface ILanguageObject<T = string> {
    de_DE: T;
    en_GB: T;
    en_US: T;
    en_ES: T;
    fr_FR: T;
    it_IT: T;
    pl_PL: T;
    pt_PT: T;
    ru_RU: T;
    zh_CN: T;
}

export type LanguageType = keyof ILanguageObject;

export type IFlatLanguageListItem = Partial<ILanguageObject<IValueProps>>;
export interface IFlatLanguageList {
    [key: string]: IFlatLanguageListItem;
}
