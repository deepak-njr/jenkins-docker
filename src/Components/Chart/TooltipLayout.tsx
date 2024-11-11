import { Layout, Typography } from "antd";
import { ReactNode } from "react";
import styles from "./Tooltip.module.scss";

interface Props {
  title: string;
  body: ReactNode;
}
export const TooltipLayout = ({ title, body }: Props) => {
  return (
    <Layout className={styles.TooltipWrapper}>
      <Typography.Title level={5} className={styles.Header}>
        {title}
      </Typography.Title>
      <div className={styles.Body}>{body}</div>
    </Layout>
  );
};
