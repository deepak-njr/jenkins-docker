import { Icon } from "@iconify/react";
import { Space, Typography, Modal, Row, Col, Image, Avatar, Input, Select, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { get, put, remove } from "@services/api.service";
import { DataTable } from "@components/index";
import { useNotification } from "@hooks/useNotification";
import DeleteInfoGraphic from "@assets/SVG/deleteConfirmation.svg";
import { imageKey } from "@utils/Constants";

import styles from "./Users.module.scss";
import { cloneDeep, filter, isEmpty, map, some } from "lodash";

const { confirm } = Modal;

interface Props {
  refreshUsers: () => void;
  removeUserID: string;
  setRemoveUserID: () => void;
  removeUserName: string;
  remoseUserEmail: string;
}

export const UserTransferOwner = ({
  refreshUsers,
  removeUserID,
  setRemoveUserID,
  removeUserName,
  remoseUserEmail,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { openNotification, openToast } = useNotification();
  const [callApi, setCallAPI] = useState("");
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferOwner, setTransferOwner] = useState<{ [key in string]: any }>({});
  const [transferData, setTransferData] = useState<{ [key in string]: any }>({});

  const [userList, setUserList] = useState<any>([]);

  useEffect(() => {
    if (removeUserID) {
      setCallAPI(removeUserID);
    }
    return () => setShowTransfer(false);
  }, []);

  useEffect(() => {
    if (callApi) handleTransferOwner();
  }, [callApi]);

  const handleTransferOwner = () => {
    get(`v1/user/details/ownership/list?userId=${removeUserID}`).then((res: any) => {
      if (res.response.data) {
        if (res.response.data.isOwner === false) {
          confirm({
            className: styles.confirmModal,
            title: "",
            icon: "",
            onCancel: () => setRemoveUserID(),
            content: (
              <Row
                gutter={16}
                style={{ textAlign: "center" }}
              >
                <Col span={24}>
                  <Image
                    src={DeleteInfoGraphic}
                    preview={false}
                  />
                </Col>
                <Col span={24}>
                  <Typography.Text>
                    Are you sure to delete&nbsp;
                    <Typography.Text
                      strong
                      style={{ color: styles.primary }}
                    >
                      {removeUserName}
                    </Typography.Text>
                    &nbsp;user?
                  </Typography.Text>
                </Col>
              </Row>
            ),

            onOk() {
              removeUser();
            },
          });
        } else {
          get(`v1/user/details/user-details-overview?userId=${removeUserID}`)
            .then((res1: any) => {
              const userData = res1.response.data;
              if (userData) {
                setTransferOwner(userData.getUserDetailsOverview);
                get("v1/user/details/users")
                  .then((response: any) => {
                    if (response.status === "OK") {
                      setUserList(
                        filter(
                          response.response.data,
                          (userInfo) =>
                            userInfo.departmentName === userData.getUserDetailsOverview.userDepartmentName &&
                            userInfo.userEmail !== userData.getUserDetailsOverview.userEmail
                        )
                      );
                      setTransferData({
                        ...res.response.data.ownerShipDetails,
                        applicationDetails: map(res.response.data.ownerShipDetails.applicationDetails, (app) => ({
                          ...app,
                          email: userData.getUserDetailsOverview.userEmail,
                          name: userData.getUserDetailsOverview.userName,
                        })),
                        projectDetails: map(res.response.data.ownerShipDetails.projectDetails, (app) => ({
                          ...app,
                          email: userData.getUserDetailsOverview.userEmail,
                          name: userData.getUserDetailsOverview.userName,
                        })),
                        ...(!isEmpty(res.response.data.ownerShipDetails.departmentDetails) && {
                          departmentDetails: {
                            ...res.response.data.ownerShipDetails.departmentDetails,
                            email: userData.getUserDetailsOverview.userEmail,
                            name: userData.getUserDetailsOverview.userName,
                            userId: userData.getUserDetailsOverview.userId,
                          },
                        }),
                      });
                      setShowTransfer(true);
                    }
                    setIsLoading(false);
                  })
                  .catch((err) => {
                    setIsLoading(false);
                    openToast({ content: err, type: "error" });
                  });
              }
            })
            .catch((err) => {
              openToast({ content: err, type: "error" });
              setIsLoading(false);
            });
        }
      }
    });
  };
  const updateApplicaitonUser = (e: string, key: number) => {
    const { userEmail, userName } = filter(userList, (item) => item.userId === e)[0];
    const clonedData = cloneDeep(transferData);
    clonedData.applicationDetails[key] = {
      ...clonedData.applicationDetails[key],
      email: userEmail,
      name: userName,
    };

    setTransferData(clonedData);
  };
  const updateProjectUser = (e: string, key: number) => {
    const { userEmail, userName } = filter(userList, (item) => item.userId === e)[0];
    const clonedData = cloneDeep(transferData);
    clonedData.projectDetails[key] = {
      ...clonedData.projectDetails[key],
      email: userEmail,
      name: userName,
    };

    setTransferData(clonedData);
  };

  const getTableHeight = (data: any[]) => (data.length * 50 + 100 > 300 ? 300 : data.length * 50 + 100);

  const disabled =
    some(transferData.applicationDetails, (details) => details.email === transferOwner.userEmail) ||
    (transferData.departmentDetails && transferData.departmentDetails.email === transferOwner.userEmail);

  const transferAndDelete = () => {
    put("v1/user/details/ownership/transfer", {
      applicationDetails: map(transferData.applicationDetails, (appDetail) => ({
        applicationId: appDetail.applicationId,
        applicationOwnerEmail: appDetail.email,
      })),
      ...(!isEmpty(transferData.departmentDetails)
        ? {
            departmentDetails: {
              departmentId: transferOwner.userDepartmentId,
              departmentOwnerEmail: transferData.departmentDetails.email,
            },
          }
        : { departmentDetails: null }),
      ...(!isEmpty(transferData.projectDetails)
        ? {
            projectDetails: map(transferData.projectDetails, (projectDetail) => ({
              projectId: projectDetail.projectId,
              projectOwnerEmail: projectDetail.email,
            })),
          }
        : { projectDetails: null }),
    })
      .then((res: any) => {
        removeUser();
      })
      .catch((err) => openToast({ content: err, type: "error" }));
  };

  const removeUser = () => {
    remove("v1/user/details/multiple-remove", {
      userRemovalRequest: [{
        userEmail: remoseUserEmail,
        hasCustomFields: false,
        customFields: [],
      }],
    })
      .then(() => {
        openNotification({
          message: "Record Deleted",
          title: "Success",
          type: "success",
        });
        setRemoveUserID();
        refreshUsers();
      })
      .catch((err) =>
        openToast({
          content: err,
          type: "error",
        })
      );
  };
  return (
    <Modal
      maskClosable={false}
      confirmLoading={isLoading}
      centered
      width={window.innerWidth * 0.7}
      open={showTransfer}
      okButtonProps={{
        disabled: userList.length <= 0 || disabled,
      }}
      onOk={transferAndDelete}
      okText="Transfer &amp; Delete User"
      onCancel={() => {
        setRemoveUserID();
        setShowTransfer(false);
      }}
      bodyStyle={{
        maxHeight: window.innerHeight * 0.8,
        overflowY: "auto",
      }}
      title={
        <Space align="start">
          <Typography.Text type="danger">
            <Icon
              icon="fluent:delete-48-regular"
              inline
              fontSize={20}
            />
          </Typography.Text>

          <Space
            direction="vertical"
            size={0}
          >
            <Typography.Title
              level={5}
              style={{ margin: 0 }}
            >
              Delete User
            </Typography.Title>
            <Typography.Text
              type="secondary"
              style={{ fontSize: 14 }}
            >
              {transferOwner.userName},
              <span
                style={{
                  marginLeft: 4,
                  fontWeight: 500,
                  color: styles.primary,
                }}
              >
                {transferOwner.userDepartmentName}
              </span>
            </Typography.Text>
          </Space>
        </Space>
      }
    >
      <Row gutter={24}>
        {transferData && !isEmpty(transferData.applicationDetails) && (
          <Col>
            <Space
              direction="vertical"
              size={0}
              style={{ marginBottom: 8 }}
            >
              <Typography.Title
                level={4}
                style={{ marginTop: 16 }}
              >
                Applications
              </Typography.Title>
              <Typography.Text style={{ marginBottom: 10 }}>
                The user is currently owner of the below applications. Please reassign the ownership to proceed with the
                deletion.
              </Typography.Text>
            </Space>

            <div>
              <DataTable
                height={getTableHeight(transferData.applicationDetails) + 100}
                showTopBar={false}
                multiSelect={false}
                columns={[
                  {
                    title: "Application Name",
                    dataIndex: "applicationId",
                    render: (value: string, record: any) => (
                      <Typography.Text>
                        <Space>
                          <Avatar
                            src={record.applicationLogo && `${record.applicationLogo}${imageKey}`}
                            shape="square"
                            icon={!record.applicationLogo && record.applicationLogo && value.slice(0, 2).toUpperCase()}
                          />
                          {record.applicationName}
                        </Space>
                      </Typography.Text>
                    ),
                  },
                  {
                    title: "Email",
                    dataIndex: "email",
                    render: (value: string, record: any) => {
                      return (
                        <Select
                          style={{ width: "100%" }}
                          value={value}
                          onSelect={(e: any) => updateApplicaitonUser(e, record.key)}
                        >
                          {userList.map((user: any) => (
                            <Select.Option value={user.userId}>{user.userEmail}</Select.Option>
                          ))}
                        </Select>
                      );
                    },
                  },
                  {
                    title: "Name",
                    dataIndex: "name",
                    render: (value: string) => (
                      <Input
                        value={value}
                        disabled
                      />
                    ),
                  },
                ]}
                tableData={transferData.applicationDetails}
              />
            </div>
          </Col>
        )}
        {transferData && !isEmpty(transferData.projectDetails) && (
          <Col>
            <Space
              direction="vertical"
              size={0}
              style={{ marginBottom: 8 }}
            >
              <Typography.Title
                level={4}
                style={{ marginTop: 16 }} 
              >
                Project
              </Typography.Title>
              <Typography.Text style={{ marginBottom: 10 }}>
                The user is currently owner of the below Project. Please reassign the ownership to proceed with the  
                deletion.
              </Typography.Text>
            </Space>

            <div>
              <DataTable
                height={getTableHeight(transferData.projectDetails) + 100}
                showTopBar={false}
                multiSelect={false}
                columns={[
                  {
                    title: "Project Name",
                    dataIndex: "projectName",
                  },
                  {
                    title: "Email",
                    dataIndex: "email",
                    render: (value: string, record: any) => {
                      return (
                        <Select
                          style={{ width: "100%" }}
                          value={value}
                          onSelect={(e: any) => updateProjectUser(e, record.key)}
                        >
                          {userList.map((user: any) => (
                            <Select.Option value={user.userId}>{user.userEmail}</Select.Option>
                          ))}
                        </Select>
                      );
                    },
                  },
                  {
                    title: "Name",
                    dataIndex: "name",
                    render: (value: string) => (
                      <Input
                        value={value}
                        disabled
                      />
                    ),
                  },
                ]}
                tableData={transferData.projectDetails}
              />
            </div>
          </Col>
        )}
        {transferData && !isEmpty(transferData.departmentDetails) && (
          <Col>
            <Space
              direction="vertical"
              size={0}
              style={{ marginBottom: 8 }}
            >
              <Typography.Title
                level={4}
                style={{ marginTop: 16 }}
              >
                Department
              </Typography.Title>
              <Typography.Text style={{ marginBottom: 10 }}>
                The user is currently owner of the below Departments. Please reassign the ownership to proceed with the
                deletion.
              </Typography.Text>
            </Space>

            <div>
              <DataTable
                height={getTableHeight(transferData.departmentDetails) + 100}
                showTopBar={false}
                multiSelect={false}
                columns={[
                  {
                    title: "Department Name",
                    dataIndex: "departmentName",
                  },
                  {
                    title: "Email",
                    dataIndex: "email",
                    render: (value: string, record: any) => {
                      return (
                        <Select
                          style={{ width: "100%" }}
                          value={value}
                          onSelect={(e: any) => {
                            setTransferData((oldData) => ({
                              ...oldData,
                              departmentDetails: {
                                ...oldData.departmentDetails,
                                email: filter(userList, (item) => item.userId === e)[0]?.userEmail,
                                name: filter(userList, (item) => item.userId === e)[0]?.userName,
                              },
                            }));
                          }}
                        >
                          {userList.map((user: any) => (
                            <Select.Option value={user.userId}>{user.userEmail}</Select.Option>
                          ))}
                        </Select>
                      );
                    },
                  },
                  {
                    title: "Name",
                    dataIndex: "name",
                    render: (value: string) => (
                      <Input
                        readOnly
                        value={value}
                        disabled
                      />
                    ),
                  },
                ]}
                tableData={[
                  {
                    ...transferData.departmentDetails,
                    key: transferData.departmentDetails.departmentName,
                  },
                ]}
              />
            </div>
          </Col>
        )}
        {userList <= 0 && (
          <Typography.Text
            type="danger"
            style={{ textAlign: "right", marginLeft: "auto" }}
          >
            <Tooltip
              color={styles.white}
              arrowPointAtCenter
              overlayInnerStyle={{
                color: styles.black,
              }}
              title="This user owns a department and no other member to transfer ownership. Please create new user under this department and try again"
            >
              <Icon
                icon="akar-icons:circle-alert-fill"
                rotate={2}
              />
            </Tooltip>
            This user can't be deleted
          </Typography.Text>
        )}
      </Row>
    </Modal>
  );
};
