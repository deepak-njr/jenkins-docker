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

export const OverView = ({ data, recipients, id, documents }: Props) => {
  return (
    <Row gutter={16}>
      <Col span={24}>
        <ContractTable data={data} id={id} documents={documents}></ContractTable>
      </Col>
    </Row>
  );
};
