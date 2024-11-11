import { Button, Space, TableColumnsType, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";

import { AssignUser } from "./AssignUser";
import { ContractTooltip } from "~/Components/ContractTooltip/ContractTooltip";
import { DataTable } from "@components/index";
import { Icon } from "@iconify/react";
import { columnWidth } from "@components/DataTable/Properties";
import { currencyFormat } from "@utils/CurrencyFormatter";
import { get } from "@services/api.service";
import { permissions } from "~/Utils/Roles";
import styles from "@styles/variables.module.scss";
import { useHasAccess } from "~/Hooks/useHasAccess";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@hooks/useQuery";

export const Licenses = ({ id, height }: { id: string; height: number }) => {
  const { hasPermissions } = useHasAccess();
  const [data, setData] = useState<any>([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [licenseId, setLicenseId] = useState("");
  const [unmappedLicenses, setUnmappedLicenses] = useState(0);
  const query = useQuery();
  const [openModal, setOpenModal] = useState(false);

  const getRecords = useCallback(() => {
    get(`v1/application/overview?category=license&applicationId=${id}`)
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
    if (query.get("activeTab") === "licenses") {
      getRecords();
      setIsLoading(true);
    }
  }, [getRecords, query]);

  const columns: TableColumnsType = [
    {
      title: "Product Name",
      dataIndex: "productName",
      render: (value: any, record: any, i: number) =>
        value ? (
          <Space
            direction="vertical"
            size={0}
          >
            <Typography.Text>{value}</Typography.Text>
            <Button
              type="link"
              style={{ padding: 0 }}
              onClick={() => navigate(`/contracts/${record.contractId}?activeTab=overview`)}
            >
              Contract Details <Icon icon="akar-icons:arrow-up-right" />
            </Button>
          </Space>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      width: columnWidth.LICENSE_NAME,
      fixed: true,
      ellipsis: true,
      sorter: (a: any, b: any) => a.productName.localeCompare(b.productName),
    },

    {
      title: "Quantity",
      dataIndex: "quantity",
      render: (value: any) => value || <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
      width: columnWidth.COUNT,
      sorter: (a: any, b: any) => a.quantity - b.quantity,
    },

    {
      title: "Mapped Product",
      dataIndex: "mappedLicenses",
      render: (value: any) => value,
      ellipsis: true,
      width: columnWidth.COUNT,
      sorter: (a: any, b: any) => a.mappedLicenses - b.mappedLicenses,
    },
    {
      title: "Unmapped Product",
      dataIndex: "unmappedLicenses",
      render: (value: any) => value,
      ellipsis: true,
      width: columnWidth.COUNT,
      sorter: (a: any, b: any) => a.unmappedLicenses - b.unmappedLicenses,
      defaultSortOrder: "descend",
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      className: "is-currency",
      render: (value: any, record: any) =>
        value ? currencyFormat(record.adminUnitCost, true) : <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
      width: columnWidth.COST,
      sorter: (a: any, b: any) => a.unitPrice - b.unitPrice,
    },
    {
      title: "Total Cost",
      dataIndex: "totalCost",
      className: "is-currency",
      render: (value: any, record: any) =>
        value ? (
          <>
            {currencyFormat(record.adminCost, true)} {"  "}
            <ContractTooltip >
              {currencyFormat(record.totalCost, false, record.currencyCode)}
            </ContractTooltip>
          </>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      ellipsis: true,
      width: columnWidth.COST,
      sorter: (a: any, b: any) => a.totalCost - b.totalCost,
    },

    ...(hasPermissions([permissions.EDIT_APPLICATION])
      ? [
          {
            title: "Action",
            dataIndex: "",
            width: 100,
            render: (_: any, record: any) => (
              <Typography.Text
              onClick={() => {
                setOpenModal(true);
                setLicenseId(record.licenseId);
                setUnmappedLicenses(record.unmappedLicenses);
              }}
              style={{ cursor: "pointer", color: styles.primary }}
            >
              Assign
            </Typography.Text>
            ),
          },
        ]
      : []),
  ];
  if (!data) return null;
  return (
    <>
      <AssignUser
        openModal={openModal}
        setOpenModal={(value) => {
          setOpenModal(value);
        }}
        refreshData={getRecords}
        licenseId={licenseId}
        unmappedLicenses={unmappedLicenses}
      />
      <DataTable
        columns={columns}
        exportOverrideColumns={[
          { dataIndex: "unitPrice", newDataIndex: "adminUnitCost", isAdmin: true },
          { dataIndex: "totalCost", newDataIndex: "adminCost", isAdmin: true },
        ]}
        height={height - 70}
        tableData={data?.map((d: any) => ({ ...d, key: d.contractId }))}
        isLoading={isLoading}
        exportFileName="License Details"
      />
    </>
  );
};
