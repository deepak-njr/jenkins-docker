import { MetricsCard } from "@components/index";
import styles from "@styles/variables.module.scss";
import { Typography, Image } from "antd";
import { Link } from "react-router-dom";
import DocumentSigned from "@assets/SVG/document-signed.svg";
import { useHasAccess } from "~/Hooks/useHasAccess";
import { permissions } from "~/Utils/Roles";

export const UnAssignedLicenses = ({
  unAssignedLicenses,
  applicationId,
}: {
  unAssignedLicenses: number;
  applicationId: string;
}) => {
  const { hasPermissions } = useHasAccess();
  return (
    <MetricsCard
      style={{ height: "100%" }}
      icon={<Image src={DocumentSigned} preview={false} />}
      iconColor={styles.strawberry}
      title={<span style={{ color: styles.gray }}>Unassigned Licenses</span>}
      totalCount={
        <span style={{ color: styles.primary }}>{unAssignedLicenses}</span>
      }
      {...(hasPermissions([permissions.ADD_APPLICATION]) && {
        graph: (
          <Typography.Text style={{ fontSize: "14px" }}>
            <b>
              <Link to={`/applications/${applicationId}?activeTab=licenses`}>
                Map Licences
              </Link>
            </b>
          </Typography.Text>
        ),
      })}
    />
  );
};
