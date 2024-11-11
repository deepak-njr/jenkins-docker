import { Col, Row, Space, Typography, Spin } from "antd";
import { useEffect, useState } from "react";
import { AreaChart, DataTable, MetricsCard, WrapperCard } from "@components/index";
import moment from "moment";
import { currencyFormat } from "~/Utils";
import styles from "@styles/variables.module.scss";
import { findIndex, isEmpty, isEqual, keys, map } from "lodash";
import { getRandomNumber } from "~/mocks/getRandomNumber";
import { Icon } from "@iconify/react";
import { get } from "~/Services/api.service";
import { useNotification } from "~/Hooks/useNotification";
import { useQuery } from "~/Hooks/useQuery";
import { ActionArea } from "./ActionArea";
import { useParams } from "react-router-dom";
import { TinyBarGraph } from "~/mocks/TinyBarGraph";
import { MultiCloud } from "../../CloudConstants";
import { useAuth } from "~/Hooks/useAuth";

export const AzureForeCast = () => {
  const { user } = useAuth();
  const query = useQuery();
  const { id } = useParams();
  const { openToast } = useNotification();
  const [subscriptionList, setSubscriptionList] = useState<{ subscriptionId: string; subscriptionName: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState("");
  const [detailedForecast, setDetailedForecast] = useState<{ [key in string]: any }[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [overAllData, setOverAllData] = useState<any>([]);
  const [title, setTitle] = useState("");
  const [currency, setCurrency] = useState(user.currency);

  useEffect(() => {
    if (query.get("vendor") === MultiCloud.AZURE && id === "Forecast") {
      setIsSubscriptionLoading(true);
      get("/cloud/subscriptions")
        .then((res: any) => {
          if (res.response.data) {
            setSelectedSubscription(res.response.data[0].subscriptionId);
            setSubscriptionList(res.response.data);
          }
          setIsSubscriptionLoading(false);
        })
        .catch((err) => {
          setIsSubscriptionLoading(false);
          openToast({ content: err, type: "error" });
        });
    }
  }, [query, id]);

  const getForecast = () => {
    if (!selectedSubscription || !startDate || !endDate) return;
    setOverAllData([]);
    setIsLoading(true);
    get(
      `/cloud/forecast?subscriptionId=${selectedSubscription}&startDate=${startDate}&endDate=${endDate}&category=azure`
    )
      .then((res: any) => {
        if (res.response.data) {
          const { data } = res.response;

          const overAllForecast: any = [];
          const detailedForecastItems: any = [];
          let actualCost = 0;
          map(data, (d) => {
            actualCost += d.actualCost;
            setCurrency(d.currency);
            const forecastItem: any = {};
            map(d.forecastData, (forecastData) => {
              forecastItem[`${moment(forecastData.month, "MMMM YYYY").format("MMM YY")}`] = forecastData.cost;

              const index = findIndex(overAllForecast, (item: any) => {
                return isEqual(item.name, forecastData.month);
              });

              if (index !== -1) {
                overAllForecast[index] = {
                  ...overAllForecast[index],
                  ForeCast: overAllForecast[index].ForeCast + forecastData.cost,
                };
              } else {
                if (!forecastData.month) return;
                overAllForecast.push({
                  name: forecastData.month,
                  ForeCast: forecastData.cost,
                });
              }
            });

            detailedForecastItems.push({
              name: d.name,
              ...forecastItem,
            });
          });
          setDetailedForecast(detailedForecastItems);
          setOverAllData(
            overAllForecast.map((item: any) => ({
              ...item,
              name: `${item.name.split(" ")[0].substring(0, 3)} ${item.name.split(" ")[1].substring(2, 4)}`,
              "Actual Spend": actualCost,
            }))
          );
          setIsLoading(false);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        setIsSubscriptionLoading(false);
        openToast({ content: err, type: "error" });
      });
  };

  useEffect(() => {
    if (selectedSubscription && query.get("vendor") === MultiCloud.AZURE && id === "Forecast") {
      getForecast();
    }
  }, [selectedSubscription, query]);

  useEffect(() => {
    if (query.get("vendor") === MultiCloud.AZURE && id === "Forecast") {
      getForecast();
    }
  }, [startDate, endDate]);

  return (
    <Space
      direction="vertical"
      size={"large"}
      style={{ width: "100%" }}
    >
      {!isSubscriptionLoading && (
        <ActionArea
          subscriptionList={subscriptionList}
          setSelectedSubscription={setSelectedSubscription}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          selectedSubscription={selectedSubscription}
          setTitle={setTitle}
        />
      )}

      {isLoading ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            margin: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <>
          {" "}
          <Row gutter={[16, 16]}>
            <Col
              xs={24}
              md={8}
            >
              <MetricsCard
                style={{ height: "100%" }}
                icon={"clarity:dollar-bill-line"}
                iconColor={styles.strawberry}
                title={<span style={{ color: styles.gray }}>{title} </span>}
                totalCount={
                  <span style={{ color: styles.primary }}>
                    {!isEmpty(overAllData) &&
                      currencyFormat(
                        map(overAllData, (d) => d.ForeCast).reduce((a, b) => a + b, 0),
                        false,
                        currency
                      )}
                  </span>
                }
                graph={
                  <Space
                    direction="vertical"
                    style={{ display: "flex" }}
                  >
                    <TinyBarGraph
                      count={currencyFormat(
                        map(overAllData, (d) => d.ForeCast).reduce((a, b) => a + b, 0) - 1892,
                        false,
                        currency
                      )}
                    />
                  </Space>
                }
              />
            </Col>
            <Col
              xs={24}
              md={8}
              style={{ textAlign: "center" }}
            >
              <WrapperCard>
                <Space
                  size={4}
                  direction="vertical"
                >
                  <Typography.Title
                    level={3}
                    style={{ margin: 0 }}
                  >
                    {currencyFormat(
                      map(overAllData, (d) => d.ForeCast).reduce((a, b) => a + b, 0) - 1892,
                      false,
                      currency
                    )}
                  </Typography.Title>
                  <Typography.Text ellipsis>
                    <span style={{ color: styles.secondaryGreen }}>
                      <Icon icon="akar-icons:arrow-up" /> {currencyFormat(1892, false, currency)}
                    </span>
                    &nbsp; greater than{" "}
                    {moment()
                      .subtract(moment(endDate).diff(moment(startDate), "M") + 1, "M")
                      .format("MMM YYYY")}{" "}
                    &nbsp;-&nbsp;
                    {moment().subtract(1, "M").format("MMM YYYY")}
                  </Typography.Text>
                  {/* <Typography.Text strong>
                    (
                    {currencyFormat(
                      (map(overAllData, (d) => d.ForeCast).reduce(
                        (a, b) => a + b
                      ) /
                        Number(moment(endDate).diff(moment(startDate), "M"))) *
                        12,
                      currency,
                      "standard"
                    )}{" "}
                    Total)
                  </Typography.Text> */}
                </Space>
              </WrapperCard>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <WrapperCard title={title}>
                {/* title={activeTimeRange} */}
                {overAllData && (
                  <AreaChart
                    data={overAllData}
                    isCurrency
                    legendPosition="top-right"
                    currencyType={currency}
                    colors={[styles.chartColor4, styles.chartColor5]}
                  />
                )}
              </WrapperCard>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <WrapperCard title={"Detailed forecast"}>
                <div style={{ paddingBlock: 16 }}>
                  <DataTable
                    columns={keys(detailedForecast[0]).map((item) => ({
                      dataIndex: item,
                      title: item === "name" ? "Resource Group" : item,
                      ellipsis: true,
                      ...(item === "name" && {
                        width: 300,
                        sorter: (a: any, b: any) => a.name.localeCompare(b.name),
                        defaultSortOrder: "ascend",
                      }),
                      ...(item !== "name" && {
                        sorter: (a: any, b: any) => a[item] - b[item],
                      }),
                      ...(item === "name" ? null : { className: "is-currency" }),
                      render: (value: any) => (isNaN(value) ? value : currencyFormat(value, false, currency)),
                    }))}
                    tableData={detailedForecast}
                    showTopBar={false}
                    height={400}
                    multiSelect={false}
                  />
                </div>
              </WrapperCard>
            </Col>
          </Row>
        </>
      )}
    </Space>
  );
};
