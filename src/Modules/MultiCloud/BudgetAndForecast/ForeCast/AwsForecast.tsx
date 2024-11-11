import { Col, Row, Space, Typography, Spin } from "antd";
import { useEffect, useState } from "react";
import { AreaChart, MetricsCard, WrapperCard } from "@components/index";
import moment from "moment";
import { currencyFormat } from "~/Utils";
import styles from "@styles/variables.module.scss";
import { findIndex, isEmpty, isEqual, map } from "lodash";
import { getRandomNumber } from "~/mocks/getRandomNumber";
import { Icon } from "@iconify/react";
import { useNotification } from "~/Hooks/useNotification";
import { useQuery } from "~/Hooks/useQuery";
import { ActionArea } from "./ActionArea";
import { useParams } from "react-router-dom";
import { get } from "@services/api.service";
import { TinyBarGraph } from "~/mocks/TinyBarGraph";
import { MultiCloud } from "../../CloudConstants";
import { useAuth } from '~/Hooks/useAuth';
import { multiCloudCurrencyCode } from '@utils/Constants';


export const AWSForecast = () => {
  const { user } = useAuth();
  const query = useQuery();
  const { id } = useParams();
  const { openToast } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [detailedForecast, setDetailedForecast] = useState<
    { [key in string]: any }[]
  >([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [overAllData, setOverAllData] = useState<any>([]);
  const [title, setTitle] = useState("");
  const [currency, setCurrency] = useState(user.currency);

  const getForecast = () => {
    if (!startDate || !endDate) return;
    setIsLoading(true);
    get(
      `/cloud/forecast?startDate=${startDate}&endDate=${endDate}&category=aws`
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
              forecastItem[
                `${moment(forecastData.month, "MMMM YYYY").format("MMM YY")}`
              ] = forecastData.cost;

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
              name: `${item.name.split(" ")[0].substring(0, 3)} ${item.name
                .split(" ")[1]
                .substring(2, 4)}`,
              "Actual Spend": actualCost,
            }))
          );
          setIsLoading(false);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        openToast({ content: err, type: "error" });
      });
  };

  useEffect(() => {
    if (query.get("vendor") === MultiCloud.AWS && id === "Forecast") {
      getForecast();
    }
  }, [query]);

  useEffect(() => {
    if (query.get("vendor") === MultiCloud.AWS && id === "Forecast") {
      getForecast();
    }
  }, [startDate, endDate]);
  
  if (!overAllData) return <></>;

  return (
    <Space direction="vertical" size={"large"} style={{ width: "100%" }}>
      <ActionArea
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        setTitle={setTitle}
        />

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
            <Col xs={24} md={8}>
              <MetricsCard
                style={{ height: "100%" }}
                icon={"clarity:dollar-bill-line"}
                iconColor={styles.strawberry}
                title={<span style={{ color: styles.gray }}>{title} </span>}
                totalCount={
                  <span style={{ color: styles.primary }}>
                    {!isEmpty(overAllData) &&
                      currencyFormat(
                        map(overAllData, (d) => d.ForeCast).reduce(
                          (a, b) => a + b
                        ),
                        false,
                        multiCloudCurrencyCode
                      )}{" "}
                  </span>
                }
                graph={
                  <Space direction="vertical" style={{ display: "flex" }}>
                    <TinyBarGraph count={currencyFormat(getRandomNumber(), false, multiCloudCurrencyCode)} />
                  </Space>
                }
              />
            </Col>
            <Col xs={24} md={8} style={{ textAlign: "center" }}>
              <WrapperCard>
                <Space size={4} direction="vertical">
                  <Typography.Title level={3} style={{ margin: 0 }}>
                    {currencyFormat(getRandomNumber(100), false, multiCloudCurrencyCode)}
                  </Typography.Title>
                  <Typography.Text ellipsis>
                    <span style={{ color: styles.secondaryGreen }}>
                      <Icon icon="akar-icons:arrow-up" />{" "}
                      {currencyFormat(getRandomNumber(), false, multiCloudCurrencyCode)}
                    </span>
                    &nbsp; greater than{" "}
                    {moment(startDate)
                      .add(
                        moment(startDate).diff(moment(endDate), "month") - 1,
                        "months"
                      )
                      .format("MMM YYYY")}{" "}
                    &nbsp;-&nbsp;
                    {moment(startDate).add(-1, "months").format("MMM YYYY")}
                  </Typography.Text>
                  <Typography.Text strong>
                    (
                    {currencyFormat(getRandomNumber(100), false , multiCloudCurrencyCode)}{" "}
                    Total)
                  </Typography.Text>
                </Space>
              </WrapperCard>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <WrapperCard title={title}>
                {overAllData && (
                  <AreaChart
                    data={overAllData}
                    isCurrency
                    legendPosition="top-right"
                    currencyType={multiCloudCurrencyCode}
                    colors={[styles.chartColor4, styles.chartColor5]}
                  />
                )}
              </WrapperCard>
            </Col>
          </Row>
        </>
      )}
    </Space>
  );
};
