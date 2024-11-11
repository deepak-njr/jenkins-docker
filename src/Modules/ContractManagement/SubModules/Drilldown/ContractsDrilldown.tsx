import { Space, Tabs, Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ContentWrapper } from "@components/index";
import { Icon } from "@iconify/react";
import { OverView } from "./OverView/OverView";
import { StatusInformation } from "./StatusInformation/StatusInformation";
import { get } from "~/Services";
import styles from "../../Contract.module.scss";
import { useNotification } from "@hooks/useNotification";
import { useQuery } from "@hooks/useQuery";

export const ContractsDrilldown = () => {
  const { id } = useParams();
  const query = useQuery();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isRecipientsLoading, setIsRecipientsLoading] = useState(false);
  const [isDocumentsLoading, setIsDocumentsLoading] = useState(false);
  const { openToast } = useNotification();
  const [data, setData] = useState<{ [key in string]: any }>({});
  const [recipients, setReceipients] = useState<any>({});
  const [documents, setDocuments] = useState<any>({});

  useEffect(() => {
    if (!query.get("activeTab")) {
      navigate(`/clm/contracts/view/${id}?activeTab=contractInformation`, {
        replace: true,
      });
    }
  }, []);

  useEffect(() => {
    if (id) {
      getEnvelopeDetails();
      getRecipients();
      getDocuments();
    }
  }, [id]);

  const getEnvelopeDetails = () => {
    setIsLoading(true);
    get(`v1/clm/detail?envelopeId=${id}`)
      .then((res: any) => {
        setIsLoading(false);
        if (res.response.data) {
          setData(res.response.data);
        }
      })
      .catch((err) => {
        openToast({
          content: "Getting Contract Details failed",
          type: "error",
        });
        setIsLoading(false);
      });
  };
  //2087
  const getRecipients = () => {
    setIsRecipientsLoading(true);
    get(`v1/clm/listEnvelopeRecipients/${id}`)
      .then((res: any) => {
        if (res.status === "OK" && res.response && res.response.data) {
          setReceipients(res.response.data);
        }
        setIsRecipientsLoading(false);
      })
      .catch((err) => {
        setIsRecipientsLoading(false);
      });
  };

  const getDocuments = () => {
    setIsDocumentsLoading(true);
    get(`v1/clm/getEnvelopeDocumentDetails/${id}`)
      .then((res: any) => {
        if (res.status === "OK" && res.response.data) {
          setDocuments(res.response.data);
        }
        setIsDocumentsLoading(false);
      })
      .catch((err) => {
        setIsDocumentsLoading(false);
      });
  };
  const items = [
    {
      label: "Contract Information",
      key: "contractInformation",
      children: (
        <OverView
          data={data}
          recipients={recipients}
          documents={documents}
          id={id}
        />
      ),
    },
    {
      label: "Status Information",
      key: "statusInformation",
      children: (
        <StatusInformation
          data={data}
          recipients={recipients}
          documents={documents}
          id={id}
        />
      ),
    },
  ];
  return (
    <ContentWrapper
      loading={isLoading || isRecipientsLoading || isDocumentsLoading}
      customTitle={
        <Space style={{ alignItems: "center", lineHeight: 1 }}>
          <Icon
            onClick={() => navigate("/clm/contracts")}
            icon="akar-icons:arrow-left"
            style={{
              fontSize: "1.8rem",
              cursor: "pointer",
              color: styles.primary,
              marginRight: styles.whitespace1,
            }}
          />
          <Typography.Title
            level={3}
            style={{ margin: 0 }}
          >
            {/* {data.contractName} */}
            Contract & Document Details
          </Typography.Title>
        </Space>
      }
    >
      <Tabs
        items={items}
        activeKey={query.get("activeTab") || ""}
        onChange={(activeKey) => navigate(`/clm/contracts/view/${id}?activeTab=${activeKey}`)}
      ></Tabs>
    </ContentWrapper>
  );
};
