import React from "react";
import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

interface PageNotExist {
    reDirect: any;
  }

const PageNotExist = () => {
  const noDataFound = localStorage.getItem("pageNotExist")
  const navigate = useNavigate();
  return (
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={
        <Button
          onClick={() => navigate(`${noDataFound}`)}
          type="primary"
        >
          Back
        </Button>
      }
    />
  );
};

export default PageNotExist;
