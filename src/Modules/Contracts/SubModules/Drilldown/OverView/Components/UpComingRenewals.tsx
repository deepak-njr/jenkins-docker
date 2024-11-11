import Renewals from "@assets/SVG/Wallet.svg";

import { MetricsCard } from "@components/index";
import { Icon } from "@iconify/react";
import styles from "@styles/variables.module.scss";
import { Button, DatePicker, Form, Modal, Space, Typography, Image } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { put } from "~/Services";
import { useNotification } from "~/Hooks/useNotification";
import { useParams } from "react-router-dom";

const StyledModal = styled(Modal)`
  text-align: center;
  .ant-modal-footer {
    text-align: center;
    border: 0;
  }
`;
export const UpcomingRenewals = ({ renewal }: { renewal: string; reminder?: number; refreshData?: () => void }) => {
  return (
    <MetricsCard
      style={{ height: "100%" }}
      icon={
        <Image
          src={Renewals}
          preview={false}
        />
      }
      iconColor={styles.strawberry}
      title={<span style={{ color: styles.gray }}>Upcoming Renewal</span>}
      totalCount={
        <Space>
          <span style={{ color: styles.primary }}>{moment(renewal, "YYYY-MM-DD").format("DD MMM")}</span>
        </Space>
      }
    />
  );
};
