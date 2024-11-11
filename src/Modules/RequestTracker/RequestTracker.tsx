import { useEffect, useState, useRef } from "react";
import { ContentWrapper, DataTable } from "@components/index";
import { Avatar, Button, Modal, Space, Typography, Tabs, TableColumnsType } from "antd";
import { get } from "@services/api.service";
import styles from "./RequestTracker.module.scss";
import { has } from "lodash";
import { useNotification } from "~/Hooks/useNotification";
import { useQuery } from "~/Hooks/useQuery";
import { imageKey } from "~/Utils/Constants";
import { useNavigate } from "react-router-dom";
import { OverView, Applications, Users } from "../Departments/SubModules";

export const RequestTracker = () => {
  const [data, setData] = useState<{ [key in string]: any }>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { openToast } = useNotification();
  const query = useQuery();
  const [tabPanelHeight, setTabPanelHeight] = useState<number | string>("auto");
  const navigate = useNavigate();

  const [screenSize, getDimension] = useState({
    dynamicWidth: window.innerWidth,
    dynamicHeight: window.innerHeight,
  });
  const setDimension = () => {
    getDimension({
      dynamicWidth: window.innerWidth,
      dynamicHeight: window.innerHeight,
    });
  };

  useEffect(() => {
    window.addEventListener("resize", setDimension);

    return () => {
      window.removeEventListener("resize", setDimension);
    };
  }, [screenSize]);

  useEffect(() => {
    if (!query.get("activeTab")) {
      navigate(`/track-requests?activeTab=user`);
    } else {
      setIsLoading(true);
      get(`v1/dashboard/request-tracking/list-view?category=${query.get("activeTab")}`)
        .then((res: any) => {
          if (res.response.data) {
            setData(res.response.data);
          } else {
            setData([]);
          }
          setIsLoading(false);
        })
        .catch((err) => openToast({ content: err, type: "error" }));
    }
  }, [query]);

  const openModal = (content: string) =>
    Modal.info({
      title: "More Details",
      content,
      icon: false,
      centered: true,
      className: styles.Comments,
      style: {
        textAlign: "center",
      },
      okText: "close",
      okButtonProps: {
        type: "primary",
        style: {
          textAlign: "center",
        },
      },
    });
  const columns: TableColumnsType = [
    {
      dataIndex: "requestId",
      title: "Request Id",
      render: (value: any, record: any, i: number) =>
        has(record, "childRequestId") ? (
          <Typography.Text>{record.childRequestId}</Typography.Text>
        ) : (
          <Typography.Text>{value}</Typography.Text>
        ),
        sorter: (a: any, b: any) => {
          const requestIdA = a.requestId || "";
          const requestIdB = b.requestId || "";
        
          const extractParts = (str: string) => str.match(/(\d+)|(\D+)/g) || [];
        
          const partsA = extractParts(requestIdA);
          const partsB = extractParts(requestIdB);
        
          for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
            const partA = isNaN(parseInt(partsA[i])) ? partsA[i] : parseInt(partsA[i]);
            const partB = isNaN(parseInt(partsB[i])) ? partsB[i] : parseInt(partsB[i]);
        
            if (partA < partB) {
              return -1;
            } else if (partA > partB) {
              return 1;
            }
          }
        
          return 0;
        },
    },
    {
      dataIndex: "onboardingRequestName",
      title: "Request Name",
      sorter: (a: any, b: any) => {
        const nameA = ((a.onboardingRequestName) || "").toLowerCase();
        const nameB = (b.onboardingRequestName || "").toLowerCase();
      
        if (nameA < nameB) {
          return -1;
        }
        if ((nameA > nameB)) {
          return 1;
        }
        return 0;
      },

      render: (value: any, record: any) => {
        return (
          <Typography.Text>
            <Space>
              {record.onboardingRequestAvatar && <Avatar src={`${record.onboardingRequestAvatar}${imageKey}`} />}

              {value}
            </Space>
          </Typography.Text>
        );
      },
    },
    {
      dataIndex: "onboardingStatus",
      title: "Status",
      sorter: (a: any, b: any) => (a.onboardingStatus || "").localeCompare(b.onboardingStatus || ""),
    },
    {
      dataIndex: "",
      title: "",
      render: (value: string, record: any) => (
        <Button
          type="link"
          onClick={() => openModal(record.onboardingComments || "--")}
          disabled={record.onboardingStatus.toLowerCase() === "pending with reviewer"}
        >
          More Details
        </Button>
      ),
    },
  ];
  const dataTable = [
    <DataTable
      columns={columns}
      {...(query.get("id") && {
        searchQuery: query.get("id") || "",
      })}
      clearSearch={() => {}}
      isLoading={isLoading}
      height={screenSize.dynamicHeight - 250}
      tableData={data.map((d: any) => ({
        ...d,
        key: d.childRequestId || d.requestId,
      }))}
      exportFileName={"Request Trackers"}
    />,
  ];

  const items = [
    {
      label: "Users",
      key: "user",
      children: dataTable,
    },
    {
      label: "Departments",
      key: "department",
      children: dataTable,
    },
    {
      label: "Applications",
      key: "application",
      children: dataTable,
    },
    {
      label: "Contracts",
      key: "contract",
      children: dataTable,
    },
    {
      label: "Projects",
      key: "project",
      children: dataTable,
    },
  ];
  return (
    <ContentWrapper title="Track Requests">
      <Tabs
        items={items}
        key={tabPanelHeight}
        style={{ height: "100%" }}
        activeKey={query.get("activeTab") || ""}
        onChange={(activeKey) => navigate(`/track-requests?activeTab=${activeKey}`)}
      ></Tabs>
    </ContentWrapper>
  );
};
