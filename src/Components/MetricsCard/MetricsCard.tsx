import React, {
  CSSProperties,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { Card, Col, Row, Skeleton, Typography } from "antd";
import { Icon } from "@iconify/react";

import { getDynamicFontSize } from "@utils/getDynamicFontSize";
import Styles from "./MetricsCard.module.scss";

type Props = {
  icon: string | ReactNode;
  iconColor?: string;
  title: string | React.ReactNode;
  totalCount: string | React.ReactNode;
  graph?: React.ReactNode;
  horizotalGraph?: React.ReactNode;
  style?: CSSProperties;
  isLoading?: boolean;
};

export const MetricsCard = ({
  icon,
  title,
  totalCount,
  graph,
  horizotalGraph,
  iconColor,
  style,
  isLoading,
}: Props) => {
  const [contianerWidth, setContainerWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const getSize = () => {
    if (ref.current) {
      setContainerWidth(ref.current.getBoundingClientRect().width);
    }
  };

  useEffect(() => {
    if (ref.current) {
      getSize();
      window.addEventListener("resize", () => getSize());
    }
  }, [ref]);
  return (
    <Card
      className={Styles.container}
      style={{
        ...style,
        height: "100%",
      }}
      bodyStyle={{ width: "100%" }}
    >
      <Row gutter={8} align="stretch">
        <Col
          span={6}
          ref={ref}
          style={{ display: "inline-flex", justifyContent: "center" }}
        >
          <div
            className={Styles.containerLeft}
            style={{
              padding: contianerWidth * 0.05,
            }}
          >
            {typeof icon === "string" ? (
              <Icon
                icon={icon}
                style={{ fontSize: 42, ...(iconColor && { color: iconColor }) }}
              />
            ) : (
              icon
            )}
          </div>
        </Col>
        <Col span={graph ? 12 : 18}>
          <div
            style={{
              paddingLeft: contianerWidth * 0.09,
              display: "flex",
              height: "100%",
              flexDirection: "column",
            }}
          >
            <Typography.Text strong className={Styles.containerText} ellipsis>
              {title}
            </Typography.Text>
            {horizotalGraph && (
              <Col>
                {isLoading ? (
                  <Skeleton.Input
                    active={true}
                    size="small"
                    block={true}
                    // className={Styles.containerNumber}
                    style={{ marginTop: "auto" }}
                  />
                ) : (
                  horizotalGraph
                )}
              </Col>
            )}
            {!horizotalGraph && (
              <div
                style={{
                  marginTop: "auto",
                  minHeight: 36,
                  display: "flex",
                  alignItems: "end",
                }}
              >
                {isLoading ? (
                  <Skeleton.Input
                    active={true}
                    size="small"
                    block={true}
                    // className={Styles.containerNumber}
                    style={{ marginTop: "auto" }}
                  />
                ) : (
                  <Typography.Title
                    level={2}
                    className={Styles.containerNumber}
                    ellipsis
                  >
                    {totalCount}
                  </Typography.Title>
                )}
              </div>
            )}
          </div>
        </Col>
        {graph && (
          <Col
            span={6}
            style={{
              display: "inline-flex",
              alignItems: "end",
              justifyContent: "center",
            }}
          >
            {isLoading ? (
              <Skeleton.Avatar
                active={true}
                size="large"
                shape="square"
                style={{ height: 48, width: 48 }}
              />
            ) : (
              graph
            )}
          </Col>
        )}
      </Row>
    </Card>
  );
};
