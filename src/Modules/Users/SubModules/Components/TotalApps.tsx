import { MetricsCard } from "@components/index";
import styles from "@styles/variables.module.scss";

export const TotalApps = ({ apps }: { apps: number }) => {
  return (
    <MetricsCard
      style={{ height: "100%" }}
      icon={"tabler:arrows-minimize"}
      iconColor={styles.strawberry}
      title={<span style={{ color: styles.gray }}>Active Contracts</span>}
      totalCount={<span style={{ color: styles.primary }}>{apps}</span>}
    />
  );
};
