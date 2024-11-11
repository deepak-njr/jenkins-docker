import { Image, Button, Space, Modal, Select, Tag } from "antd";
import { map } from "lodash";
import { useEffect, useState } from "react";
import { useNotification } from "~/Hooks/useNotification";
import { get, put } from "~/Services";
import { imageKey } from "~/Utils";

const getLogo = (value: string) => {
  switch (value) {
    case "Azure AD":
      return `https://saaspemedia.blob.core.windows.net/images/logos/svg/azure-ad.svg${imageKey}`;
    default:
      return ``;
  }
};

interface Props {
  data: { [key in string]: any };
  refreshData: () => void;
}

export const ConnectToSSO = ({ data, refreshData }: Props) => {
  const { openNotification, openToast } = useNotification();
  const [selectedApp, setSelectedApp] = useState("");
  const [applications, setApplications] = useState([]);
  const [openApplicationModal, setOpenApplicationModal] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const submitMapping = () => {
    setIsSubmitLoading(true);
    put("/admin/application/link", {
      appId: data.applicationId,
      graphAppId: selectedApp,
    })
      .then((res: any) => {
        if (res.status === "OK") {
          openNotification({
            title: "Success",
            message: "Application Mapping success",
            type: "success",
          });
          setIsSubmitLoading(true);
        }

        setOpenApplicationModal(false);
        refreshData();
        setIsSubmitLoading(false);
      })
      .catch(() => {
        setIsSubmitLoading(false);

        setOpenApplicationModal(false);
      });
  };

  useEffect(() => {
    if (openApplicationModal) {
    }
  }, [openApplicationModal]);

  const getApplicationDetails = () => {
    setIsLoading(true);
    get(`/admin/application?applicationName=${data.applicationName}`)
      .then((res: any) => {
        if (res.response.data) {
          setApplications(res.response.data);
          setOpenApplicationModal(true);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  return (
    <>
      <Modal
        open={openApplicationModal}
        title={`Map ${data.applicationName} with Azure AD`}
        width={300}
        closeIcon={false}
        maskClosable={false}
        onCancel={() => setOpenApplicationModal(false)}
        onOk={submitMapping}
        confirmLoading={isSubmitLoading}
      >
        <Select
          style={{ width: "100%" }}
          onChange={(e) => setSelectedApp(e)}
          showSearch
          filterOption={(inputValue, option: any) =>
            option.children && inputValue && option.children.toLowerCase().includes(inputValue.toLowerCase())
          }
        >
          {applications.map((app: any) => (
            <Select.Option value={app.appId}>{app.appDisplayName}</Select.Option>
          ))}
        </Select>
      </Modal>
      {data.isSsoIntegrated && !data.isApplicationMapped ? (
        <Button
          type="default"
          onClick={() => getApplicationDetails()}
          loading={isloading}
        >
          <Space>
            Connect with {data.identityProvider}
            <Image
              src={getLogo(data.identityProvider)}
              style={{ height: 20 }}
              preview={false}
            />
          </Space>
        </Button>
      ) : (
        <Tag
          color="green"
          style={{ marginLeft: 4 }}
        >
          Connected with {data.identityProvider}
        </Tag>
        // <Button type="default">
        //   <Space>
        //     Disconnect from {data.identityProvider}
        //     <Image
        //       src={getLogo(data.identityProvider)}
        //       style={{ height: 20 }}
        //       preview={false}
        //     />
        //   </Space>
        // </Button>
      )}
    </>
  );
};
