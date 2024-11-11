import { ContentWrapper, PDFViewer, StripeCheckout } from "@components/index";

import { Space, Typography, Avatar, Button, TableColumnsType, Modal, Row, Col, Image } from "antd";
import { useEffect, useState } from "react";
import { DataTable } from "@components/index";
import { imageKey, stripeEnabled } from "@utils/Constants";
import { currencyFormat } from "~/Utils";
import { useQuery } from "~/Hooks/useQuery";
import { useNotification } from "~/Hooks/useNotification";
import { useNavigate, useSearchParams } from "react-router-dom";
import { get, remove } from "~/Services/api.service";
import { useHasAccess } from "~/Hooks/useHasAccess";
import { permissions, Roles } from "~/Utils/Roles";
import { Icon } from "@iconify/react";
import DeleteInfoGraphic from "@assets/SVG/deleteConfirmation.svg";
import { filter, map } from "lodash";

import styles from "@styles/variables.module.scss";

const { confirm } = Modal;

export const Invoices = () => {
  const [data, setData] = useState<any>([]);
  const { hasRole, hasPermissions } = useHasAccess();
  const [isLoading, setIsLoading] = useState(false);
  const query = useQuery();
  const [showCheckout, setShowCheckout] = useState("");
  const { openToast, openNotification } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState("");
  const [showInvoice, setShowInvoice] = useState("");
  const [invoiceUrl, setInvoiceURL] = useState("");
  const navigate = useNavigate();

  const getInvoices = () => {
    setIsLoading(true);
    get("v1/invoice/list-view ")
      .then((res: any) => {
        setData(res.response.data);
        // if (res.status === "OK") {

        // }
        setIsLoading(false);
      })
      .catch((err:any) => {
        setIsLoading(false);
      });
  };
  useEffect(() => {
    getInvoices();
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
      title: "Invoice Number",
      dataIndex: "invoiceNumber",
      width: 100,
      sorter: (a: any, b: any) => (a.invoiceNumber || "").localeCompare(b.invoiceNumber || ""),
      render: (value: any) => value || <Typography.Text disabled>-</Typography.Text>,
    },
    {
      title: "Subcription Id",
      dataIndex: "subscriptionNumber",
      width: 100,
      sorter: (a: any, b: any) => (a.subscriptionNumber || "").localeCompare(b.subscriptionNumber || ""),
      render: (value: any, record: any) => (value ? value : <Typography.Text disabled>-</Typography.Text>),
    },
    {
      title: "Subcription Name",
      dataIndex: "subscriptionName",
      sorter: (a: any, b: any) => (a.subscriptionName || "").localeCompare(b.subscriptionName || ""),
      render: (value: any, record: any) => (value ? value : <Typography.Text disabled>-</Typography.Text>),
    },
    {
      title: "Application Name",
      dataIndex: "applicationName",
      sorter: (a: any, b: any) => (a.applicationName || "").localeCompare(b.applicationName || ""),
      render: (value: any, record: any) =>
        value ? (
          <Typography.Text>
            <Space>
              <Avatar
                src={record.applicationLogo && `${record.applicationLogo}${imageKey}`}
                icon={!record.applicationLogo && record.applicationLogo && value.slice(0, 2).toUpperCase()}
                shape="square"
              />
              {value}
            </Space>
          </Typography.Text>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
    },
    {
      title: "Amount",
      dataIndex: "invoiceAmount",
      className: "is-currency",
      sorter: (a: any, b: any) => a.invoiceAmount - b.invoiceAmount,
      width: 100,
      render: (value: any, record: any) =>
        !isNaN(value) ? (
          currencyFormat(value || 0, false, record.currency)
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      ellipsis: true,
    },
    {
      title: "Due",
      dataIndex: "dueAmount",
      className: "is-currency",
      width: 100,
      sorter: (a: any, b: any) => a.dueAmount - b.dueAmount,
      render: (value: any, record: any) =>
        !isNaN(value) ? (
          currencyFormat(value || 0, false, record.currency)
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      ellipsis: true,
    },
    {
      title: "",
      dataIndex: "",
      render: (value: any, record: any) => (
        <Space>
          <Button
            size="small"
            type="primary"
            disabled={record.dueAmount < 1 || !record.invoicePayable}
            onClick={() => setShowCheckout(record.invoiceNumber)}
          >
            Pay Now
          </Button>
          {record.invoiceUrl[0] && (
            <Button
              size="small"
              type="default"
              target={"_blank"}
              onClick={() => {
                setInvoiceURL(`${record.invoiceUrl[0]}${imageKey}`);
                setShowInvoice(record.invoiceNumber);
              }}
            >
              View Invoice
            </Button>
          )}
        </Space>
      ),
      ellipsis: true,
    },
  ];

  const handleDelete = (id: string) => {
    if (!id) return;
    const { invoiceNumber } = filter(data, (d: any) => d.invoiceNumber === id)[0] || { invoiceNumber: "" };
    confirm({
      className: styles.confirmModal,
      title: "",
      icon: "",
      content: (
        <Row
          gutter={16}
          style={{ textAlign: "center" }}
        >
          <Col span={24}>
            <Image
              src={DeleteInfoGraphic}
              preview={false}
            />
          </Col>
          <Col span={24}>
            <Typography.Text>
              Are you sure to delete&nbsp;
              {invoiceNumber}
              &nbsp; Invoice?
            </Typography.Text>
          </Col>
        </Row>
      ),

      onOk() {
        remove(`v1/invoice/remove`, { invoiceId: invoiceNumber }).then((res: any) => {
          if (res) {
            openNotification({
              title: "success",
              message: res.message,
              type: "success",
            });
            getInvoices();
          }
        });
      },
    });
  };

  const menuClick = (key: string, record: { [key in string]: any }) => {
    if (key === "delete") {
      handleDelete(record.key);
    }
  };

  const tableActions = {
    callback: menuClick,
    items: [
      {
        label: (
          <Typography.Text type="danger">
            <Space>
              <Icon
                icon="fluent:delete-48-regular"
                inline
                fontSize={16}
              />
              Delete
            </Space>
          </Typography.Text>
        ),
        key: "delete",
      },
    ],
  };

  return (
    <ContentWrapper
      loading={isLoading}
      title={"Invoices"}
      actionItems={
        hasPermissions([permissions.ADD_INVOICE]) && (
          <Button
            type="primary"
            onClick={() => navigate("/invoices/add")}
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
        columns={columns}
        tableData={data.map((d: any) => ({ ...d, key: d.invoiceNumber }))}
        isLoading={isLoading}
        exportFileName="Invoices"
        {...(hasPermissions([permissions.DELETE_INVOICE]) && {
          tableActions: tableActions,
        })}
      />
      {stripeEnabled && (
        <StripeCheckout
          setShow={(value) => setShowCheckout(value)}
          show={showCheckout}
          paymentFor="Invoice"
          returnURL={window.location.href}
        />
      )}

      <PDFViewer
        show={Boolean(showInvoice)}
        title={"Invoice"}
        subTitle={showInvoice}
        setShow={() => setShowInvoice("")}
        url={invoiceUrl}
      />
    </ContentWrapper>
  );
};
