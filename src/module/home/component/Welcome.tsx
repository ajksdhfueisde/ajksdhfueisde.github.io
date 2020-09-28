import {Button, Col, Row, Table, Tooltip, Typography, Upload, Modal} from "antd";
import {CloseOutlined} from "@ant-design/icons";
import {ColumnProps} from "antd/lib/table";
import React, {useState, useEffect} from "react";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {RootState} from "type/state";
import {actions} from "../index";

import "./welcome.css";

interface Props {
    languageList: any[];
    mergeLanguageList: any[];
    columns: string[];
    hasImported: boolean;
    importJSON: (file?: File) => void;
    exportJSON: (columnName?: string) => void;
}

const Welcome: React.FC<Props> = ({hasImported, mergeLanguageList, columns, importJSON, exportJSON}) => {
    const [editLanguageList, setEditLanguageList] = useState<any[]>([]);
    useEffect(() => {
        if (mergeLanguageList && mergeLanguageList.length > 0) {
            setEditLanguageList([...mergeLanguageList]);
        }
    }, [mergeLanguageList]);
    // const editLanguageList = mergeLanguageList;
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
            render: (value, record) => {
                return (
                    <Tooltip placement="topLeft" title={value}>
                        {value}
                    </Tooltip>
                );
            },
        },
    ];
    const setValue = (title: string, column: string, value = "") => {
        setEditLanguageList(
            editLanguageList.map(lang => {
                if (lang.title === title) {
                    const result = {...lang, [column]: value};
                    return result;
                }
                return lang;
            })
        );
    };
    columns.forEach(column => {
        tableColumns.push({
            title: () => {
                const emptyNum = editLanguageList.map(lang => lang[column]).filter(item => !item).length;
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
            render: (value, record) => {
                const isEmpty = !(value && value.trim());
                const originalValue = mergeLanguageList.filter(lang => lang.title === record.title)[0];
                const isEdited = (originalValue && originalValue[column]) !== value;
                return (
                    <Tooltip placement="topLeft" title={value}>
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
                    <Row gutter={20} style={{padding: "0 20px"}}>
                        <Col>
                            <Upload
                                action=""
                                accept=".json"
                                showUploadList={false}
                                beforeUpload={file => {
                                    if (file) {
                                        Modal.confirm({
                                            content: "Import new json will reset existed!",
                                            onOk() {
                                                importJSON(file);
                                            },
                                            onCancel() {
                                                return false;
                                            },
                                        });
                                    }
                                    return false;
                                }}
                            >
                                <Button type="primary">Import</Button>
                            </Upload>
                        </Col>
                        <Col>
                            <Button disabled={!hasImported} type="primary" danger onClick={() => exportJSON()}>
                                Export
                            </Button>
                        </Col>
                        <Col>
                            <Button disabled={!hasImported} type="ghost">
                                Reset
                            </Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Table
                size="small"
                bordered
                pagination={false}
                rowKey={record => record.title}
                columns={tableColumns}
                dataSource={editLanguageList.map(item => {
                    return {...item, key: item.title};
                })}
            />
        </div>
    );
};

const mapStatsToProps = (state: RootState) => {
    const {mergeLanguageList, languageList, columns} = state.app.home;
    const hasImported = !!mergeLanguageList.length;
    return {
        mergeLanguageList,
        languageList,
        columns,
        hasImported,
    };
};
const mapDispatchToProps = (dispatch: Dispatch) => ({
    importJSON: (file?: File) => dispatch(actions.importJSON(file)),
    exportJSON: (columnName?: string) => dispatch(actions.exportJSON(columnName)),
});

export default connect(mapStatsToProps, mapDispatchToProps)(Welcome);
