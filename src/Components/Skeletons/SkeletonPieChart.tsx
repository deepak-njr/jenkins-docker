import { Avatar, Col, List, Row, Skeleton, Space } from "antd";
import { times } from "lodash";
import React from "react";
import { SkeletonChart } from "./SkeletonChart";

export const SkeletonPieChart = () => {
  return (
    <Row gutter={[16, 16]} style={{ alignItems: "center" }}>
      <Col span={12}>
        <SkeletonChart chartHeight={280} chartType="pie" />
      </Col>
      <Col span={12}>
        <Space direction="vertical" size={"large"} style={{ width: "100%" }}>
          {times(4).map((i) => (
            <div
              key={`skeleton-list-${i}`}
              style={{ width: "100%", display: "flex", gap: 16 }}
            >
              <Skeleton.Avatar active={true} size={"small"} shape={"circle"} />
              <Skeleton.Input
                active={true}
                size={"small"}
                block
                style={{ minWidth: 200 }}
              />
            </div>
          ))}
        </Space>
      </Col>
    </Row>
  );
};
