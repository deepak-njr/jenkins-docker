import {
  Button,
  Col,
  ConfigProvider,
  Dropdown,
  Empty,
  Grid,
  Input,
  Menu,
  Row,
  Space,
  Table,
  TableColumnsType,
  Typography,
} from "antd";
import { ReactNode, useEffect, useState } from "react";
import { filter, includes, isEmpty, isObject, keys, map, omit, pick } from "lodash";

import { CSVLink } from "react-csv";
import { Icon } from "@iconify/react";
import { SizeType } from "antd/lib/config-provider/SizeContext";
import { columnWidth } from "./Properties";
import { currencyFormat } from "~/Utils/CurrencyFormatter";
import styles from "./index.module.scss";
import { useQuery } from "~/Hooks/useQuery";
import { useSearchParams } from "react-router-dom";
import vars from "@styles/variables.module.scss";
import moment from "moment";

interface Props {
  tableData: { [key in string]: any }[];
  columns: TableColumnsType;
  tableActions?: {
    items: {
      label: string | ReactNode;
      key: string;
    }[];
    callback: (key: string, record: { [key in string]: string }) => void;
  };
  isLoading?: boolean;
  bulkDelete?: (value: React.Key[]) => void;
  selectedItems?: (value: React.Key[]) => void;
  exportFileName?: string;
  showSelection?: string;
  hideExport?: boolean;
  height?: number;
  onClick?: (record: { [key in string]: any }) => void;
  multiSelect?: boolean;
  showTopBar?: boolean;
  searchQuery?: string;
  clearSearch?: () => void;
  additionalCTA?: ReactNode;
  additionalSearchCols?: any;
  noDataText?: string;
  singleDelete?: boolean;
  maxSelection?: number;
  expandable?: boolean;
  expandRenderer?: (values: { [key in string]: any }) => ReactNode;
  className?: string;
  size?: SizeType;
  exportOverrideColumns?: any[];
  exportOverrideDataIndexFields?: any[];
  onSearchChange?: (searchQuery: string, isLoading: boolean) => void;
  isServerSearchApi?: boolean;
  inputDisable?: boolean;
  isPagination?: boolean;
}

const { useBreakpoint } = Grid;
const costColumns = [
  "applicationSpend",
  "totalCost",
  "adminCost",
  "unitPrice",
  "budgets",
  "projctBudget",
  "projectCost",
  "invoiceAmount",
  "dueAmount",
  "projectBudget",
  "projectAdminCost",
  "savingsAmount",
  "annualSavingsAmount",
  "adminCostYTD",
  "adminApplicationSpend",
  "adminCostYtd",
];

const colRenderColumns = ["userLastLogin"];

const ObjColumns = [
  {
    name: "userApplications",
    value: "applicationName",
  },
  {
    name: "contracts",
    value: "contractName",
  },
  {
    name: "resourceTagsArr",
    value: "value",
  },
];

