import { MetricsCard } from "@components/index";
import styles from "@styles/variables.module.scss";
import { Image, Space, Typography } from "antd";
import { Icon } from "@iconify/react";
import { useNavigate, Link } from "react-router-dom";
import Subscriptions from "@assets/SVG/shareData.svg";

export const UpcomingRenwalsContracts = ({
  applicationId,
}: {
  applicationId: string;
}) => {
  const navigate = useNavigate();

  return (
    <MetricsCard
      style={{ height: "100%" }}
      icon={<Image src={Subscriptions} preview={false} />}
      iconColor={styles.strawberry}
      title={<span style={{ color: styles.gray }}>Upcoming Renewals</span>}
      totalCount={
        <Space>
          <Typography.Text style={{ fontSize: "14px" }}>
            <b>
              <Link to={`/contracts?search=${applicationId}`}>
                View in Contracts
              </Link>
              <Icon
                style={{ marginLeft: "10px" }}
                icon="system-uicons:arrow-top-right"
              />
            </b>
          </Typography.Text>
        </Space>
      }
    />
  );
};
