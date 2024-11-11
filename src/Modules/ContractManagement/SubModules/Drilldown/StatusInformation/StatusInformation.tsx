import { Col, Row } from "antd";
import React, { useEffect, useState } from "react";
import { ContractTable } from "./Components/ContractTable";

interface Props {
  id: any;
  data: any;
  recipients: any;
  documents: any;
  refreshData?: (value: React.Key[]) => void;
}

export const StatusInformation = ({ id, data, recipients, documents }: Props) => {
  return (
    <Row gutter={16}>
      <Col span={24}>
        <ContractTable
          id={id}
          contract={data}
          recipients={recipients}
        ></ContractTable>
      </Col>
    </Row>
  );
};
