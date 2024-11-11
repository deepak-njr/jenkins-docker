import {
  Button,
  Col,
  Image,
  Modal,
  Row,
  Space,
  TableColumnsType,
  Typography,
} from "antd";
import { ContentWrapper, DataTable } from "@components/index";
import { filter, map } from "lodash";
import { get, remove } from "@services/api.service";
import { useCallback, useEffect, useState } from "react";

import DeleteInfoGraphic from "@assets/SVG/deleteConfirmation.svg";
import { Icon } from "@iconify/react";
import { columnWidth } from "@components/DataTable/Properties";
import { currencyFormat } from "@utils/CurrencyFormatter";
import { imageKey } from "@utils/Constants";
import { permissions } from "~/Utils/Roles";
import styles from "./Application.module.scss";
import { useHasAccess } from "@hooks/useHasAccess";
import { useNavigate } from "react-router-dom";
import { useNotification } from "@hooks/useNotification";

const { confirm } = Modal;

export const Application = () => {
  const { hasPermissions } = useHasAccess();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>();
  const { openNotification } = useNotification();
  const navigate = useNavigate();

  const getRecords = useCallback(() => {
    setIsLoading(true);
    get("v1/application/list-view")
      .then((res: any) => {
        if (res?.response?.data) {
          setData(res.response.data);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    getRecords();
  }, []);

  const handleDelete = (id: any) => {
    if (!id) return;
    confirm({
      className: styles.confirmModal,
      title: "",
      icon: "",
      content: (
        <Row gutter={16} style={{ textAlign: "center" }}>
          <Col span={24}>
            <Image src={DeleteInfoGraphic} preview={false} />
          </Col>
          <Col span={24}>
            <Typography.Text>
              Are you sure to delete&nbsp;
              {map(id, (itemId, i) => {
                const { applicationName } = filter(
                  data,
                  (d: any) => d.applicationId === itemId
                )[0] || { applicationName: "" };
                if (applicationName) {
                  return (
                    <Typography.Text strong style={{ color: styles.primary }}>
                      {Number(i) > 0 && <>,</>} {applicationName}
                    </Typography.Text>
                  );
                } else {
                  return "";
                }
              })}
              &nbsp; Application?
            </Typography.Text>
          </Col>
        </Row>
      ),

      onOk() {
        remove("v1/application/multiple-remove", {
          applicationIds: id,
        }).then((res: any) => {
          if (res) {
            openNotification({
              title: "success",
              message: "Application deleted successfully",
              type: "success",
            });
            getRecords();
          }
        });
      },
    });
  };

  const menuClick = (key: string, record: { [key in string]: any }) => {
    if (key === "delete") {
      handleDelete([record.applicationId]);
    }
  };
  const columns: TableColumnsType = [
    {
      title: "Applications",
      dataIndex: "applicationName",
      width: columnWidth.APPLICATION_NAME,
      fixed: true,
      render: (value: any, record: any, i: number) =>
        value ? (
          <Typography.Text>
            <Space>
              <span
                className={styles.logo}
                style={{
                  background: `url(${record.applicationLogo}${imageKey})`,
                }}
              ></span>
              {record.applicationName}
            </Space>
          </Typography.Text>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      ellipsis: true,
      sorter: (a: any, b: any) =>
        a.applicationName.localeCompare(b.applicationName),
    },
    {
      title: "Category",
      dataIndex: "applicationCategory",
      width: columnWidth.APPLICATION_CATEGORY,
      render: (value: any) =>
        value && Boolean(value.toString()) ? (
          value
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      ellipsis: true,
      sorter: (a: any, b: any) =>
        a.applicationCategory.localeCompare(b.applicationCategory),
    },
    {
      title: "Department",
      dataIndex: "departmentName",
      ellipsis: true,
      sorter: (a: any, b: any) =>
        a.departmentName.localeCompare(b.departmentName),
      width: columnWidth.DEPARTMENT_NAME,
    },
    {
      title: "Active User Count",
      dataIndex: "applicationActiveUsers",
      render: (value: any) => {
        return !isNaN(value) ? (
          value
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        );
      },
      sorter: (a: any, b: any) =>
        a.applicationActiveUsers - b.applicationActiveUsers,
      width: columnWidth.COUNT,
      ellipsis: true,
    },
    {
      title: "License(s)",
      dataIndex: "applicationLicenses",
      render: (value: any) =>
        !isNaN(value) ? value : <Typography.Text disabled>-</Typography.Text>,
      ellipsis: {
        showTitle: true,
      },
      sorter: (a: any, b: any) => a.applicationLicenses - b.applicationLicenses,
      width: columnWidth.COUNT,
    },
    {
      title: "Contract(s)",
      dataIndex: "applicationContracts",
      render: (value: any) =>
        !isNaN(value) ? value : <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
      sorter: (a: any, b: any) =>
        a.applicationContracts - b.applicationContracts,
      width: columnWidth.COUNT,
    },
    {
      title: "Spend (YTD)",
      dataIndex: "adminCostYtd",
      className:"is-currency",
      render: (value: any) => {
        return !isNaN(value) ? (
          currencyFormat(value || 0, true)
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        );
      },
      sorter: (a: any, b: any) => a.adminCostYtd - b.adminCostYtd,
      ellipsis: true,
      width: columnWidth.COST,
      defaultSortOrder: "descend",
    },
    {
      title: "Total Spend",
      dataIndex: "adminCost",
      className:"is-currency",
      render: (value: any) => {
        return !isNaN(value) ? (
          currencyFormat(value || 0, true)
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        );
      },
      sorter: (a: any, b: any) => a.adminCost - b.adminCost,
      ellipsis: true,
      width: columnWidth.COST,
    },
  ];

  const tableActions = {
    callback: menuClick,
    items: [
      {
        label: (
          <Typography.Text type="danger">
            <Space>
              <Icon icon="fluent:delete-48-regular" inline fontSize={16} />
              Delete
            </Space>
          </Typography.Text>
        ),
        key: "delete",
      },
    ],
  };

  if (!data) return null;

  return (
    <ContentWrapper
      title={"Applications"}
      loading={isLoading}
      actionItems={
        hasPermissions([permissions.ADD_APPLICATION]) && (
          <Button
            type="primary"
            onClick={() =>
              navigate("/applications/onboarding/application-details")
            }
          >
            <Space>
              <Icon icon="akar-icons:plus" inline />
              Add
            </Space>
          </Button>
        )
      }
    >
      <DataTable
        className="table-clickable"
        columns={columns}
        tableData={map(data, (d) => ({ ...d, key: d.applicationId }))}
        {...(hasPermissions([permissions.DELETE_APPLICATION]) && {
          tableActions: tableActions,
          bulkDelete: (e) => handleDelete(e),
        })}
        onClick={(record) =>
          navigate(
            `/applications/${record.key}?activeTab=overview`
          )
        }
        exportFileName="Applications"
      />
    </ContentWrapper>
  );
};
