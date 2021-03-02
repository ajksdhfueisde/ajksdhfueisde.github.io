import {Button, Avatar, Col, Row, Table, Tooltip, Typography, Checkbox, Modal} from "antd";
import {CloseOutlined} from "@ant-design/icons";
import {ColumnProps} from "antd/lib/table";
import React, {useState, useEffect} from "react";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {RootState} from "type/state";
import {actions} from "../index";
import LanguageSelectModal from "./LanguageSelectModal";
import {CURRENT_LANGUAGE_KEY_URL, CONFIRM_LANGUAGE_KEY_URL, IFlatLanguageListItem, IFlatLanguageList, LanguageType} from "utils/constant";
import "./welcome.css";
import {CheckboxChangeEvent} from "antd/lib/checkbox";

interface Props {
    mergeLanguageList: IFlatLanguageList;
    columns: LanguageType[];
    hasImported: boolean;
    openLanguageModal: () => void;
    exportJSON: (columnName?: LanguageType) => void;
    cacheEditData: (column: LanguageType, key: string, value?: string) => void;
}

interface DataProps {
    title: string;
    data: IFlatLanguageListItem;
}

const Welcome: React.FC<Props> = ({hasImported, mergeLanguageList, columns, openLanguageModal, exportJSON, cacheEditData}) => {
    const [editLanguageList, setEditLanguageList] = useState<IFlatLanguageList>({});
    const [isEmptyFilter, setIsEmptyFilter] = useState<boolean>(true);
    const [isNewFilter, setIsNewFilter] = useState<boolean>(true);
    const [isConfirmChangeFilter, setIsConfirmChangeFilter] = useState<boolean>(true);
    useEffect(() => {
        if (mergeLanguageList && Object.keys(mergeLanguageList).length > 0) {
            setEditLanguageList({...mergeLanguageList});
        }
    }, [mergeLanguageList]);
    let dataSource: DataProps[] = Object.keys(editLanguageList).map(key => ({title: key, data: editLanguageList[key]}));
    if (isEmptyFilter || isConfirmChangeFilter || isNewFilter) {
        dataSource = dataSource.filter(item => {
            const isEmpty = isEmptyFilter && columns.some(column => item.data[column]?.isEmpty);
            const isConfirmChanged = isConfirmChangeFilter && columns.some(column => item.data[column]?.isConfirmChanged);
            const isNew = isNewFilter && columns.some(column => !item.data[column]?.confirm);
            return isEmpty || isConfirmChanged || isNew;
        });
    }
    const tableColumns: Array<ColumnProps<any>> = [
        {
            title: "No",
            dataIndex: "none",
            key: "none",
            width: `100px`,
            render: (value, record, index) => {
                return index + 1;
            },
        },
        {
            title: "title",
            dataIndex: "title",
            key: "title",
            width: `${90 / (columns.length + 1)}vw`,
            ellipsis: true,
            render: (value, record: DataProps) => {
                const isEmpty = isEmptyFilter && columns.some(column => record.data[column]?.isEmpty);
                const isConfirmChanged = isConfirmChangeFilter && columns.some(column => record.data[column]?.isConfirmChanged);
                const isNew = isNewFilter && columns.some(column => !record.data[column]?.confirm);
                return (
                    <Tooltip placement="topLeft" title={value}>
                        <Row>
                            <Col>
                                {isConfirmChanged && (
                                    <Avatar size={18} style={{background: "red"}}>
                                        C&nbsp;
                                    </Avatar>
                                )}
                            </Col>
                            <Col>
                                {isNew && (
                                    <Avatar size={18} style={{background: "green"}}>
                                        N&nbsp;
                                    </Avatar>
                                )}
                            </Col>
                            <Col>
                                <span>{value}</span>
                            </Col>
                        </Row>
                    </Tooltip>
                );
            },
        },
    ];
    const setValue = (title: string, column: LanguageType, value = "") => {
        setEditLanguageList({
            ...editLanguageList,
            [title]: {
                ...editLanguageList[title],
                [column]: {
                    ...editLanguageList[title][column],
                    value,
                    isEdited: value !== editLanguageList[title][column]?.original,
                    isEmpty: !value.trim(),
                    isConfirmChanged: editLanguageList[title][column]?.confirm && value !== editLanguageList[title][column]?.confirm,
                },
            },
        });
        cacheEditData(column, title, value);
    };
    columns.forEach(column => {
        tableColumns.push({
            title: () => {
                const emptyNum = dataSource.map(lang => lang.data[column]?.value).filter(item => !item).length;
                return (
                    <span>
                        {column}
                        {emptyNum > 0 && <i style={{color: "red", font: "10px"}}> ({emptyNum} empty)</i>}
                    </span>
                );
            },
            dataIndex: column,
            key: column,
            width: `${90 / (columns.length + 1)}vw`,
            ellipsis: true,
            render: (_: any, record: DataProps) => {
                const value = record.data[column]?.value;
                const isEmpty = !(value && value.trim());
                const isConfirmChanged = record.data[column]?.isConfirmChanged;
                const isNew = !record.data[column]?.confirm;
                const isEdited = record.data[column]?.isEdited;
                return (
                    <Tooltip
                        placement="topLeft"
                        title={
                            <div>
                                {isConfirmChanged && <div className="red">Last Confirmed: {record.data[column]?.confirm}</div>}
                                {isEdited && <div className="greenyellow">Original Value: {record.data[column]?.original}</div>}
                                <div>Current Value: {value}</div>
                            </div>
                        }
                    >
                        {isEmpty && (
                            <Typography.Text
                                editable={{
                                    onChange: text => setValue(record.title, column, text),
                                }}
                                className="ant-table-cell-ellipsis cell-empty"
                            >
                                None
                            </Typography.Text>
                        )}
                        {!isEmpty && isEdited && (
                            <div className="ant-table-cell-ellipsis cell-edit">
                                <Button
                                    danger
                                    type="primary"
                                    shape="circle"
                                    size="small"
                                    className="close-btn"
                                    onClick={() => {
                                        setValue(record.title, column, "");
                                    }}
                                    icon={<CloseOutlined className="clear-icon" />}
                                />
                                {value}
                            </div>
                        )}
                        {!isEmpty && !isEdited && (
                            <div className="ant-table-cell-ellipsis cell-normal">
                                <Button
                                    danger
                                    type="primary"
                                    className="close-btn"
                                    size="small"
                                    shape="circle"
                                    onClick={() => {
                                        setValue(record.title, column, "");
                                    }}
                                    icon={<CloseOutlined className="clear-icon" />}
                                />
                                {value}
                            </div>
                        )}
                    </Tooltip>
                );
            },
        });
    });
    return (
        <div>
            <Row justify="space-between" gutter={10} align="middle">
                <Col>
                    <Row justify="start" gutter={10} align="middle">
                        <Col>
                            <Typography.Title>Translation</Typography.Title>
                        </Col>
                        <Col>
                            <Typography.Text>({editLanguageList.length}'s keys)</Typography.Text>
                        </Col>
                    </Row>
                </Col>
                <Col>
                    <Row justify="center" gutter={10} align="middle">
                        <Col>
                            <Checkbox checked={isEmptyFilter} onChange={(e: CheckboxChangeEvent) => setIsEmptyFilter(e.target.checked)}>
                                Empty Filter
                            </Checkbox>
                        </Col>
                        <Col>
                            <Checkbox checked={isConfirmChangeFilter} onChange={(e: CheckboxChangeEvent) => setIsConfirmChangeFilter(e.target.checked)}>
                                <Avatar size={18} style={{background: "red"}}>
                                    C
                                </Avatar>
                                &nbsp; Confirm change Filter
                            </Checkbox>
                        </Col>
                        <Col>
                            <Checkbox checked={isNewFilter} onChange={(e: CheckboxChangeEvent) => setIsNewFilter(e.target.checked)}>
                                <Avatar size={18} style={{background: "green"}}>
                                    N
                                </Avatar>
                                &nbsp; New Key Filter
                            </Checkbox>
                        </Col>
                    </Row>
                </Col>
                <Col>
                    <Row gutter={20} style={{padding: "0 20px"}}>
                        <Col>
                            <Button type="primary" onClick={() => openLanguageModal()}>
                                Import
                            </Button>
                        </Col>
                        <Col>
                            <Button
                                disabled={!hasImported}
                                type="primary"
                                danger
                                onClick={() => {
                                    columns.forEach(column => exportJSON(column));
                                }}
                            >
                                Export
                            </Button>
                        </Col>
                        <Col>
                            <Button disabled={!hasImported} type="ghost" onClick={() => location.reload()}>
                                Reset
                            </Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Table size="small" bordered pagination={false} rowKey={record => record.title} columns={tableColumns} dataSource={dataSource} />
            <LanguageSelectModal />
        </div>
    );
};

const mapStatsToProps = (state: RootState) => {
    const {mergeLanguageList, columns} = state.app.home;
    const hasImported = !!Object.keys(mergeLanguageList).length;
    return {
        mergeLanguageList,
        columns,
        hasImported,
    };
};
const mapDispatchToProps = (dispatch: Dispatch) => ({
    openLanguageModal: () => dispatch(actions.changeModalVisible(true)),
    exportJSON: (columnName?: LanguageType) => dispatch(actions.exportJSON(columnName)),
    cacheEditData: (column: LanguageType, key: string, value?: string) => dispatch(actions.cacheEditData(column, key, value))
});

export default connect(mapStatsToProps, mapDispatchToProps)(Welcome);
