import { Space, Spin, TableColumnsType, Tag, Tooltip, Row, Col, Badge, Typography } from "antd";
import { filter, map } from "lodash";
import moment from "moment";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { DataTable } from "~/Components";
import { Icon } from "@iconify/react";
import { useNotification } from "~/Hooks/useNotification";
import { get } from "~/Services";
import { currencyFormat } from "~/Utils/CurrencyFormatter";
import { ContractTable } from "@modules/Contracts/SubModules/Drilldown/OverView/Components/ContractTable";
import { useQuery } from "~/Hooks/useQuery";
import { contractType } from "@utils/StringConstants";
import { strings } from "@utils/Strings";

import styles from "./index.module.scss";
import { TooltipLayout } from "~/Components/Chart/TooltipLayout";
import { ContractTooltip } from "~/Components/ContractTooltip/ContractTooltip";

interface Props {
  id: string;
  height: number;
}

interface Contract {
  applicationId: string;
  applicationLogo: string;
  applicationName: string;
  contractId: string;
  contractName: string;
  currency: string;
  departmentName: string;
  licenseQuantity: number;
  providerLogo: string;
  providerName: string;
  adminCost: number;
}

export const Contracts = ({ id, height }: Props) => {
  const [contractList, setContracts] = useState<Contract[]>([]);
  const query = useQuery();
  const columns: TableColumnsType = [
    {
      dataIndex: "contractName",
      title: "Name",
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      render: (value: string, record: any) => (
        <Row>
          <Col span={2}>
            <Tooltip
              style={{ paddingBottom: -100 }}
              title={record.contractStatus}
              placement="top"
            >
              <Badge
                className={styles.antBadge}
                color={(() => {
                  switch (record.contractStatus) {
                    case "Active":
                      return styles.secondaryGreen;
                    case "InActive":
                      return styles.gray;
                    default:
                      return styles.secondaryRed;
                  }
                })()}
              />
            </Tooltip>
          </Col>
          <Col span={22}>
            <Space direction="vertical">
              <Typography.Text>{value}</Typography.Text>
              {record.contractType && <Tag color={styles.primary}>{record.contractType}</Tag>}
            </Space>
          </Col>
        </Row>
      ),
    },
    {
      dataIndex: "contractStartDate",
      title: "Start Date",
      render: (value) => value && moment(value, "YYYY-MM-DD").format("DD MMM YYYY"),
      sorter: (a: any, b: any) => (moment(a.contractStartDate).isBefore(moment(b.contractStartDate)) ? -1 : 1),
    },
    {
      dataIndex: "contractEndDate",
      title: "End Date",
      render: (value: any) => value && moment(value, "YYYY-MM-DD").format("DD MMM YYYY"),
      sorter: (a: any, b: any) => (moment(a.contractEndDate).isBefore(moment(b.contractEndDate)) ? -1 : 1),
    },
    {
      dataIndex: "totalCost",
      title: "Total Cost",
      className: "is-currency",
      sorter: (a: any, b: any) => a.totalCost - b.totalCost,
      defaultSortOrder: "descend",
      render: (val: any, record: any) => {
        return (
          <div>
            {currencyFormat(record.adminCost, true)} {"  "}
            <ContractTooltip children={currencyFormat(val, false, record.currencyCode)} />
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    if (query && query.get("activeTab") === "contracts") {
      get(`v1/application/contract/list?applicationId=${id}`).then((res: any) => {
        if (res && res.response.data) {
          setContracts(res.response.data);
        }
      });
    }
  }, [query]);
  return (
    <DataTable
      className="table-clickable"
      exportFileName="Application Contracts"
      exportOverrideColumns={[{ dataIndex: "totalCost", newDataIndex: "adminCost", isAdmin: true }]}
      key={query.get("activeTab")}
      columns={columns}
      height={height - 80}
      expandable
      expandRenderer={(value) => (
        <ExpandedView
          value={value as Contract}
          key={value.key}
        />
      )}
      tableData={map(contractList, (c) => ({ ...c, key: c.contractId }))}
    />
  );
};

const CenterEl = styled.div`
  min-height: 200px;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ExpandedView = ({ value }: { value: Contract }) => {
  const [contractData, setContractData] = useState<{ [key in string]: any }>({});
  const [modalContent, setModalContent] = useState<any>(null);
  const { openToast } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const getRecords = () => {
    setIsLoading(true);
    get(`v1/application/contract/overview?contractId=${value.contractId}`)
      .then((res: any) => {
        if (res.status === "OK") {
          const {
            response: { data },
          } = res;
          setContractData(data);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  };
  useEffect(() => {
    getRecords();
  }, []);
  return (
    <div>
      {isLoading ? (
        <CenterEl>
          <Spin />
        </CenterEl>
      ) : (
        <ContractTable
          contract={contractData}
          withoutWrapper
          isLicenseMapping
        />
      )}
    </div>
  );
};
