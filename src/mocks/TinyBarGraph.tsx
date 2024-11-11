import { TinyArea, TinyAreaConfig, Column } from "@ant-design/plots";
import moment from "moment";
import { BarChart, Bar, XAxis, YAxis, Tooltip, TooltipProps, Cell } from "recharts";
import { Typography, Layout, Badge, Col, Row, Space } from "antd";
import styles from "../Modules/Dashboard/Widgets/Widgets.module.scss";
import Styles from "./index.module.scss";
import { TooltipLayout } from "../../src/Components/Chart/TooltipLayout";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { ReactNode, useState } from "react";
import { strings } from "~/Utils/Strings";
interface Props {
  title?: any;
  data?: any;
  count?: any;
  months?: any;
}

export const TinyBarGraph = ({ data, count, months, title }: Props) => {
  let [barGraphData, setBarGraphData] = useState({ x: 0, y: 0 });

  let showMockData;
  const filteredData = (data: any) => {
    if (!data) {
      return;
    }

    data = [
      { name: months[1], value: data.secondMonth },
      { name: months[2], value: data.thirdMonth },
      { name: months[3], value: data.fourthmonth },
    ];
    if (data.every((data: any) => data.value === 0)) {
      showMockData = true;
      data = [
        { name: "", value: 1 },
        { name: "", value: 2 },
        { name: "", value: 3 },
      ];
    }
    let max = Math.max(...data.map((d: any) => d.value));
    return data.map((d: any, index: any) => {
      if (d.value === 0) {
        d.value = Math.ceil(Math.random() * max);
        d.enabled = true;
        d.name = strings.noData;
      }
      return d;
    });
  };
  function TooltipContent(props: TooltipProps<ValueType, NameType>) {
    const { payload, label } = props;
    if (!payload) {
      return null;
    }
    if (payload[0] && label !== strings.noData) {
      return (
        <div className={Styles.TooltipWrapper}>
          <TooltipLayout
            title={label}
            body={
              <Row
                gutter={16}
                justify="space-between"
                align="middle"
              >
                <Col>
                  <Space>
                    <Badge
                      color={styles.byzantine}
                      offset={[0, 4]}
                    />
                    {title}
                  </Space>
                </Col>
                <Col style={{ textAlign: "right" }}>{payload[0]?.value}</Col>
              </Row>
            }
          />
        </div>
      );
    }
    return null;
  }
  const config = {
    data,
    height: 40,
    autoHide: true,
    xField: "type",
    yField: "sales",
    xAxis: {
      visible: false,
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      type: {},
      sales: {},
    },
    minColumnWidth: 20,
    maxColumnWidth: 20,
  };
  if (data) {
    return (
      <>
        <BarChart
          width={60}
          height={40}
          data={filteredData(data)}
        >
          <Bar
            dataKey="value"
            fill={styles.grey}
            // onMouseOver={(data) => {
            //   setBarGraphData(data)
            // }}
          >
            {!showMockData &&
              filteredData(data).map((entry: any, index: any) =>
                entry.enabled ? (
                  <Cell
                    fill={styles.grey}
                    cursor={"default"}
                  />
                ) : (
                  <Cell
                    fill={styles.byzantine}
                    cursor={"pointer"}
                  />
                )
              )}
          </Bar>
          <XAxis
            dataKey="name"
            hide
          />
          <YAxis hide />
          {!showMockData && (
            <Tooltip
              cursor={false}
              position={{ x: -60, y: -10 }}
              content={(props) => TooltipContent(props)}
            />
          )}
        </BarChart>

        <Typography.Text ellipsis>
          <span style={{ color: count ? styles.secondaryGreen : styles.primary }}>{count ? `+${count}` : 0}</span>
          &nbsp; in {moment().format("MMM")}
        </Typography.Text>
      </>
    );
  }
  return <></>;
};
