import { Badge, Col, Row, Space, Typography } from "antd";
import { currencyFormat } from "@utils/CurrencyFormatter";
import styles from "@styles/variables.module.scss";
import { getChartColors } from "~/Utils/getChartColor";
import { TooltipLayout } from "../TooltipLayout";
import { currencyCode } from "@utils/Constants";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  TooltipProps,
  Text,
} from "recharts";
import styled from "styled-components";
import { filter, includes, keys } from "lodash";
import { useEffect, useRef, useState } from "react";
import colorAlpha from "color-alpha";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { getRandomNumber } from "~/mocks/getRandomNumber";
import { nonCurrencyValues } from "@utils/StringConstants";

interface Props {
  data: {
    [key in string]: any;
  }[];
  columnWidth?: number;
  xValueKey?: string;
  yValueKey?: string;
  legendPosition?: "bottom" | "top-right";
  legendSymbol?: "circle" | "square";
  isCurrency?: boolean;
  sameColor?: boolean;
  height?: number;
  legend?: boolean;
  currencyType?: string;
  colors?: string[];
  showCount?: boolean;
  isSpend?: boolean;
  hasBarGap?: boolean;
}

export const ColumnChart = ({
  data,
  legend = true,
  legendPosition = "bottom",
  legendSymbol = "circle",
  isCurrency = false,
  xValueKey = "name",
  yValueKey = "",
  currencyType = currencyCode,
  sameColor,
  height = 300,
  columnWidth = 10,
  showCount,
  colors,
  isSpend,
  hasBarGap = false,
}: Props) => {
  const [showChart, setShowChart] = useState(false);
  const [disabled, setDisabled] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      setTimeout(() => setShowChart(true), 600);
    }
  }, [ref]);

  const renderTooltip = (props: TooltipProps<ValueType, NameType>) => {
    const { label, payload } = props;
    return (
      <TooltipLayout
        title={label}
        body={
          <>
            {payload &&
              payload
                .filter((entry: any) => entry.name !== "name")
                .map((item: any, i) => (
                  <>
                    <Row gutter={16} justify="space-between" align="middle">
                      <Col>
                        <Space>
                          <Badge color={item.fill} offset={[0, 4]} />
                          {`${item.name} ${isSpend ? "Spend" : ""}`}
                        </Space>
                      </Col>
                      <Col style={{ textAlign: "right" }}>
                        {isCurrency && !nonCurrencyValues.includes(item.name)
                          ? currencyFormat(
                              Number(item.value),
                              false,
                              currencyType
                            )
                          : item.value}
                      </Col>
                    </Row>
                    {showCount && (
                      <Row gutter={16} justify="space-between" align="middle">
                        <Col>
                          <Badge color={"transparent"} offset={[0, 4]} />
                          No. of Applications
                        </Col>
                        <Col>{getRandomNumber(10)}</Col>
                      </Row>
                    )}
                  </>
                ))}
          </>
        }
      />
    );
  };

  const getColors = () => {
    if (colors) {
      return colors;
    }
    return sameColor
      ? [styles.primary]
      : [
          styles.chartColor1,
          styles.chartColor2,
          styles.chartColor9,
          styles.chartColor8,
          styles.chartColor4,
        ];
  };

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

  return (
    <div ref={ref}>
      {showChart && (
        <ResponsiveContainer width="95%" height={height}>
          <BarChart
            margin={{
              top: 10,
            }}
            height={height}
            width={
              ref.current ? ref.current.getBoundingClientRect().width : 300
            }
            data={data}
            barGap={hasBarGap ? 0 : -10}
          >
            <CartesianGrid
              strokeWidth={1}
              stroke={styles.smokewhite}
              vertical={false}
            />
            <XAxis
              dataKey={xValueKey}
              fontSize={12}
              interval={0}
              tickMargin={0}
              tick={(props) => <CustomizedTick {...props} />}
              {...(ref.current &&
                ref.current.getBoundingClientRect().width < 300 &&
                {})}
            />
            <YAxis
              dataKey={yValueKey}
              style={{ fontSize: "0.8rem" }}
              axisLine={false}
              tickFormatter={(value) =>
                currencyFormat(value, false, currencyType, "compact")
              }
            />
            {[
              keys(data[0]).map(
                (item, i) =>
                  item !== "month" &&
                  item !== "name" && (
                    <Bar
                      barSize={columnWidth}
                      dataKey={item}
                      radius={[20, 20, 0, 0]}
                      fill={sameColor ? getColors()[0] : getColors()[i]}
                      animationDuration={400}
                      hide={includes(disabled, item)}
                    />
                  )
              ),
            ]}

            {legend && (
              <Legend
                align={getLegendPosition().align as any}
                verticalAlign={getLegendPosition().verticalAlign as any}
                iconType={legendSymbol}
                iconSize={12}
                cursor="pointer"
                onClick={(e) => handleLegendClick(e.dataKey)}
              />
            )}

            <Tooltip
              content={(props) => renderTooltip(props)}
              cursor={{ opacity: 0.1 }}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

const CustomizedTick = (props: {
  x: number;
  y: number;
  angle: number;
  fontSize: number;
  payload: { value: string };
}) => {
  return (
    <Text
      x={props.x}
      y={props.y}
      textAnchor="middle"
      verticalAnchor="start"
      width={10}
      angle={props.angle}
      fontSize={props.fontSize}
    >
      {props.payload.value}
    </Text>
  );
};
