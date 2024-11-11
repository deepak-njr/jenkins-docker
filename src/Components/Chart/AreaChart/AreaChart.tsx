import { Badge, Col, Row, Space } from "antd";
import { currencyFormat } from "@utils/CurrencyFormatter";
import styles from "@styles/variables.module.scss";
import { getChartColors } from "~/Utils/getChartColor";
import { TooltipLayout } from "../TooltipLayout";
import {
  AreaChart as ReAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  TooltipProps,
} from "recharts";
import styled from "styled-components";
import { filter, includes, keys } from "lodash";
import { useEffect, useRef, useState } from "react";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { multiCloudCurrencyCode } from "@utils/Constants";

interface Props {
  data: {
    [key in string]: any;
  }[];
  legendPosition?: "bottom" | "top-right";
  legendSymbol?: "circle" | "square";
  isCurrency?: boolean;
  sameColor?: boolean;
  height?: number;
  legend?: boolean;
  rotateLabel?: boolean;
  currencyType?: string;
  colors?: string[];
}

export const AreaChart = ({
  data,
  legend = true,
  legendPosition = "bottom",
  legendSymbol = "circle",
  isCurrency = false,
  currencyType = multiCloudCurrencyCode,
  sameColor,
  rotateLabel,
  height = 300,
  colors,
}: Props) => {
  const [showChart, setShowChart] = useState(false);
  const [disabled, setDisabled] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      setTimeout(() => setShowChart(true), 600);
    }
  }, [ref]);

  // const unique = Array.from(new Set(data.map((item) => item.category)));
  // const config: ColumnConfig = {
  //   data,
  //   xField: "xField",
  //   yField: "yField",
  //   seriesField: "category",
  //   height,
  //   maxColumnWidth: columnWidth,
  //   dodgePadding: 0,
  //   appendPadding: 10,
  //   isGroup: isGroup,

  //   columnStyle: {
  //     ...(roundedEdges && { radius: [20, 20, 0, 0] }),
  //     width: 1,
  //   },
  //   color: ,
  //   yAxis: {
  //     label: {
  //       formatter: (value) => {
  //         return isCurrency
  //           ? currencyFormat(Number(value), currencyCode, "compact")
  //           : value;
  //       },
  //     },
  //   },
  //   xAxis: {
  //     label: {
  //       autoRotate: true,
  //       autoHide: false,
  //     },
  //   },
  //   ...(legend
  //     ? {
  //         legend: {
  //           layout: "horizontal",
  //           position: legendPosition,

  //           marker: {
  //             symbol: legendSymbol,
  //             style: {
  //               r: 6,
  //             },
  //           },
  //         },
  //       }
  //     : {
  //         legend: false,
  //       }),
  //   tooltip: {
  //     domStyles: {
  //       "g2-tooltip": {
  //         opacity: 1,
  //         padding: 0,
  //         backgroundColor: "transparent",
  //         borderRadius: "20px",
  //       },
  //     },
  //     customContent: (title, data) => {
  //       return (
  //   <TooltipLayout
  //     title={title}
  //     body={
  //       <>
  //         {" "}
  //         {data.map((item) => (
  //           <Row gutter={16} justify="space-between" align="middle">
  //             <Col>
  //               <Badge color={item.mappingData.color} offset={[0, 4]} />
  //               {item.data.category}
  //             </Col>
  //             <Col style={{ textAlign: "right" }}>
  //               {currencyFormat(Number(item.data.yField), currencyCode, "compact")}
  //             </Col>
  //           </Row>
  //         ))}
  //       </>
  //     }
  //   />
  // ) as any;
  //     },
  //   },
  // };

  const renderTooltip = (props: TooltipProps<ValueType, NameType>) => {
    const { label, payload } = props;
    return (
      <TooltipLayout
        title={label}
        body={
          <>
            {payload &&
              payload.map((item: any, i: number) => (
                <Row gutter={16} justify="space-between" align="middle" key={i}>
                  <Col>
                    <Space>
                      <Badge color={item.fill} offset={[0, 4]} />
                      {item.name}
                    </Space>
                  </Col>
                  <Col style={{ textAlign: "right" }}>
                    {isCurrency
                      ? currencyFormat(
                        Number(item.value),
                        false,
                        currencyType
                      )
                      : item.value}
                  </Col>
                </Row>
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
    return sameColor ? [styles.primary] : getChartColors(data.length);
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
  const datawithoutName = data;
  return (
    <div ref={ref}>
      {showChart && (
        <ReAreaChart
          height={height}
          width={ref.current ? ref.current.getBoundingClientRect().width : 300}
          data={data}
          barGap={0}
        >
          {/* <defs>
            {getColors().map((color, index) => {
              return (
                <linearGradient
                  id={`clr-${index}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                  key={index}
                >
                  <stop offset="0" stopColor={color} stopOpacity={1} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.8} />
                </linearGradient>
              );
            })}
          </defs> */}
          <CartesianGrid
            strokeWidth={1}
            stroke={styles.smokewhite}
            vertical={false}
          />
          <XAxis
            dataKey={"name"}
            fontSize={12}
            interval={"preserveStartEnd"}
            tickLine={false}
            {...(rotateLabel && { angle: 30 })}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={10}
            tickFormatter={(value) =>
              currencyFormat(value, false, currencyType, "compact")
            }
          />
          {[
            keys(data[0]).map(
              (item, i) =>
                item !== "name" && (
                  <Area
                    dataKey={item}
                    fillOpacity={1}
                    fill={sameColor ? getColors()[0] : getColors()[i - 1]}
                    stroke={"none"}
                    animationDuration={400}
                    hide={includes(disabled, item)}
                    key={i}
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
        </ReAreaChart>
      )}
    </div>
  );
};
