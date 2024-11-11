import { MetricsCard } from "@components/index";
import styles from "@styles/variables.module.scss";
import { Image, Space, Typography } from "antd";
import { Icon } from "@iconify/react";
import moment from "moment";
import { currencyFormat } from "@utils/CurrencyFormatter";
import { getRandomNumber } from "~/mocks/getRandomNumber";
import DocumentMedal from "@assets/SVG/document-medal.svg";
import { TinyBarGraph } from "~/mocks/TinyBarGraph";

export const TotalLicenses = ({ licenses }: { licenses: number }) => {

  return (
    <MetricsCard
      style={{ height: "100%" }}
      icon={<Image src={DocumentMedal} preview={false} />}
      iconColor={styles.strawberry}
      title={<span style={{ color: styles.gray }}>Total Licenses</span>}
      totalCount={<span style={{ color: styles.primary }}>{licenses}</span>}
      graph={
        <Space direction="vertical" style={{ display: "flex" }}>
          <TinyBarGraph count={currencyFormat(getRandomNumber(), true)} />
        </Space>
      }
    />
  );
};
