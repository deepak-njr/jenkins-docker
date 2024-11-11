import { MetricsCard } from "@components/index";
import styles from "@styles/variables.module.scss";
import { Image, Typography } from "antd";
import DocumentSigned from "@assets/SVG/document-signed.svg";
import { Link } from "react-router-dom";
import { useHasAccess } from "~/Hooks/useHasAccess";
import { getPermissions, permissions } from "~/Utils/Roles";



export const ActiveContracts = ({
  contracts,
  applicationId,
  applicationLogo,
  applicationName,
  departmentName,
}: {
  contracts: number;
  applicationId: string;
  applicationLogo: string;
  applicationName: string;
  departmentName: string;
}) => {
  const { hasPermissions } = useHasAccess();

  return (
    <MetricsCard
      style={{ height: "100%" }}
      icon={<Image src={DocumentSigned} preview={false} />}
      iconColor={styles.strawberry}
      title={<span style={{ color: styles.gray }}>Active Contracts</span>}
      totalCount={<span style={{ color: styles.primary }}>{contracts}</span>}
      graph={
        hasPermissions([permissions.ADD_CONTRACT]) && (
          <Typography.Text style={{ fontSize: "14px" }}>
            <b>
              <Link
                to={`/applications/${applicationId}/contracts/add`}
                state={{
                  applicationLogo,
                  applicationName,
                  departmentName,
                }}
              >
                Add More
              </Link>
            </b>
          </Typography.Text>
        )
      }
    />
  );
};
