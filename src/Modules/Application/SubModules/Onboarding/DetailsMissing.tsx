import { Button, Result } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

export const DetailsMissing = () => {
  const navigate = useNavigate();
  return (
    <Result
      status="error"
      title="Applicaiton details missing"
      subTitle="Please enter the application details using below "
      extra={[
        <Button
          key="buy"
          onClick={() =>
            navigate("/applications/onboarding/application-details")
          }
        >
          Fill Application Details
        </Button>,
      ]}
    />
  );
};
