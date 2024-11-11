import ArrowToPoint from "@assets/SVG/arrowToPoint.svg";
import Medal from "@assets/SVG/medal.svg";
import Money from "@assets/SVG/money.svg";
import { MetricsCard } from "@components/index";
import { Col, Row, Space, Typography, Image } from "antd";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { countBy, isEmpty, keys, map, reduce } from "lodash";
import { currencyFormat } from "@utils/CurrencyFormatter";
import styles from "./OptimizeMetrics.module.scss";
import { currencyCode } from "@utils/Constants";

const metricsCardData = [
  {
    icon: (
      <Image
        src={Medal}
        preview={false}
      />
    ),
    title: "Total Recommendations",
    graphUp: true,
    totalInPercentage: "+2.5",
  },
  {
    icon: (
      <Image
        src={ArrowToPoint}
        preview={false}
      />
    ),
    title: "Resources by Impact",
    graphUp: false,
    totalInPercentage: "-4.4",
  },
  {
    icon: (
      <Image
        src={Money}
        preview={false}
      />
    ),
    title: "Estimated Monthly Savings",
    graphUp: true,
    totalInPercentage: "+2.5",
  },
  {
    icon: (
      <Image
        src={Money}
        preview={false}
      />
    ),
    title: "Estimated Annual Savings",
    graphUp: true,
    totalInPercentage: "+0.5",
  },
];
interface Props {
  data: { [key in string]: any }[];
}
export const Metric = ({ data }: Props) => {
  const impact = Object.assign(
    {},
    ...map(countBy(data, "impact"), (val, key) => ({
      [key.toLocaleLowerCase()]: val,
    }))
  );
  const currencySection = data.map((item: any) => item.currency);
  const getCount = (title: string) => {
    switch (title) {
      case "Total Recommendations":
        return data.length;

      case "Estimated Monthly Savings":
        return currencyFormat(
          reduce(
            data,
            (d, v) => {
              return d + v["savingsAmount"];
            },
            0
          ),
          false,
          !isEmpty(data) && data[0].currency
        );
      case "Estimated Annual Savings":
        return currencyFormat(
          reduce(
            data,
            (d, v) => {
              return d + v["annualSavingsAmount"];
            },
            0
          ),
          false,
          !isEmpty(data) && data[0].currency
        );
      default:
    }
  };

  const dataChart: any = [
    {
      name: "impact",
      ...impact,
    },
  ];

  const getColor = (item: string) => {
    switch (item) {
      case "high":
        return "#E80038";
      case "medium":
        return "#FE8E0E";
      case "low":
        return "#1363DF";
      default:
        return "";
    }
  };

  return (
    <Row gutter={16}>
      {metricsCardData.map((item) => (
        <Col
          xs={24}
          sm={24}
          md={12}
          lg={6}
          key={item.title}
          style={{ marginBottom: styles.whitespace2 }}
        >
          <MetricsCard
            icon={item.icon}
            title={<Typography.Text ellipsis>{item.title}</Typography.Text>}
            totalCount={getCount(item.title) || 0}
            {...(item.title === "Resources by Impact" && {
              horizotalGraph: (
                <>
                  <ResponsiveContainer
                    width={"100%"}
                    height={30}
                  >
                    <BarChart
                      layout="vertical"
                      data={dataChart}
                      margin={{ left: 0 }}
                      barSize={10}
                    >
                      <YAxis
                        yAxisId={0}
                        dataKey={"impact"}
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tickSize={0}
                        width={0}
                        tickMargin={0}
                      />
                      <XAxis
                        hide
                        axisLine={false}
                        type="number"
                        tickMargin={0}
                        height={0}
                      />
                      {[
                        keys(dataChart[0]).map(
                          (item, i) =>
                            item !== "name" && (
                              <Bar
                                dataKey={item}
                                stackId="a"
                                fill={getColor(item)}
                              ></Bar>
                            )
                        ),
                      ]}
                    </BarChart>
                  </ResponsiveContainer>
                  <Space style={{ width: "100%", alignContent: "space-between" }}>
                    {["high", "medium", "low"].map((item, i) => (
                      <Space
                        size={2}
                        key={`impact-azure${i}`}
                      >
                        <Typography.Text style={{ fontWeight: "bold", color: getColor(item) }}>
                          {(dataChart[0][item] as any) || ""}
                        </Typography.Text>
                        <Typography.Text style={{ textTransform: "capitalize" }}>{item}</Typography.Text>
                      </Space>
                    ))}
                  </Space>
                </>
              ),
            })}
          />
        </Col>
      ))}
    </Row>
  );
};
