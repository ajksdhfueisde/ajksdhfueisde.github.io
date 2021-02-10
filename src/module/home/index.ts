import {Module, register, SagaIterator, call} from "core-fe";
import MainComponent from "./component/Home";
import {RootState} from "type/state";
import {Location} from "history";
import {ProductAJAXWebService} from "service/ProductAJAXWebService";
import {LanguageCode, GoogleTranslateResponse} from "./type";
import {message} from "antd";
import {CURRENT_LANGUAGE_KEY_URL, CONFIRM_LANGUAGE_KEY_URL, LanguageType, IFlatLanguageList} from "utils/constant";

export interface HomeState {
    mergeLanguageList: IFlatLanguageList;
    columns: LanguageType[];
    selectModalVisible: boolean;
    // confirmObj: {[key: string]: Array<{key: string; value: string}>};
}

const homeInitState: HomeState = {
    mergeLanguageList: {},
    columns: [],
    selectModalVisible: false,
    // confirmObj: {},
};

function abstractKeys(obj: Object) {
    const splitMarker = "####";
    const ALL_KEYS: Array<{key: string; value: string}> = [];

    function loop(subObj: Object, preKey = "") {
        if (typeof obj !== "object") {
            return;
        }
        const keys = Object.keys(subObj);
        if (!keys.length) {
            return;
        }
        keys.forEach(key => {
            if (typeof subObj[key] === "string") {
                ALL_KEYS.push({key: `${preKey}${preKey ? splitMarker : ""}${key}`, value: subObj[key]});
            } else if (typeof subObj[key] === "object") {
                loop(subObj[key], `${preKey}${preKey ? splitMarker : ""}${key}`);
            } else {
                console.error(`${preKey}${preKey ? splitMarker : ""}${key} error`);
            }
        });
    }

    loop(obj);

    return ALL_KEYS;
}

function restoreByKeys(ALL_KEYS: Array<{key: string; value: string}>) {
    const splitMarker = "####";
    let obj = {};
    function detectObj(obj: any, props: string[], value: string): any {
        if (!props.length) {
            return;
        }
        const prop = props.shift() as string;
        if (!props.length) {
            obj[prop] = value;
            return;
        }
        if (!obj[prop]) {
            obj[prop] = {};
        }
        detectObj(obj[prop], props, value);
    }
    ALL_KEYS.forEach(item => {
        const props = item.key.split(splitMarker);
        detectObj(obj, props, item.value);
    });
    return obj;
}

class HomeModule extends Module<RootState, "home"> {
    _translate(query: string, target: LanguageCode, source: LanguageCode | "" = ""): Promise<GoogleTranslateResponse> {
        return new Promise((resolve, reject) => {
            fetch("https://google-translate1.p.rapidapi.com/language/translate/v2", {
                method: "POST",
                headers: {
                    "x-rapidapi-host": "google-translate1.p.rapidapi.com",
                    "x-rapidapi-key": "cc992288bbmsh8a52e14579c3b7bp1a03b0jsn7aaf534f3eb4",
                    "accept-encoding": "application/gzip",
                    "content-type": "application/x-www-form-urlencoded",
                },
                body: `source=${source}&q=${query}&target=${target}`,
            })
                .then(res => {
                    resolve(res.json());
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    *translate(query: string, target: LanguageCode, source: LanguageCode | "" = ""): SagaIterator {
        const response = yield* call(() => this._translate(query, target, source));
        console.log("translate", response);
    }

    *exportJSON(colName: LanguageType = this.state.columns[0]): SagaIterator {
        const {mergeLanguageList, columns} = this.state;
        if (!columns.includes(colName)) {
            message.error("Export name should import already");
            return;
        }
        const exportKeyObj = Object.keys(mergeLanguageList).map(key => ({key, value: mergeLanguageList[key][colName]?.value || ""}));
        // const exportKeyObj = mergeLanguageList.map(lang => ({key: lang.title, value: lang[colName] || ""}));
        const downloadObj = restoreByKeys(exportKeyObj);
        if (downloadObj) {
            const formatData = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(downloadObj, undefined, 4));
            const AElement = document.createElement("a");
            AElement.href = formatData;
            AElement.download = colName + ".json";
            AElement.click();
            AElement.remove();
        }
    }

    dealWithJSON(obj: any, name: LanguageType) {
        let {mergeLanguageList, columns} = this.state;
        mergeLanguageList = JSON.parse(JSON.stringify(mergeLanguageList));
        const flatObj = abstractKeys(obj);
        flatObj.sort((a, b) => (a.key > b.key ? 1 : -1));
        flatObj.forEach(item => {
            if (mergeLanguageList[item.key]) {
                mergeLanguageList[item.key][name] = {
                    value: item.value,
                    original: item.value,
                    confirm: "",
                    isEdited: false,
                    isConfirmChanged: false,
                    // isNewKey: false,
                    isEmpty: !item.value,
                };
            } else {
                mergeLanguageList[item.key] = {[name]: {
                    value: item.value,
                    original: item.value,
                    confirm: "",
                    isEdited: false,
                    isConfirmChanged: false,
                    // isNewKey: false,
                    isEmpty: !item.value,
                }};
            }
        });
        return {mergeLanguageList: {...mergeLanguageList}, columns: columns.concat([name])};
    }

    *importJSON(file?: File, colName?: string): SagaIterator {
        if (!file) {
            return;
        }
        let {mergeLanguageList, columns} = this.state;
        const name = colName || file.name.replace(".json", "");
        if (columns.includes(name as LanguageType)) {
            message.error("Don't import json with same name");
            return;
        }
        const reader = new FileReader();

        reader.onload = result => {
            try {
                const jsonStr = (result.target?.result || "{}") as string;
                const obj = JSON.parse(jsonStr);
                const {mergeLanguageList, columns} = this.dealWithJSON(obj, name as LanguageType);
                this.setState({mergeLanguageList, columns});
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error(err);
            }
        };

        reader.readAsText(file);
    }

    async _importFile(url: string) {
        const temp = await fetch(url);
        return temp.json();
    }

    *fetchJSON(url: string) {
        const response = yield* call(() => this._importFile(url));
        return response;
    }

    *changeModalVisible(isShow: boolean) {
        this.setState({selectModalVisible: isShow});
    }

    *onLanguageSelectChange(keys: LanguageType[]) {
        for (let i = 0; i < keys.length; i++) {
            const {columns: _columns} = this.state;
            if (_columns.includes(keys[i])) {
                continue;
            }
            const response = yield* call(() => this.fetchJSON(CURRENT_LANGUAGE_KEY_URL[keys[i]]));
            const {mergeLanguageList, columns} = this.dealWithJSON(response, keys[i]);
            // if (confirmObj[keys[i]]) {
            //     this.setState({mergeLanguageList, columns});
            // } else {
            const confirmResponse = yield* call(() => this.fetchJSON(CONFIRM_LANGUAGE_KEY_URL[keys[i]]));
            const flatConfirmObj = abstractKeys(confirmResponse);
            flatConfirmObj.forEach(item => {
                if (!mergeLanguageList[item.key]) {
                    return;
                }
                const obj = mergeLanguageList[item.key][keys[i]];
                if (obj) {
                    obj.confirm = item.value;
                    if (obj.confirm !== obj.original) {
                        obj.isConfirmChanged = true;
                    }
                }
            })
            this.setState({mergeLanguageList, columns});
            // }
        }
        console.log(this.state.mergeLanguageList);
        this.setState({selectModalVisible: false});
    }
}

const module = register(new HomeModule("home", homeInitState));
export const actions = module.getActions();
export const Home = module.attachLifecycle(MainComponent);
