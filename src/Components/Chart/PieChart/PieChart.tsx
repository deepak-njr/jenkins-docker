import { Avatar, Badge, Col, List, Row, Space, Typography, Tooltip as AntTooltip, Grid, Button, Modal } from "antd";
import { useEffect, useRef, useState } from "react";
import cs from "classnames";
import { currencyFormat } from "@utils/CurrencyFormatter";
import styles from "./index.module.scss";
import { filter, includes, isEmpty, map, reduce, times, uniq } from "lodash";
import { getChartColors } from "@utils/getChartColor";
import { TooltipLayout } from "../TooltipLayout";
import { PieChart as RePieChart, Pie, Tooltip, Cell } from "recharts";
import styled from "styled-components";
import _ from "lodash";
import { strings } from "@utils/Strings";

const { useBreakpoint } = Grid;
interface Props {
  data: {
    category: string;
    value: number;
    additionInfo?: string;
    currency?: string;
  }[];
  showMoreTitle?: string;
  tooltipTitle: string;
  isCurrency?: boolean;
  isPercent?: boolean;
  usersCount?: number;
  pieCenterContent?: {
    title?: string;
    value?: string | number | null;
  };
  isTotal?: boolean;
  isMultiCloud?: boolean;
  sideBySide?: boolean;
  showCategoryPercent?: boolean;
  compactLegend?: boolean;
}
const CustomLabel = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 4px;
  .ant-typography {
    font-weight: bold !important;
    font-size: 16px;
    color: ${styles.primary};
  }