// should be used as reusable component based on the design
export const DataTable = ({
  tableData,
  columns,
  exportOverrideColumns,
  exportOverrideDataIndexFields,
  tableActions,
  isLoading,
  exportFileName,
  bulkDelete,
  selectedItems,
  showSelection,
  hideExport,
  height,
  onClick,
  multiSelect = true,
  showTopBar = true,
  clearSearch,
  searchQuery,
  additionalCTA,
  additionalSearchCols,
  noDataText,
  singleDelete,
  maxSelection,
  expandRenderer,
  expandable,
  className,
  size,
  onSearchChange,
  isServerSearchApi,
  inputDisable,
  isPagination = false,
}: Props) => {
  const paginationOffset = isPagination ? 60 : 0;
  const [data, setData] = useState<Props["tableData"]>([]);
  const [filteredData, setFilteredData] = useState<Props["tableData"]>([]);
  const [searchString, setSearchString] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [tableHeight, setTableHeight] = useState(window.innerHeight - 300 - paginationOffset);
  const query = useQuery();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeExpRow, setActiveExpRow] = useState<any>([]);
  const { md } = useBreakpoint();

  useEffect(() => {
    if (query.get("search")) {
      setSearchString(query.get("search") || searchString);
    }
  }, [query]);

  useEffect(() => {
    if (height) setTableHeight(height);
  }, [height]);

  useEffect(() => {
    setData(tableData);
    setFilteredData(tableData);
  }, [tableData]);

  useEffect(() => {
    if (searchQuery && !isEmpty(searchQuery)) {
      setSearchString(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!isServerSearchApi) {
      if (!isEmpty(searchString)) {
        let cols = columns.map((col: any) => col.dataIndex);
        if (additionalSearchCols) {
          cols = [...cols, ...additionalSearchCols];
        }
        // keys(d)
        let result = filter(
          data,
          (d) =>
            d &&
            cols &&
            cols.some((key) => {
              return String(d[key]).toLowerCase().includes(searchString.toLowerCase());
            })
        );
        setFilteredData(result);
      } else {
        setFilteredData(data);
      }
    }
  }, [searchString, data]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    if (maxSelection && maxSelection < newSelectedRowKeys.length) {
      return;
    } else {
      setSelectedRowKeys(newSelectedRowKeys);
      selectedItems && selectedItems(newSelectedRowKeys);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const getActionCol = () => {
    if (tableActions) {
      return [
        {
          title: " ",
          dataIndex: " ",
          width: 30,
          render: (value: any, record: any) => (
            <Dropdown
              overlay={
                <Menu
                  onClick={({ key }) => tableActions && tableActions.callback(key, record)}
                  items={tableActions.items}
                />
              }
              trigger={["click"]}
              placement="bottomLeft"
            >
              <Icon
                icon={"bi:three-dots-vertical"}
                style={{ cursor: "pointer" }}
              />
            </Dropdown>
          ),
          fixed: "right",
        },
      ] as any;
    }
    return [] as any;
  };

  const getExportData = () => {
    const displayColumns = columns.map((col: any) => {
      let dataIndex: any = col.dataIndex;
      if (exportOverrideDataIndexFields) {
        let field = exportOverrideDataIndexFields.find((d: any) => d.currentField === col.dataIndex);
        if (field) {
          dataIndex = field.newField;
        }
      }
      return {
        dataIndex: dataIndex,
        displayName: col.title,
        render: col.render && col.render,
      };
    });

    return map(
      selectedRowKeys.length > 0 ? filter(tableData, (data) => selectedRowKeys.includes(data.key)) : tableData,
      (row) => {
        const modifiedRow: { [key: string]: any } = {};

        displayColumns.forEach((col) => {
          const isCurrency = costColumns.includes(col.dataIndex);
          const isObjColumn = ObjColumns.map((obj: any) => obj.name).includes(col.dataIndex);
          const filteredObjColProps = isObjColumn && ObjColumns.filter((obj: any) => obj.name === col.dataIndex)[0];

          const displayColumTitle = col.displayName;
          const dataIndexArr = col.dataIndex.split(".");

          let value: any = row;
          dataIndexArr.forEach((index: any) => {
            value = value?.[index];
          });

          // modifiedRow[displayColumTitle] = isCurrency
          //   ? currencyFormat(value, false, row.currency)
          //   : isObjColumn && Array.isArray(value)
          //   ? filteredObjColProps
          //     ? value.map((item: any) => item[filteredObjColProps.value]).join(",")
          //     : ""
          //   : value;

          let newValue = "";
          if (col.dataIndex === "saaspeLastLogin") {
            const date = value !== null ? new Date(value) : null;
            value = date !== null ? moment(date).format("DD MMM YYYY") : "-";
          }
          if (isCurrency) {
            if (exportOverrideColumns) {
              let newFieldRef = exportOverrideColumns.find((item: any) => item.dataIndex === col.dataIndex);
              if (newFieldRef) {
                if (newFieldRef.isAdmin) {
                  newValue = currencyFormat(row[newFieldRef.newDataIndex], true);
                } else {
                  newValue = currencyFormat(row[newFieldRef.newDataIndex], false, row.currency);
                }
              } else {
                newValue = col.render(value, row);
              }
            } else {
              newValue = col.render(value, row);
            }
          } else if (value && colRenderColumns.includes(col.dataIndex)) {
            newValue = col.render(value, row);
          } else {
            if (isObjColumn && Array.isArray(value)) {
              if (filteredObjColProps) {
                newValue = value.map((item: any) => item[filteredObjColProps.value]).join(",");
              } else {
                newValue = "";
              }
            } else {
              newValue = value;
            }
          }
          modifiedRow[displayColumTitle] = newValue;
        });

        return modifiedRow;
      }
    );
  };

  const customizeRenderEmpty = () => (
    <Empty
      style={{ textAlign: "center" }}
      description={noDataText}
      image={Empty.PRESENTED_IMAGE_SIMPLE}
    />
  );

  const handleSearchChange = (value: string) => {
    setSearchString(value);
    onSearchChange && onSearchChange(value, true);
  };

  return (
    <>
      {showTopBar && (
        <Row
          gutter={16}
          style={{ marginBottom: vars.whitespace2 }}
        >
          <Col span={8}>
            <Input
              disabled={inputDisable}
              placeholder="Search"
              value={searchString}
              onChange={(e) => handleSearchChange(e.target.value)}
              suffix={
                searchString ? (
                  <Icon
                    icon="humbleicons:times"
                    height="20"
                    onClick={() => {
                      handleSearchChange("");
                      if (clearSearch) {
                        clearSearch();
                      }
                      if (query.get("search")) {
                        searchParams.delete("search");
                        setSearchParams(searchParams);
                      }
                    }}
                    style={{
                      margin: "auto",
                      color: vars.strawberry,
                      cursor: "pointer",
                    }}
                  />
                ) : (
                  <Icon
                    icon="eva:search-outline"
                    height="20"
                    style={{ margin: "auto", color: vars.strawberry }}
                  />
                )
              }
            />
          </Col>
          <Col
            span={6}
            style={{
              display: "inline-flex",
              justifyContent: "end",
              marginLeft: "auto",
            }}
          >
            <div className={styles.ActionWrapper}>
              {additionalCTA && additionalCTA}
              {!hideExport && (
                <CSVLink
                  data={getExportData()}
                  filename={exportFileName ? `${exportFileName}.csv` : "export.csv"}
                >
                  <Button
                    type="primary"
                    ghost
                    disabled={multiSelect && selectedRowKeys.length <= 0}
                    onClick={getExportData}
                  >
                    <Space>
                      <Icon
                        icon="bi:upload"
                        inline
                      />{" "}
                      Export
                    </Space>
                  </Button>
                </CSVLink>
              )}
              {bulkDelete && (
                <Button
                  type="ghost"
                  danger
                  disabled={selectedRowKeys.length === 0}
                  onClick={() => bulkDelete && bulkDelete(selectedRowKeys)}
                >
                  <Space>
                    <Icon
                      icon="fluent:delete-48-regular"
                      inline
                      fontSize={16}
                    />
                    Delete
                  </Space>
                </Button>
              )}
            </div>
          </Col>
        </Row>
      )}
      <Col
        span={12}
        style={{
          display: "inline-flex",
          justifyContent: "end",
          marginLeft: "auto",
        }}
      >
        {showSelection && (
          <Typography.Text ellipsis>
            <span>{`${selectedRowKeys?.length} of ${showSelection}`}</span>
          </Typography.Text>
        )}
        {/* <Button>{data.length} {selectedRowKeys?.length}</Button> */}
      </Col>
      <ConfigProvider renderEmpty={noDataText ? customizeRenderEmpty : undefined}>
        <Table
          {...(className && { className })}
          loading={isLoading}
          dataSource={map(filteredData, (item, i) => ({
            ...item,
            key: item.key || i,
          }))}
          rowClassName={(record, index) => {
            if (index === filteredData.length - 1) {
              return styles.lastRow;
            }
            return "";
          }}
          columns={[
            Table.EXPAND_COLUMN,
            ...columns.map((column) => {
              return {
                ...column,
                ...(column.fixed && !md && { fixed: false }),
                ...(column.width ? { width: column.width } : { width: columnWidth.GENERAL }),
                ...(onClick && {
                  onCell: (record: any) => ({ onClick: () => onClick(record) }),
                }),
                showSorterTooltip: false,
              };
            }),
            ...getActionCol(),
          ]}
          {...(expandable &&
            expandRenderer && {
              expandable: {
                expandIcon: ({ expanded, onExpand, record }) => (
                  <Button
                    type="link"
                    style={{ padding: 0 }}
                    onClick={(e) => onExpand(record, e)}
                  >
                    <Icon
                      fontSize={20}
                      icon={`${expanded ? "material-symbols:expand-less-rounded" : "material-symbols:expand-more"}`}
                    />
                  </Button>
                ),
                expandedRowRender: expandRenderer,
              },
            })}
          {...(expandable &&
            expandRenderer && {
              expandable: {
                expandedRowKeys: activeExpRow,
                onExpand: (expanded, record) => {
                  const keys = [];
                  if (expanded) {
                    keys.push(record.key);
                  }
                  setActiveExpRow(keys);
                },
                expandIcon: ({ expanded, onExpand, record }) =>
                  expanded ? (
                    <Button
                      onClick={(e) => onExpand(record, e)}
                      type="link"
                      style={{ padding: 0 }}
                    >
                      <Icon
                        icon="ic:baseline-keyboard-arrow-up"
                        fontSize={24}
                      />
                    </Button>
                  ) : (
                    <Button
                      onClick={(e) => onExpand(record, e)}
                      type="link"
                      style={{ padding: 0 }}
                    >
                      <Icon
                        icon="ic:outline-keyboard-arrow-down"
                        fontSize={24}
                      />
                    </Button>
                  ),
                expandedRowRender: expandRenderer,
              },
            })}
          {...(size && { size })}
          scroll={{ y: tableHeight - 48 }}
          pagination={false}
          {...(multiSelect && {
            rowSelection: rowSelection,
          })}
        />
      </ConfigProvider>
    </>
  );
};
