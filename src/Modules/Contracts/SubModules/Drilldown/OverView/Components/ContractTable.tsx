import styles from "@styles/variables.module.scss";
import { Icon } from "@iconify/react";
import { WrapperCard, DataTable } from "~/Components";
import { useNavigate } from "react-router-dom";
import { Col, Row, Typography, Space, Badge, Tooltip } from "antd";
import { map } from "lodash";
import { imageKey, currencyFormat } from "~/Utils";
import moment from "moment";
import { columnWidth } from "~/Components/DataTable/Properties";
import { useHasAccess } from "~/Hooks/useHasAccess";
import { permissions } from "~/Utils/Roles";
import { ReactNode } from "react";
import { walletIcons } from "~/Utils/getWalletIcons";
import { contractType } from "@utils/StringConstants";
import { strings } from "@utils/Strings";
import { TooltipLayout } from "~/Components/Chart/TooltipLayout";
import { ContractTooltip } from "~/Components/ContractTooltip/ContractTooltip";

export const ContractTable = ({
  contract,
  withoutWrapper,
  isLicenseMapping,
  mapLicense,
  showContractType,
  showLicenceOnly,
}: {
  contract: any;
  showContractType?: boolean;
  withoutWrapper?: boolean;
  isLicenseMapping?: boolean;
  showLicenceOnly?: boolean;
  mapLicense?: (value: { [key in string]: any }) => ReactNode;
}) => {
  const navigate = useNavigate();
  const { hasPermissions } = useHasAccess();
  const getItemText = (name: string, value: any) => {
    return (
      <Space
        direction="vertical"
        style={{ marginBottom: styles.whitespace4 }}
      >
        <Typography.Text type="secondary">{name}</Typography.Text>
        <Typography.Text>{value}</Typography.Text>
      </Space>
    );
  };

  const Item = (
    <>
      {!showLicenceOnly && (
        <Row>
          {showContractType && (
            <Col
              xs={24}
              md={6}
            >
              {getItemText("Contract Type", contract.contractType)}
            </Col>
          )}
          <Col
            xs={24}
            md={6}
          >
            {getItemText("Contract Name", contract.contractName)}
          </Col>
          {contract.contractTenure && (
            <Col
              xs={24}
              md={6}
            >
              {getItemText(
                "Contract Tenure",
                isNaN(contract.contractTenure) ? contract.contractTenure : `${contract.contractTenure} Year(s)`
              )}
            </Col>
          )}
          <Col
            xs={24}
            md={6}
          >
            {getItemText("Start Date", moment(contract.contractStartDate, "YYYY-MM-DD").format("DD MMM YYYY"))}
          </Col>
          <Col
            xs={24}
            md={6}
          >
            {getItemText("End Date", moment(contract.contractEndDate, "YYYY-MM-DD").format("DD MMM YYYY"))}
          </Col>
          {contract.autoRenewal && (
            <Col
              xs={24}
              md={6}
            >
              {getItemText(
                "Next Renewal Date",
                moment(contract.upcomingRenewalDate, "YYYY-MM-DD").format("DD MMM YYYY")
              )}
            </Col>
          )}
          {contract.billingFrequency && (
            <Col
              xs={24}
              md={6}
            >
              {getItemText("Billing Frequency", contract.billingFrequency)}
            </Col>
          )}
          <Col
            xs={24}
            md={6}
          >
            {getItemText("Auto Renewal", contract.autoRenewal ? "Enabled" : "Disabled")}
          </Col>
          {contract.autoRenewalCancellation && (
            <Col
              xs={24}
              md={6}
            >
              {getItemText("Cancellation Notice", `${contract.autoRenewalCancellation} day(s)`)}
            </Col>
          )}
          {contract.autoRenewal && contract.paymentMethod && contract.paymentMethod == "Credit / Debit Card" && (
            <>
              <Col
                xs={24}
                md={6}
              >
                {getItemText("Card Holder Name", contract.cardHolderName || "")}
              </Col>
              <Col
                xs={24}
                md={6}
              >
                {getItemText(
                  "Card Number",
                  `**** **** **** ${contract.cardNumber && String(contract.cardNumber).slice(-4)}` || ""
                )}
              </Col>
              <Col
                xs={24}
                md={6}
              >
                {getItemText("Valid Through", contract.validThrough || "")}
              </Col>
            </>
          )}
          {contract.autoRenewal && contract.paymentMethod && contract.paymentMethod == "wallet" && (
            <Col
              xs={24}
              md={6}
            >
              {getItemText(
                "Wallet Name",
                <Space direction="horizontal">
                  {walletIcons(contract.walletName)}
                  {contract.walletName || ""}
                </Space>
              )}
            </Col>
          )}
        </Row>
      )}
      <Row>
        {!showLicenceOnly && (
          <Col span={24}>
            <Typography.Title
              level={5}
              style={{ display: "flex" }}
            >
              Product Details
            </Typography.Title>
          </Col>
        )}
        <Col span={24}>
          <DataTable
            height={contract.products?.length * 40 + 100 < 400 ? contract.products.length * 80 + 100 : 400}
            multiSelect={false}
            tableData={map(contract.products, (license, i) => ({
              ...license,
              key: i,
            }))}
            columns={[
              {
                key: "name",
                dataIndex: "productName",
                title: "Product Name",
              },
              {
                key: "type",
                dataIndex: "productType",
                title: "Product Type",
              },
              {
                key: "quantity",
                dataIndex: "quantity",
                title: "Quantity",
              },
              {
                key: "costPerLicense",
                dataIndex: "unitPrice",
                className: "is-currency",
                title: "Unit Price",
                width: 200,
                render: (val: any, record: any) => {
                  return (
                    <div>
                      {record.adminCost ? (
                        currencyFormat(val, true) + " " + record.unitPriceType
                      ) : contract.currencyCode ? (
                        <>
                          {currencyFormat(record.unitPrice, false, contract.currencyCode, "standard") +
                            " " +
                            record.unitPriceType}
                        </>
                      ) : (
                        <>{`${currencyFormat(record.unitPrice, false, record.currencyCode, "standard")} ${
                          record.unitPriceType
                        }`}</>
                      )}
                    </div>
                  );
                },
              },
              {
                key: "totalCost",
                dataIndex: "totalCost",
                className: "is-currency",
                title: "Total Cost",
                render: (val: any, record: any) => {
                  return (
                    <>
                      {record.adminCost ? (
                        <>
                          {currencyFormat(record.adminCost, true)} {"  "}
                          <ContractTooltip
                            children={currencyFormat(record.totalCost, false, contract.currencyCode, "standard")}
                          />
                        </>
                      ) : contract.currencyCode ? (
                        <>{currencyFormat(record.totalCost, false, contract.currencyCode, "standard")}</>
                      ) : (
                        <>{currencyFormat(record.totalCost, false, record.currencyCode, "standard")}</>
                      )}
                    </>
                  );
                },
              },
            ]}
            showTopBar={false}
          />
        </Col>
      </Row>
    </>
  );
  return withoutWrapper ? (
    Item
  ) : (
    <WrapperCard
      title={"Contract Details"}
      smallHeader
    >
      {Item}
    </WrapperCard>
  );
};
