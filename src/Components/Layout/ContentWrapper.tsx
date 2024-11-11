import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { Card, Spin, Typography } from "antd";

import styles from "./Layout.module.scss";
interface Props {
  children: React.ReactNode;
  title?: string;
  customTitle?: React.ReactNode;
  actionItems?: React.ReactNode;
  bodyStyle?: CSSProperties;
  loading?: boolean;
}

export const ContentWrapper = ({
  children,
  title,
  actionItems,
  customTitle,
  bodyStyle,
  loading = false,
}: Props) => {
  const [height, setHeight] = useState(window.innerHeight - 300);
  const [titleHeight, setTitleHeight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const customTitleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.getBoundingClientRect().height);
    }
  }, [ref]);

  useEffect(() => {
    if (height) {
      if (customTitleRef.current) {
        setTitleHeight(
          customTitleRef.current.getBoundingClientRect().height + 32 // height + paddings
        );
      } else {
        setTitleHeight(32 + 32); // Title height + paddings
      }
    }
  }, [height, customTitleRef]);

  // const childrenWithRef = React.Children.map(children, (child) => {
  //   if (React.isValidElement(child)) {
  //     return React.cloneElement(child);
  //   }
  // });

  return (
    <Card
      ref={ref}
      className={styles.ContentWrapper}
      bodyStyle={{
        ...bodyStyle,
        height: height - titleHeight,
        overflow: "auto",
      }}
      style={{ overflow: "hidden", boxSizing: "border-box" }}
      {...(!loading && {
        title: customTitle ? (
          <div ref={customTitleRef}>{customTitle}</div>
        ) : title ? (
          <Typography.Title level={3}>{title}</Typography.Title>
        ) : (
          ""
        ),
        extra: actionItems,
      })}
    >
      {loading ? (
        <span
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spin size="large" />
        </span>
      ) : (
        children
      )}
    </Card>
  );
};
