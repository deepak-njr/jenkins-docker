import { Button, Image, Space, Typography } from "antd";
import { useContext, useState } from "react";

import { AuthContext } from "~/Context/AuthContext";
import MicroSoftLogo from "@assets/SVG/microsoft.svg";
import { loginRequest } from "@utils/azure-ad-sso";
import { useMsal } from "@azure/msal-react";

interface Props {
  authFlow: string;
}
export const SignInWithAzureAD = () => {
  const { instance } = useMsal();
  const [isLoading, setIsLoading] = useState(false);
  const { isSSOLoading } = useContext(AuthContext);
  
  return (
    <Button
      size="large"
      block
      onClick={() => {
        setIsLoading(true);
        instance.loginRedirect(loginRequest);
      }}
      loading={isLoading || isSSOLoading}
    >
      <Space
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          src={MicroSoftLogo}
          preview={false}
        />
        <Typography.Text type="secondary">Login with Microsoft</Typography.Text>
      </Space>
    </Button>
  );
};
