import { Col, Row } from "antd";
import styles from "@styles/variables.module.scss";
import { TotalLicenses } from "./Components/TotalLicences";
import { UpcomingRenewals } from "./Components/UpComingRenewals";
import { ContractValue } from "./Components/ContractValue";
import { ContractTable } from "./Components/ContractTable";

interface Props {
  id: any;
  data: any;
  refreshData?: (value: React.Key[]) => void;
}

export const OverView = ({ data }: Props) => {

  return (
    <Row gutter={16}>
      <Col span={24}>
        <Row gutter={16}>
          <Col style={{ marginBottom: styles.whitespace2 }} span={8}>
            <ContractValue cost={data.adminCost} currency={data.currency} />
          </Col>
          <Col style={{ marginBottom: styles.whitespace2 }} span={8}>
            <UpcomingRenewals
              renewal={data.upcomingRenewalDate}
            />
          </Col>
          <Col style={{ marginBottom: styles.whitespace2 }} span={8}>
            <TotalLicenses licenses={data.totalLicenses} />
          </Col>
        </Row>
        <Row>
          <Col>
            <ContractTable contract={data} showContractType></ContractTable>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
