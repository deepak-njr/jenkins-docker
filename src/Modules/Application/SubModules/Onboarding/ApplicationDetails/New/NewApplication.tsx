import { Col, Row } from "antd";
import React, { useContext } from "react";
import { ApplicationOnboardingContext } from "../../Wrapper";
import { SingleApplication } from "./SingleApplication";

export const NewApplication = () => {
  const { formData } = useContext(ApplicationOnboardingContext);

  return (
    <Row>
      <Col span={24}>
        {(formData && formData.application.isSingle) || formData === null ? <SingleApplication /> : ""}
      </Col>
    </Row>
  );
};
