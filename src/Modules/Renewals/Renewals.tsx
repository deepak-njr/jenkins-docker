import { ContentWrapper, StripeCheckout } from "@components/index";

import { Typography, Button, Space, Avatar, TableColumnsType } from "antd";
import { useEffect, useState } from "react";
import { DataTable } from "@components/index";
import moment from "moment";
import { get } from "@services/api.service";
import { useQuery } from "~/Hooks/useQuery";
import { useNotification } from "~/Hooks/useNotification";
import { useSearchParams } from "react-router-dom";
import { isNumber } from "lodash";
import { currencyFormat } from "~/Utils/CurrencyFormatter";
import { imageKey, stripeEnabled } from "@utils/Constants";

export const Renewals = () => {
  const [data, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState("");
  const query = useQuery();
  const { openToast } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState("");

  useEffect(() => {
    setIsLoading(true);
    get("/v1/application/subscription/list-view")
      .then((res: any) => {
        if (res.response.data) {
          setData(res.response.data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (paymentStatus) {
      if (paymentStatus === "failed") {
        openToast({ content: "Payment Failed", type: "error" });
      }
      if (paymentStatus === "success") {
        openToast({ content: "Payment Success", type: "success" });
      }
    }
  }, [paymentStatus]);

  useEffect(() => {
    if (query) {
      const redirectStatus = query.get("redirect_status");
      if (redirectStatus) {
        if (redirectStatus === "succeeded") {
          setPaymentStatus("success");
        } else {
          setPaymentStatus("failed");
        }
        searchParams.delete("payment_intent");
        searchParams.delete("payment_intent_client_secret");
        searchParams.delete("redirect_status");

        setSearchParams(searchParams);
      }
    }
  }, [query]);

  const columns: TableColumnsType = [
    {
      title: "Subscription Name",
      dataIndex: "subscriptionName",
      render: (value: any) =>
        value || <Typography.Text disabled>-</Typography.Text>,
      sorter: (a: any, b: any) =>
        (a.subscriptionName || "").localeCompare(b.subscriptionName || ""),
    },
    {
      title: "Contract Name",
      dataIndex: "contractName",
      render: (value: any, record: any) =>
        value ? value : <Typography.Text disabled>-</Typography.Text>,
      sorter: (a: any, b: any) =>
        (a.contractName || "").localeCompare(b.contractName || ""),
    },
    {
      title: "Application Name",
      dataIndex: "applicationName",
      sorter: (a: any, b: any) =>
        (a.applicationName || "").localeCompare(b.applicationName || ""),
      render: (value: any, record: any) =>
        value ? (
          <Typography.Text>
            <Space>
              <Avatar
                src={
                  record.applicationLogo &&
                  `${record.applicationLogo}${imageKey}`
                }
                shape="square"
                icon={
                  !record.applicationLogo &&
                  record.applicationLogo &&
                  value.slice(0, 2).toUpperCase()
                }
              />
              {value}
            </Space>
          </Typography.Text>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
    },
    {
      title: "Next Renewal",
      dataIndex: "upcomingRenewalDate",
      sorter: (a: any, b: any) =>
        Number(new Date(a.upcomingRenewalDate)) -
        Number(new Date(b.upcomingRenewalDate)),
      render: (value: any) =>
        value ? (
          moment(value, "YYYY-MM-DD").format("DD MMM YYYY")
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      ellipsis: true,
    },
    {
      title: "Cost",
      dataIndex: "adminCost",
      defaultSortOrder: "descend",
      className:"is-currency",
      sorter: (a: any, b: any) => a.adminCost - b.adminCost,
      render: (value: any, record: any) =>
        isNumber(value) ? (
          currencyFormat(value, true)
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),

      ellipsis: true,
    },
    {
      title: "",
      dataIndex: "",
      render: (value: any, record: any) => (
        <Button
          size="small"
          type="primary"
          disabled={record.totalCost === 0 || !record.paymentEnable}
          onClick={() => setShowCheckout(record.subscriptionName)}
        >
          Pay Now
        </Button>
      ),
      ellipsis: true,
    },
  ];

  return (
    <ContentWrapper loading={isLoading} title={"Renewals"}>
      <DataTable
        columns={columns}
        tableData={data.map((d: any) => ({ ...d, key: d.contractId }))}
        isLoading={isLoading}
        exportFileName="Renewals"
        additionalSearchCols={["contractId"]}
      />
      {stripeEnabled && (
        <StripeCheckout
          setShow={() => setShowCheckout("")}
          show={showCheckout}
          paymentFor="Subscription"
          returnURL={window.location.href}
        />
      )}
    </ContentWrapper>
  );
};