`;
export const PieChart = ({
  data,
  showMoreTitle,
  tooltipTitle,
  isCurrency,
  usersCount,
  isMultiCloud,
  isTotal,
  isPercent,
  pieCenterContent,
  sideBySide = true,
  showCategoryPercent = true,
  compactLegend = false,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const { md } = useBreakpoint();
  const [showChart, setShowChart] = useState(false);
  const [colors, setColors] = useState<string[]>([]);
  const [disabled, setDisabled] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const handleLegendClick = (value: string) => {
    if (includes(disabled, value)) {
      setDisabled(filter(disabled, (d) => d !== value));
    } else {
      setDisabled((prevValue) => [...prevValue, value]);
    }
  };

  useEffect(() => {
    setColors(getChartColors(5));
    // eslint-disable-next-line
  }, [data]);

  const filteredData = (): any[] => {
    if (data.length === 0) return [{ category: strings.noData, value: 1 }];

    if (data.length === 5) {
      return data.sort((a, b) => b.value - a.value);
    }

    const top4 = data.slice(0, 4).sort((a, b) => b.value - a.value);
    const othersSum = data.slice(4).reduce((sum, current) => sum + current.value, 0);

    if (data.length > 4) top4.push({ category: "Others", value: othersSum });
    if (top4.every((data) => data.value === 0)) top4.push({ category: strings.noData, value: 1 });

    return top4;
  };

  const disabledSet = new Set(disabled || []);

  const enabledItems = () => {
    const result = filteredData().filter((entry) => !disabledSet.has(entry.category));
    return result;
  };

  const total = reduce(
    enabledItems().filter((value) => value.category !== strings.noData),
    (a, b) => a + b.value,
    0
  );
  useEffect(() => {
    if (ref.current) {
      setTimeout(() => setShowChart(true), 1000);
    }
  }, [ref]);

  const renderTooltip = ({ payload, label }: any) => {
    if (isEmpty(payload)) return <></>;

    if (payload[0] && payload[0].payload.category !== strings.noData) {
      return (
        <TooltipLayout
          title={tooltipTitle || label}
          body={
            <Row
              gutter={16}
              justify="space-between"
              align="middle"
            >
              <Col>
                <Badge
                  // color={item.mappingData.color}
                  className={styles.Dot}
                />
                <Typography.Text
                  strong
                  style={{ color: styles.primary }}
                >
                  {payload && payload[0].payload.category}
                </Typography.Text>
              </Col>
              <Col style={{ textAlign: "right" }}>
                {isCurrency
                  ? currencyFormat(Number(payload && payload[0].payload.value), true)
                  : isPercent
                  ? `${payload && usersCount && `${((payload[0].payload.value / usersCount) * 100).toFixed(2)}%`}`
                  : payload && payload[0].payload.value}
              </Col>
            </Row>
          }
        />
      );
    }
  };

  const tipValue = (item: any) => {
    return (
      <>
        {isCurrency
          ? isMultiCloud
            ? currencyFormat(Number(item.value), false, item.currency)
            : currencyFormat(Number(item.value), true)
          : isPercent
          ? item.value && usersCount
            ? `${((item.value / usersCount) * 100).toFixed(2)}%`
            : "0%"
          : item.value}
      </>
    );
  };

  const calculateDimension = () => {
    if (ref.current) {
      const { width } = ref.current.getBoundingClientRect();
      return width < 300 ? (!sideBySide ? 275 : width) : !sideBySide ? 275 : 300;
    } else {
      return !sideBySide ? 275 : 300;
    }
  };

  return (
    <>
      <Row
        gutter={[16, 16]}
        align="middle"
      >
        <Col
          ref={ref}
          {...(sideBySide
            ? {
                xs: 24,
                md: 12,
              }
            : {
                xs: 24,
              })}
        >
          {showChart && (
            <div
              style={{
                height: calculateDimension(),
                width: calculateDimension(),
                margin: "auto",
                position: "relative",
              }}
            >
              <CustomLabel
                style={{
                  height: calculateDimension(),
                  width: calculateDimension(),
                }}
              >
                {data.length === 0 ? (
                  <Typography.Text strong>{strings.noData}</Typography.Text>
                ) : (
                  <>
                    {/* {console.log(pieCenterContent && pieCenterContent.title)} */}
                    {pieCenterContent && pieCenterContent.title && (
                      <Typography.Text strong>{pieCenterContent.title}</Typography.Text>
                    )}
                    {pieCenterContent && pieCenterContent.value && (
                      <Typography.Text strong>{pieCenterContent.value}</Typography.Text>
                    )}
                    {!pieCenterContent ||
                      (!pieCenterContent.value && (
                        <Typography.Text strong>
                          {isCurrency
                            ? currencyFormat(isTotal ? total : data.length && Number(total / data.length), true)
                            : isPercent
                            ? total && usersCount
                              ? `${((total / (data.length * usersCount)) * 100).toFixed(2)}%`
                              : "0%"
                            : ""}
                        </Typography.Text>
                      ))}
                  </>
                )}
                {/* <Label
                value={
                  pieCenterContent
                    ? `${
                        pieCenterContent.title
                          ? `${pieCenterContent.title}\n`
                          : ""
                      }${
                        pieCenterContent && pieCenterContent.value
                          ? (pieCenterContent.value as any)
                          : isCurrency
                          ? currencyFormat(Number(total), user.currency, "compact")
                          : isPercent
                          ? `${((total / total) * 100).toFixed(2)}%`
                          : ""
                      }`
                    : ""
                }
                position="centerBottom"
              /> */}
              </CustomLabel>
              <RePieChart
                height={calculateDimension()}
                width={calculateDimension()}
              >
                <Pie
                  data={[...filteredData()].map((entry) => !disabled?.includes(entry.category) && entry)}
                  animationDuration={300}
                  dataKey="value"
                  innerRadius={calculateDimension() / 4}
                >
                  {filteredData().map((item, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={item.category === strings.noData ? styles.grey : colors[index]}
                    />
                  ))}
                </Pie>
                <Tooltip content={(props) => renderTooltip(props)} />
              </RePieChart>
            </div>
          )}
        </Col>
        <Col
          {...(sideBySide
            ? {
                xs: 24,
                md: 12,
              }
            : {
                xs: 24,
              })}
        >
          <List
            dataSource={filteredData().filter((value) => value.category !== strings.noData)}
            style={{
              maxHeight: sideBySide ? "100%" : 150,
              overflow: "auto",
            }}
            renderItem={(item, index) => (
              <List.Item
                onClick={() => handleLegendClick(item.category)}
                className={cs(styles.LegendItem, styles.ListItem, {
                  [styles.LegendItemDisabled]: includes(disabled, item.category),
                })}
                style={{ paddingBlock: styles.whitespace1 }}
              >
                <Row
                  align="top"
                  {...(sideBySide && { justify: "start" })}
                  {...(!sideBySide && compactLegend && { justify: "center" })}
                  gutter={16}
                  style={{ width: "100%", userSelect: "none" }}
                >
                  <Col {...(!compactLegend ? { span: sideBySide ? 13 : 17 } : { span: 8, offset: 1 })}>
                    <Space
                      size={"small"}
                      direction="horizontal"
                      align="start"
                    >
                      <Avatar
                        size={16}
                        shape={"square"}
                        style={{
                          backgroundColor: colors[index],
                          borderRadius: 6,
                        }}
                      />
                      <AntTooltip
                        placement="topLeft"
                        title={`${item.category}`}
                      >
                        <Space
                          direction="vertical"
                          size={0}
                        >
                          <div className={styles.titleItem}>
                            <Typography.Title
                              level={5}
                              style={{
                                margin: 0,
                                color: styles.gray,
                                fontSize: 14,
                              }}
                              ellipsis
                            >
                              {item.category}
                            </Typography.Title>
                          </div>
                          {!isPercent && showCategoryPercent && (
                            <span style={{ fontSize: 12 }}>({((item.value / total) * 100).toFixed(2)}%)</span>
                          )}

                          {item.additionInfo && (
                            <Typography.Text
                              type="secondary"
                              ellipsis
                            >
                              {item.additionInfo}{" "}
                            </Typography.Text>
                          )}
                        </Space>
                      </AntTooltip>
                    </Space>
                  </Col>
                  <Col
                    span={sideBySide ? 11 : 7}
                    style={{ textAlign: "right" }}
                  >
                    <AntTooltip
                      placement="topLeft"
                      title={tipValue(item)}
                    >
                      <Typography.Text
                        ellipsis
                        style={{
                          color: styles.primary,
                          fontWeight: "bold",
                          fontSize: "14px",
                        }}
                      >
                        {tipValue(item)}
                      </Typography.Text>
                    </AntTooltip>
                  </Col>
                </Row>
              </List.Item>
            )}
          />
        </Col>
      </Row>
      <Modal
        open={open}
        footer={null}
        maskClosable={false}
        title={showMoreTitle}
        centered
        bodyStyle={{ maxHeight: 500, overflowY: "auto" }}
        onCancel={() => setOpen(false)}
      >
        <div
          style={{
            paddingLeft: styles.whitespace2,
            paddingRight: styles.whitespace3,
          }}
        >
          <List
            // style={{ marginTop: styles.whitespace3 }}
            dataSource={uniq(map(data.slice(4)))}
            renderItem={(item: any) => (
              <List.Item style={{ textTransform: "capitalize" }}>
                <Row>
                  <Space
                    direction="vertical"
                    size={0}
                  >
                    <Typography.Title
                      level={5}
                      style={{ margin: 0, color: styles.gray, fontSize: 14 }}
                      ellipsis
                    >
                      {item.category}
                    </Typography.Title>
                    {item.additionInfo && (
                      <Typography.Text
                        type="secondary"
                        ellipsis
                      >
                        {item.additionInfo}{" "}
                      </Typography.Text>
                    )}
                  </Space>
                </Row>
                <Row
                  style={{
                    color: styles.primary,
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  {isCurrency
                    ? currencyFormat(Number(item.value), true)
                    : isPercent
                    ? item.value && usersCount
                      ? `${((item.value / usersCount) * 100).toFixed(2)}%`
                      : "0%"
                    : item.value}
                </Row>
              </List.Item>
            )}
          />
        </div>
      </Modal>
      {data && data.length > 5 && (
        <Row
          justify="end"
          style={{ marginTop: styles.whitespace2 }}
        >
          <Typography.Text style={{ fontSize: "14px" }}>
            <Button
              type="ghost"
              shape="round"
              onClick={(e) => {
                setOpen(true);
              }}
            >
              View More
            </Button>
          </Typography.Text>
        </Row>
      )}
    </>
  );
};
