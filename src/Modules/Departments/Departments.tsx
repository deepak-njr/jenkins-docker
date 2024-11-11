import { Button, Space, TableColumnsType, Typography } from "antd";
import { ContentWrapper, DataTable } from "@components/index";
import { useCallback, useEffect, useState } from "react";

import { Icon } from "@iconify/react";
import {get as _get} from "lodash";
import { columnWidth } from "@components/DataTable/Properties";
import { currencyFormat } from "~/Utils";
import { get } from "@services/api.service";
import { isNumber } from "lodash";
import { permissions } from "~/Utils/Roles";
import { useHasAccess } from "~/Hooks/useHasAccess";
import { useNavigate } from "react-router-dom";

export const Departments = () => {
  const { hasPermissions } = useHasAccess();
  const [data, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const getRecords = useCallback(() => {
    get("v1/department/list")
      .then((res: any) => {
        setData(res.response.data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    getRecords();
    setIsLoading(true);
  }, [getRecords]);

  // const menuClick = (key: string, record: { [key in string]: any }) => {
  //   if (key === "delete") {
  //     confirm({
  //       className: styles.confirmModal,
  //       title: "",
  //       icon: "",
  //       content: (
  //         <Row gutter={16} style={{ textAlign: "center" }}>
  //           <Col span={24}>
  //             <Image src={DeleteInfoGraphic} preview={false} />
  //           </Col>
  //           <Col span={24}>
  //             <Typography.Text>
  //               Are you sure to delete&nbsp;
  //               <Typography.Text strong style={{ color: styles.primary }}>
  //                 {record.departmentName}
  //               </Typography.Text>
  //               &nbsp;Department?
  //             </Typography.Text>
  //           </Col>
  //         </Row>
  //       ),

  //       onOk() {
  //         remove(`v1/user/remove-details/${record.id}`)
  //           .then((res: any) => {
  //             openNotification({
  //               message: "Record Deleted",
  //               title: "Success",
  //               type: "error",
  //             });
  //             getRecords();
  //           })
  //           .catch((err) =>
  //             openToast({
  //               content: err,
  //               type: "error",
  //             })
  //           );
  //       },
  //     });
  //   }
  // };
  const columns: TableColumnsType = [
    {
      title: "Name",
      dataIndex: "departmentName",
      fixed: true,
      render: (value: any) => value || <Typography.Text disabled>-</Typography.Text>,
      width: columnWidth.DEPARTMENT_NAME,
      sorter: (a: any, b: any) => a.departmentName.localeCompare(b.departmentName),
    },
    {
      title: "Owner Email",
      dataIndex: "departmentOwnerEmail",
      render: (value: any) => value || <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
      width: columnWidth.USER_NAME,
      sorter: (a: any, b: any) =>
        a.departmentOwnerEmail &&
        b.departmentOwnerEmail &&
        a.departmentOwnerEmail.localeCompare(b.departmentOwnerEmail),
    },
    {
      title: "No.of Users",
      dataIndex: "noOfUsers",
      render: (value: any) => (isNumber(value) ? value : <Typography.Text disabled>-</Typography.Text>),
      ellipsis: true,
      width: columnWidth.COUNT,
      sorter: (a: any, b: any) => {
        const numA = isNumber(a.noOfUsers) ? a.noOfUsers : Number.MAX_SAFE_INTEGER;
        const numB = isNumber(b.noOfUsers) ? b.noOfUsers : Number.MAX_SAFE_INTEGER;
    
        return numA - numB;
      },
    },
    {
      title: "No.of Applications",
      dataIndex: "noOfApps",
      render: (value: any) => (isNumber(value) ? value : <Typography.Text disabled>-</Typography.Text>),
      ellipsis: true,
      width: columnWidth.COUNT,
      sorter: (a: any, b: any) => a.noOfApps - b.noOfApps,
    },
    {
      title: "Budget",
      dataIndex: "budgets",
      className: "is-currency",
      render: (value: any,  record: any) => (value ? currencyFormat(value, false) : <Typography.Text disabled>-</Typography.Text>),
      ellipsis: true,
      defaultSortOrder: "descend",
      width: columnWidth.COST,
      sorter: (a: any, b: any) => a.budgets && b.budgets && a.budgets - b.budgets,
    },
    {
      title: "Spend (YTD)",
      dataIndex: "adminCostYTD",
      className: "is-currency",
      render: (value: any, record: any) => {
        return !isNaN(value) ? currencyFormat(value || 0, true) : <Typography.Text disabled>-</Typography.Text>;
      },
      sorter: (a: any, b: any) => a.adminCostYTD - b.adminCostYTD,
      ellipsis: true,
      width: columnWidth.COST,
      defaultSortOrder: "descend",
    },
    {
      title: "Total Spend",
      dataIndex: "adminCost",
      className: "is-currency",
      render: (value: any, record: any) =>
        !isNaN(value) ? currencyFormat(value, true) : <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
      defaultSortOrder: "descend",
      width: columnWidth.COST,
      sorter: (a: any, b: any) => a.adminCost - b.adminCost,
    },
  ];

  return (
    <ContentWrapper
      title={"Departments"}
      actionItems={
        hasPermissions([permissions.ADD_DEPARTMENT]) && (
          <Button
            type="primary"
            onClick={() => navigate("/departments/onboarding")}
          >
            <Space>
              <Icon
                icon="akar-icons:plus"
                inline
              />
              Add
            </Space>
          </Button>
        )
      }
    >
      <DataTable
        className="table-clickable"
        columns={columns}
        tableData={data.map((d: any) => ({
          ...d,
          key: d.departmentId,
          departmentOwnerEmail: _get(d, "ownerDetails[0].departmentOwnerEmailAddress", null),
        }))}
        isLoading={isLoading}
        exportFileName="departments"
        onClick={(record) => navigate(`/departments/${record.key}?activeTab=overview`)}
      />
    </ContentWrapper>
  );
};
