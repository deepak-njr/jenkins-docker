import { TableColumnsType, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import { get } from "@services/api.service";
import { DataTable } from "@components/index";
import { useNotification } from "@hooks/useNotification";
import { currencyFormat } from "~/Utils";
import { isNumber } from "lodash";
import { ViewUsers } from "./ViewUsers";

import styles from "@styles/variables.module.scss";

export const Licenses = ({ id }: { id: string }) => {
  const [openModal, setOpenModal] = useState(false);
  const [licenseId, setLicenseId] = useState("");

  const [data, setData] = useState<any>([]);
  const { openToast } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const getRecords = useCallback(() => {
    get(`v1/application/contract/overview?contractId=${id}&category=licenses`)
      .then((res: any) => {
        if (res && res.response.data) {
          setData(res.response.data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        openToast({
          content: err,
          type: "error",
        });
        setIsLoading(false);
      });
  }, []);
  useEffect(() => {
    getRecords();
    setIsLoading(true);
  }, [getRecords]);

  const columns: TableColumnsType = [
    {
      title: "Product Name",
      dataIndex: "productName",
      render: (value: any) => value || <Typography.Text disabled>-</Typography.Text>,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      render: (value: any) => (isNumber(value) ? value : <Typography.Text disabled>-</Typography.Text>),
      ellipsis: true,
    },
    {
      title: "Mapped Product",
      dataIndex: "mappedLicenses",
      render: (value: any) => (isNumber(value) ? value : <Typography.Text disabled>-</Typography.Text>),
      ellipsis: true,
    },
    {
      title: "Unmapped Product",
      dataIndex: "unmappedLicenses",
      render: (value: any) => (isNumber(value) ? value : <Typography.Text disabled>-</Typography.Text>),
      ellipsis: true,
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      className: "is-currency",
      render: (value: any, record: any) =>
        isNumber(value) ? currencyFormat(record.unitPrice, true) : <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
    },
    {
      title: "Cost",
      dataIndex: "totalCost",
      className: "is-currency",
      render: (value: any, record: any) =>
        isNumber(value) ? currencyFormat(record.adminCost, true) : <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
    },
    {
      title: "",
      dataIndex: "",
      render: (value: any, record: any) =>
        record.mappedLicenses === 0 ? (
          <Typography.Text disabled>View Users</Typography.Text>
        ) : (
          <Typography.Text
            disabled
            style={{
              color: styles.primary,
              verticalAlign: "middle",
              cursor: "pointer",
            }}
            strong
            onClick={() => {
              setLicenseId(record.licenseId);
              setOpenModal(true);
            }}
          >
            View Users
          </Typography.Text>
        ),
      ellipsis: true,
    },
  ];

  return (
    <>
      <ViewUsers
        openModal={openModal}
        setOpenModal={(value) => {
          setOpenModal(value);
        }}
        licenceId={licenseId}
      />
      <DataTable
        columns={columns}
        tableData={data.map((d: any) => ({ ...d, key: d.licenseId }))}
        isLoading={isLoading}
        exportFileName="contract-licenses"
      />
    </>
  );
};
