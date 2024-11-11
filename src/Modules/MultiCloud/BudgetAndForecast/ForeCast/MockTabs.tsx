import {
  Col,
  DatePicker,
  Row,
  Form,
  Space,
  Typography,
  Button,
  Grid,
  TableColumnsType,
} from "antd";
import { useEffect, useState } from "react";
import {
  AreaChart,
  ButtonGroup,
  DataTable,
  MetricsCard,
  WrapperCard,
} from "@components/index";
import moment from "moment";
import { currencyFormat } from "~/Utils";
import styled from "styled-components";
import styles from "@styles/variables.module.scss";
import { isEmpty, keys, map, omit, times, values } from "lodash";
import { getRandomNumber } from "~/mocks/getRandomNumber";
import { Icon } from "@iconify/react";
import { getRamdomData } from "~/mocks/getRandomColChartData";
import colorAlpha from "color-alpha";
import { useQuery } from "~/Hooks/useQuery";
import { useParams } from "react-router-dom";
import { TinyBarGraph } from "~/mocks/TinyBarGraph";
import { multiCloudCurrencyCode } from "@utils/Constants";

const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;
const StyledFormItem = styled(Form.Item)`
  margin-bottom: 0px !important;
  .ant-row {
    align-items: center;
  }
`;
export const MockTabs = () => {
  const { xs } = useBreakpoint();
  const [data, setData] = useState<any[]>([]);
  const query = useQuery();
  const { id } = useParams();
  const [monthCount, setMonthCount] = useState(3);
  const [activeTimeRange, setActiveTimeRange] = useState("3 Months Forecast");
  const [customTimeFrame, setCustomTimeFrame] = useState<any[]>();

  const columns: TableColumnsType = [
    {
      title: "Service Name",
      dataIndex: "serviceName",
      ellipsis: true,
      sorter: (a: any, b: any) => a.serviceName.localeCompare(b.serviceName),
      defaultSortOrder: "ascend",
    },
    {
      title: "Account Name",
      dataIndex: "accountName",
      ellipsis: true,
      sorter: (a: any, b: any) => {
        const nameA = String(a.accountName ?? "");
        const nameB = String(b.accountName ?? "");
    
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: "Resource Id",
      dataIndex: "resourceName",
      ellipsis: true,
      sorter: (a: any, b: any) => a.resourceName.localeCompare(b.resourceName),
    },
    ...times(monthCount, (i) => ({
      dataIndex: moment().add(i, "month").format("MMMYY"),
      title: moment().add(i, "month").format("MMM YY"),
      className:"is-currency",
      ellipsis: true,
      sorter: (a: any, b: any) => {
        const key = moment().add(i, "month").format("MMMYY");
        const valueA = a[key];
        const valueB = b[key];
        const strValueA = valueA != null ? String(valueA) : '';
        const strValueB = valueB != null ? String(valueB) : '';
    
        return strValueA.localeCompare(strValueB);
      },
      render: (value: any) => currencyFormat(value, false, multiCloudCurrencyCode),
    })),
  ];

  useEffect(() => {
    if (activeTimeRange && !customTimeFrame) {
      setMonthCount(Number(activeTimeRange.split(" ")[0]));
    }
    if (customTimeFrame) {
      setMonthCount(
        moment(customTimeFrame[1]).diff(moment(customTimeFrame[0]), "months")
      );
    }
  }, [activeTimeRange, customTimeFrame]);

  const instances = ["EC2", "EBS", "S3", "Redshift"];

  const cloudData = () => {
    switch (query.get("vendor")) {
      case "3":
        return [
          "Compute Engine",
          "Cloud Storage",
          "BigQuery",
          "App Engine",
          "Cloud Run",
        ];
      case "4":
        return ["Droplets", "App Platform", "Functions", "Spaces", "Snapshots"];
      default:
        return [
          "HPC",
          "Cloud Security",
          "Data Lakehouse",
          "ISV",
          "Multicloud Startegies",
        ];
    }
  };

  const randomDataGeneration = () => {
    const accounts = ["Azure", "AWS", "GCP", "Digital Ocean", "Oracle"];
    const items = times(cloudData().length, (i) => {
      const name = cloudData();
      return {
        key: name,
        serviceName: name[i],
        resourceName: `${(Math.random() + 1).toString(36).substring(7)}-${name[i]
          }`,
        accountName: accounts[Number(query.get("vendor")) - 1],
        ...Object.assign(
          {},
          ...times(monthCount, (i) => ({
            [moment().add(i, "month").format("MMMYY")]: getRandomNumber(200),
          }))
        ),
      };
    });

    // if (items.length === count) {
    //   setTimeout(() => {
    //     setIsLoading(false);
    //   }, 600);
    // }

    return items;
  };

  const tableData = randomDataGeneration();

  const amount = map(tableData, (data) => {
    return omit(data, ["accountName", "resourceName", "key", "serviceName"]);
  })
    .map((val) => values(val).reduce((a: any, b: any) => a + b, 0))
    .reduce((x: any, y: any) => x + y, 0);

  // .reduce((a:number,b:number) => a + values(b).reduce((x: number,y: number) => x + y, 0), 0);
  useEffect(() => {
    if (id === "Forecast") {
      if (query.get("vendor") === "2" || query.get("vendor") === "3") {
        setData(randomDataGeneration());
      }
    }
  }, [query, id]);

  const getMapData = () => {
    const obj: any = {};
    map(tableData, (data) => {
      return omit(data, ["accountName", "resourceName", "key", "serviceName"]);
    }).map((value, key) => {
      keys(value).map((key) =>
        obj[key] ? (obj[key] += value[key]) : (obj[key] = value[key])
      );
    });

    const data: any = [];

    keys(obj).map((key) =>
      data.push({
        name: key.match(/.{1,3}/g)?.join(" "),
        Forecast: obj[key] * 2,
        "Actual Spend": obj[key],
      })
    );

    return data;
  };

  return (
    <Space
      direction="vertical"
      size={"large"}
      style={{ width: "100%" }}
      key={query.get("vendor")}
    >
      <Row gutter={[16, 16]}>
        <Col
          xs={24}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <Row gutter={[16, 16]} style={{ width: "100%" }}>
            <Col {...(xs && { span: 24 })}>
              <ButtonGroup
                buttonItems={[
                  "3 Months Forecast",
                  "6 Months Forecast",
                  "12 Months Forecast",
                ]}
                defaultActive={activeTimeRange}
                disabled={customTimeFrame && !isEmpty(customTimeFrame)}
                onClick={(e) =>
                  setActiveTimeRange(e.currentTarget.textContent || "")
                }
              />
            </Col>
            <Col {...(xs && { span: 24 })} style={{ display: "inline-flex" }}>
              <Form
                layout="horizontal"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <>
                  <StyledFormItem
                    label="Choose custom forecast"
                    style={{
                      marginBottom: 0,
                    }}
                  >
                    <RangePicker
                      size="large"
                      onChange={(e) => setCustomTimeFrame(e as any)}
                      allowClear
                      suffixIcon={
                        <Icon
                          icon="lucide:calendar-clock"
                          style={{ color: styles.strawberry, fontSize: 16 }}
                        />
                      }
                      clearIcon={
                        <Icon
                          icon="ooui:clear"
                          style={{
                            color: colorAlpha(styles.gray, 0.4),
                            fontSize: 18,
                          }}
                        />
                      }
                    />
                  </StyledFormItem>
                  <StyledFormItem style={{ marginLeft: 8 }}>
                    <Button
                      type="primary"
                      size="large"
                      disabled={!customTimeFrame}
                    >
                      <Icon
                        icon="akar-icons:arrow-right"
                        style={{ fontSize: 20 }}
                      />
                    </Button>
                  </StyledFormItem>
                </>
              </Form>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <MetricsCard
            style={{ height: "100%" }}
            key={query.get("vendor")}
            icon={"clarity:dollar-bill-line"}
            iconColor={styles.strawberry}
            title={
              <span style={{ color: styles.gray }}>{activeTimeRange}</span>
            }
            totalCount={
              <span style={{ color: styles.primary }}>
                {currencyFormat(amount, false, multiCloudCurrencyCode)}
              </span>
            }
            graph={
              <Space direction="vertical" style={{ display: "flex" }}>
                <TinyBarGraph
                  count={currencyFormat(amount * 1.5, false, multiCloudCurrencyCode)}
                />
              </Space>
            }
          />
        </Col>
        <Col xs={24} md={8} style={{ textAlign: "center" }}>
          <WrapperCard>
            <Space size={4} direction="vertical">
              <Typography.Title level={3} style={{ margin: 0 }}>
                {currencyFormat(amount - 200, false, multiCloudCurrencyCode)}
              </Typography.Title>
              <Typography.Text ellipsis>
                <span style={{ color: styles.secondaryGreen }}>
                  <Icon icon="akar-icons:arrow-up" />{" "}
                  {currencyFormat(200, false, multiCloudCurrencyCode)}
                </span>
                &nbsp; greater than{" "}
                {moment()
                  .subtract(Number(activeTimeRange.split("")[0]), "month")
                  .format("MMM YYYY")}{" "}
                &nbsp;-&nbsp;
                {moment().subtract(1, "M").format("MMM YYYY")}
              </Typography.Text>
              {/* <Typography.Text strong>
                (
                {currencyFormat(
                  (amount / Number(activeTimeRange.split("")[0])) * 12,
                  multiCloudCurrencyCode,
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
          <WrapperCard title={activeTimeRange}>
            <AreaChart
              key={query.get("vendor")}
              data={getMapData()}
              isCurrency
              colors={[styles.chartColor4, styles.chartColor5]}
              legendPosition="top-right"
            />
          </WrapperCard>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <WrapperCard title={"Detailed forecast"}>
            <div style={{ paddingBlock: 16 }}>
              <DataTable
                key={monthCount}
                columns={columns}
                tableData={tableData}
                showTopBar={false}
                height={450}
                multiSelect={false}
              />
            </div>
          </WrapperCard>
        </Col>
      </Row>
    </Space>
  );
};
