import { Button, Result } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

export const UnAuthorized = () => {
  const navigate = useNavigate();
  return (
    <Result
      style={{
        height: "100vh",
      }}
      status="403"
      title="403"
      subTitle="Sorry, you are not authorized to access this page."
      extra={
        <Button type="primary" onClick={() => (window.location.href = "/")}>
          Go Back
        </Button>
      }
    />
  );
};
