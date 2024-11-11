import { Icon } from "@iconify/react";
import { Col, Row, Skeleton, Space } from "antd";
import React, { useEffect, useRef, useState } from "react";

interface Props {
  dots?: boolean;
  dotPosition?: "top-right" | "bottom-center";
  chartType?: "line" | "column" | "pie" | "table";
  chartHeight?: number;
}

export const SkeletonChart = ({
  dots = false,
  dotPosition = "top-right",
  chartType = "line",
  chartHeight = 100,
}: Props) => {
  const [width, setWidth] = useState(300);
  const getChartIcon = () => {
    switch (chartType) {
      case "line":
        return "mdi:chart-timeline-variant-shimmer";
      case "column":
        return "material-symbols:bar-chart-rounded";
      case "pie":
        return "mdi:chart-donut";
      case "table":
        return "material-symbols:table-chart";
      default:
        return "mdi:chart-timeline-variant-shimmer";
    }
  };
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      setWidth(ref.current.getBoundingClientRect().width);
    }
  }, [ref.current]);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        overflow: "hidden",
        alignItems: "center",
        gap: 16,
      }}
    >
      {dots && dotPosition === "top-right" && (
        <Row justify={"end"} style={{ width: "100%" }}>
          <Col style={{ textAlign: "right" }} span={24}>
            <Space>
              <Space>
                <Skeleton.Avatar
                  active={true}
                  size={"small"}
                  shape={"circle"}
                />
                <Skeleton.Input active={true} size={"small"} />
              </Space>
              <Space>
                <Skeleton.Avatar
                  active={true}
                  size={"small"}
                  shape={"circle"}
                />
                <Skeleton.Input active={true} size={"small"} />
              </Space>
            </Space>
          </Col>
        </Row>
      )}

      <Row style={{ marginTop: "auto", width: "100%", height: chartHeight }}>
        <Col
          span={24}
          ref={ref}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <Skeleton.Node
            active={true}
            style={{
              height: chartHeight,
              width,
              maxWidth: "100%",
            }}
          >
            <Icon icon={getChartIcon()} fontSize={60} color="#b1b1b1" />
          </Skeleton.Node>
        </Col>
      </Row>
    </div>
  );
};
