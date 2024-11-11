import ArrowToPoint from "@assets/SVG/arrowToPoint.svg";
import Medal from "@assets/SVG/medal.svg";
import Money from "@assets/SVG/money.svg";
import { MetricsCard } from "@components/index";
import { Col, Image, Row, Typography } from "antd";
import { currencyFormat } from "@utils/CurrencyFormatter";
import styles from "./OptimizeMetrics.module.scss";
import { isEmpty } from "lodash";
import { currencyCode } from "@utils/Constants";

const metricsCardData = [
  {
    icon: <Image src={Medal} preview={false} />,
    title: "Total Recommendations",
    graphUp: true,
    totalInPercentage: "+2.5",
  },
  {
    icon: <Image src={ArrowToPoint} preview={false} />,
    title: "Estimated Savings (%)",
    graphUp: false,
    totalInPercentage: "-4.4",
  },
  {
    icon: <Image src={Money} preview={false} />,
    title: "Estimated Monthly Savings",
    graphUp: true,
    totalInPercentage: "+2.5",
  },
  {
    icon: <Image src={Money} preview={false} />,
    title: "Estimated Annual Savings",
    graphUp: true,
    totalInPercentage: "+0.5",
  },
];
interface Props {
  data: { [key in string]: any };
}
export const Metric = ({ data }: Props) => {
  const getCount = (title: string) => {
    switch (title) {
      case "Total Recommendations":
        return !isEmpty(data) ? data.meta.totalRecommendation : 0;
      case "Estimated Savings (%)":
        return !isEmpty(data)
          ? Number(data.meta.savingsPercentage).toFixed(2)
          : 0;
      case "Estimated Monthly Savings":
        return currencyFormat(
          !isEmpty(data) ? data.meta?.monthlySavings : 0,
          !isEmpty(data) ? data.meta?.currency : currencyCode,
        );
      case "Estimated Annual Savings":
        return currencyFormat(
          !isEmpty(data) ? data.meta?.monthlySavings * 12 : 0,
          !isEmpty(data) ? data.meta?.currency : currencyCode,         
        );
      default:
    }
  };

  return (
    <Row gutter={16}>
      {metricsCardData.map((item, i) => (
        <Col
          xs={24}
          sm={12}
          lg={6}
          key={`aws-metric${i}`}
          style={{ marginBottom: styles.whitespace2 }}
        >
          <MetricsCard
            icon={item.icon}
            title={<Typography.Text ellipsis>{item.title}</Typography.Text>}
            totalCount={getCount(item.title) || 0}
          />
        </Col>
      ))}
    </Row>
  );
};
