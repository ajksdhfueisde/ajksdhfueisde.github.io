import {Button, Col, Row, Table, Tooltip, Typography, Upload, Modal, Checkbox, message} from "antd";
import {CloseOutlined} from "@ant-design/icons";
import {ColumnProps} from "antd/lib/table";
import React, {useState, useEffect} from "react";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {RootState} from "type/state";
import {actions} from "../index";
import {CONFIRM_LANGUAGE_KEY_URL} from "utils/constant";

interface Props {
    visible: boolean;
    inputSelectLanguages: string[];
    onSelectChange: (keys: string[]) => void;
    onCancel: () => void;
}

const LanguageSelectModal: React.FC<Props> = ({visible, inputSelectLanguages, onCancel, onSelectChange}) => {
    const [selectLanguages, setSelectLanguages] = useState([...inputSelectLanguages] || ["en_us"]);
    const plainOptions = Object.keys(CONFIRM_LANGUAGE_KEY_URL);
    const handleOk = () => {
        if ([...selectLanguages].sort().join() === [...inputSelectLanguages].sort().join()) {
            onCancel();
            return;
        }
        onSelectChange(selectLanguages);
    };
    return (
        <Modal title="Select Language" visible={visible} onOk={handleOk} onCancel={onCancel}>
            <Checkbox.Group
                options={plainOptions}
                value={selectLanguages}
                onChange={value => {
                    if (value.length <= 3) {
                        setSelectLanguages(value as string[]);
                    } else {
                        message.warn("Max 3 language");
                    }
                }}
            />
        </Modal>
    );
};

const mapStatsToProps = (state: RootState) => {
    const {selectModalVisible, columns} = state.app.home;
    return {
        visible: selectModalVisible,
        inputSelectLanguages: columns,
    };
};
const mapDispatchToProps = (dispatch: Dispatch) => ({
    onCancel: () => dispatch(actions.changeModalVisible(false)),
    onSelectChange: (keys: string[]) => dispatch(actions.onLanguageSelectChange(keys)),
});

export default connect(mapStatsToProps, mapDispatchToProps)(LanguageSelectModal);
