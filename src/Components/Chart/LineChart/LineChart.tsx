import { Badge, Col, Row, Space, Typography } from "antd";
import { currencyFormat } from "@utils/CurrencyFormatter";
import { getChartColors } from "@utils/getChartColor";
import { TooltipLayout } from "../TooltipLayout";
import { multiCloudCurrencyCode } from "@utils/Constants";
import styles from "@styles/variables.module.scss";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
  LegendProps,
} from "recharts";
import { filter, includes, keys, reduce } from "lodash";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { numberFormat } from "@utils/numberFormatter";
import { isOdd } from "@utils/CommonUtils";

interface Props {
  data: {
    [key in string]: any;
  }[];

  isGroup?: boolean;
  legendPosition?: "bottom" | "top-right";
  legendSymbol?: "circle" | "square";
  isCurrency?: boolean;
  height?: number;
  maxValue: number;
}

const CustonLegend = styled(Legend)``;

export const LineChart = ({
  data,
  height,
  legendPosition = "bottom",
  legendSymbol = "circle",
  isCurrency,
  maxValue
}: Props) => {
  const color = getChartColors(data && keys(data[0]).length);
  const [showChart, setShowChart] = useState(false);
  const [disabled, setDisabled] = useState<string[]>([]);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      setTimeout(() => setShowChart(true), 600);
    }
  }, [ref]);

  const getLegendPosition = () => {
    const split = legendPosition.split("-");
    if (split.length > 1) {
      return { align: split[1], verticalAlign: split[0] };
    }
    return { align: "center", verticalAlign: split[0] };
  };
  const handleLegendClick = (value: string) => {
    if (includes(disabled, value)) {
      setDisabled(filter(disabled, (d) => d !== value));
    } else {
      setDisabled((prevValue) => [...prevValue, value]);
    }
  };
  const renderTooltip = (props: TooltipProps<ValueType, NameType>) => {
    const { label, payload } = props;
    return (
      <TooltipLayout
        title={label}
        body={
          <>
            {payload &&
              payload.map((item: any) => (
                <Row gutter={16} justify="space-between" align="middle">
                  <Col>
                    <Space>
                      <Badge color={item.stroke} offset={[0, 4]} />
                      {item.name}
                    </Space>
                  </Col>
                  <Col style={{ textAlign: "right" }}>
                    {isCurrency
                      ? currencyFormat(Number(item.value),false, multiCloudCurrencyCode)
                      : item.value}
                  </Col>
                </Row>
              ))}
          </>
        }
      />
    );
  };

  return (
    <div ref={ref}>
      {showChart && (
        <ResponsiveContainer width="95%" height={height}>
          <ReLineChart
            data={data}
            height={height}
            width={
              ref.current ? ref.current.getBoundingClientRect().width : 300
            }
          >
            <XAxis dataKey={"name"} fontSize={12} interval={"preserveEnd"} />
            <YAxis
              allowDuplicatedCategory={false}
              allowDecimals={false}
              domain={[0, maxValue && isOdd(maxValue)? maxValue + 1 : maxValue + 2]} 
              axisLine={false}
              {...(isCurrency
                ? {
                  tickFormatter: (value) =>
                    currencyFormat(value, false, multiCloudCurrencyCode, "compact"),
                }
                : {
                  tickFormatter: (value) => numberFormat(value, "compact"),
                })}
            />
            <CartesianGrid strokeWidth={1} stroke={styles.smokewhite} />
            {[
              keys(data? data[0] : []).map(
                (item, i) =>
                  item !== "name" && (
                    <Line
                      type="monotone"
                      dataKey={item}
                      stroke={color[i - 1]}
                      strokeWidth={2}
                      dot={false}
                      animationDuration={400}
                      hide={includes(disabled, item)}
                    />
                  )
              ),
            ]}
            <Legend
              align={getLegendPosition().align as any}
              verticalAlign={getLegendPosition().verticalAlign as any}
              iconType={legendSymbol}
              iconSize={12}
              cursor="pointer"
              onClick={(e) => handleLegendClick(e.dataKey)}
            />
            <Tooltip content={(props) => renderTooltip(props)} />
          </ReLineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
