import { Col, Row } from "antd";
import { useContext } from "react";
import { SingleApplication } from "./SingleApplication";

import { ApplicationOnboardingContext } from "../../Wrapper";
import { MultipleApplication } from "./MultipleApplication";

export const Purchased = () => {
  const { formData } = useContext(ApplicationOnboardingContext);

  return (
    <Row>
      <Col span={24}>
        {formData && formData.application.isSingle && <SingleApplication />}
        {formData && !formData.application.isSingle && <MultipleApplication />}
      </Col>
    </Row>
  );
};
