import React, { ReactElement, ReactNode } from "react";
import { Card, Spin, Typography } from "antd";
import styles from "./WrapperCard.module.scss";
import cs from "classnames";

type PropsType = {
  title?: any;
  subTitle?: any;
  action?: ReactElement;
  children: ReactNode;
  loading?: boolean;
  smallHeader?: boolean;
  customTitle?: boolean;
  bodyClass?: string;
};

export const WrapperCard = ({
  title,
  subTitle,
  action,
  children,
  loading,
  smallHeader = false,
  customTitle = false,
  bodyClass = "",
}: PropsType) => {
  return (
    <Card
      style={{ height: "100%" }}
      {...(smallHeader && {
        headStyle: {
          height: "40px",
        },
      })}
      {...(title && {
        title: customTitle ? (
          title
        ) : (
          <>
            <Typography.Title level={4} className={styles.headerheadingText}>
              {title}
            </Typography.Title>
            {subTitle && (
              <Typography.Text className={styles.subHeadingTitle}>
                {subTitle}
              </Typography.Text>
            )}
          </>
        ),
      })}
      className={cs(styles.cardStyle, bodyClass)}
      extra={action}
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
