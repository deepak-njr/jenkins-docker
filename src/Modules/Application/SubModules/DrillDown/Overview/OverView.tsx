import { Row, Col } from "antd";

import {
  ActiveUsers,
  AverageMonthlySpend,
  AverageUsage,
  TotalSpend,
  ActiveContracts,
  BasicInfo,
  SpendComparison,
  UsageByDept,
} from "./Components";
import styles from "@styles/variables.module.scss";
import { TotalLicenses } from "./Components/TotalLicenses";
import { AssignedLicenses } from "./Components/AssignedLicenses";
import { UnAssignedLicenses } from "./Components/UnAssignedLicenses";
import { UpcomingRenwalsContracts } from "./Components/UpcomingRenewalContracts";

interface Props {
  applicationId: string;
  adminAvgCost: number;
  adminCost: number;
  applicationAvgUsage: number;
  applicationActiveUserCount: number;
  applicationActiveContracts: number;
  applicationUpcomingRenewal: string;
  applicationCategory: string;
  applicationDepartment: string;
  applicationOwner: string;
  applicationOwnerEmail: string;
  secondaryOwnerEmail:string;
  applciationStatus: string;
  autoRenew: boolean;
  applicationLink: string;
  currencySymbol: string;
  applicationReminderDate?: number;
  totalLicenses: number;
  mappedLicenses: number;
  unmappedLicenses: number;
  contractId?: string;
  refreshData: () => void;
  applicationName: string;
  applicationLogo: string;
}

export const OverView = (props: Props) => {
  const {
    applicationId,
    adminAvgCost,
    adminCost,
    applicationAvgUsage,
    applicationActiveUserCount,
    applicationActiveContracts,
    applicationUpcomingRenewal,
    applicationCategory,
    applicationDepartment,
    applicationOwner,
    applicationOwnerEmail,
    secondaryOwnerEmail,
    applciationStatus,
    autoRenew,
    applicationLink,
    applicationReminderDate,
    totalLicenses,
    currencySymbol,
    mappedLicenses,
    unmappedLicenses,
    contractId,
    applicationName,
    applicationLogo,
    ...res
  } = props;

  return (
    <Row gutter={16} style={{ marginRight: styles.whitespace2 }}>
      <Col span={24}>
        <Row gutter={16} align="stretch">
          <Col
            xs={24}
            md={24}
            lg={8}
            style={{ marginBottom: styles.whitespace2 }}
          >
            <TotalSpend amount={adminCost} currency={currencySymbol} />
          </Col>
          <Col
            xs={24}
            md={24}
            lg={8}
            style={{ marginBottom: styles.whitespace2 }}
          >
            <AverageMonthlySpend
              amount={adminAvgCost}
              currency={currencySymbol}
            />
          </Col>
          <Col
            xs={24}
            md={24}
            lg={8}
            style={{ marginBottom: styles.whitespace2 }}
          >
            <AverageUsage usage={applicationAvgUsage} />
          </Col>
        </Row>
        <Row gutter={16} align="stretch">
          <Col
            xs={24}
            md={24}
            lg={8}
            style={{ marginBottom: styles.whitespace2 }}
          >
            <ActiveUsers users={applicationActiveUserCount} />
          </Col>
          <Col
            xs={24}
            md={24}
            lg={8}
            style={{ marginBottom: styles.whitespace2 }}
          >
            <ActiveContracts
              contracts={applicationActiveContracts}
              applicationId={applicationId}
              applicationLogo={applicationLogo}
              applicationName={applicationName}
              departmentName={applicationDepartment}
            />
          </Col>
          <Col
            xs={24}
            md={24}
            lg={8}
            style={{ marginBottom: styles.whitespace2 }}
          >
            <UpcomingRenwalsContracts applicationId={applicationId} />
          </Col>
        </Row>
        <Row gutter={16} align="stretch">
          <Col
            xs={24}
            md={24}
            lg={8}
            style={{ marginBottom: styles.whitespace2 }}
          >
            <TotalLicenses licenses={totalLicenses} />
          </Col>
          <Col
            xs={24}
            md={24}
            lg={8}
            style={{ marginBottom: styles.whitespace2 }}
          >
            <AssignedLicenses assignedLicenses={mappedLicenses} />
          </Col>
          <Col
            xs={24}
            md={24}
            lg={8}
            style={{ marginBottom: styles.whitespace2 }}
          >
            <UnAssignedLicenses
              applicationId={applicationId}
              unAssignedLicenses={unmappedLicenses}
            />
          </Col>
        </Row>
        <Row gutter={16} align="stretch">
          <Col xs={24} md={24} style={{ marginBottom: styles.whitespace2 }}>
            <BasicInfo
              owner={applicationOwnerEmail}
              secondaryOwnerEmail={secondaryOwnerEmail}
              category={applicationCategory}
              department={applicationDepartment}
              status={applciationStatus}
              appLink={applicationLink}
              refreshData={res.refreshData}
            />
          </Col>
        </Row>
        {/* <Row gutter={16}>
          <Col span={24}>
            <SpendComparison />
          </Col>
        </Row> */}
      </Col>
    </Row>
  );
};
