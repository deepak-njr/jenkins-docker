import { Icon } from "@iconify/react";
import { WrapperCard, DataTable, PDFViewer } from "~/Components";
import { useNavigate } from "react-router-dom";
import { Col, Row, Typography, Space, Image, Steps, Card, Comment, Avatar, Button } from "antd";
import styles from "../../../../Contract.module.scss";
import moment from "moment";
import { useHasAccess } from "~/Hooks/useHasAccess";
import { ReactNode, useEffect, useState } from "react";
import { map, isEmpty, toUpper, orderBy } from "lodash";
import { EnvelopActivity } from "../EnvelopActivity";
import { get } from "~/Services";
import { getColoriezedValue } from "~/Utils/getColorizedValue";

export const ContractTable = ({ id, contract, recipients }: { id: any; contract: any; recipients: any }) => {
  const navigate = useNavigate();
  const { hasPermissions } = useHasAccess();
  const [signerList, setSignerList] = useState<any>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [openModal, setOpenModal] = useState(false);
  const [data, setData] = useState<{ [key in string]: any }>({});

  useEffect(() => {
    //2087
    get(`v1/clm/enevelope/${id}`).then((res: any) => {
      if (res.status === "OK" && res.response && res.response.data) {
        let events = res.response.data.auditEvents;
        let arr: any = [];
        events.map((item: any) => {
          if (item.eventFields) {
            let obj: any = {};
            item.eventFields.map((event: any) => {
              obj[event.name] = event.value;
            });
            arr.push(obj);
          }
        });
        setData(arr);
      }
    });
  }, []);
  const getItemText = (name: string, value: any, className = "", style = {}) => {
    if (value === "Invalid date") value = "-";
    return (
      <Space
        direction="vertical"
        style={{ marginBottom: styles.whitespace4 }}
        className={className}
      >
        <Typography.Text type="secondary">{name}</Typography.Text>
        <Typography.Text style={{ color: styles.primary, ...style }}>{value}</Typography.Text>
      </Space>
    );
  };

  const getDiffDate = () => {
    let diff: any = moment(contract.completedDate).diff(contract.createdDate, "days");
    if (Number.isNaN(diff)) {
      return "-";
    }
    let endTime = moment(contract.completedDate);
    let startTime = moment(contract.createdDate);
    var hrs = moment.utc(endTime.diff(startTime)).format("HH") + " Hrs";
    var min = moment.utc(endTime.diff(startTime)).format("mm") + " Mins";
    var sec = moment.utc(endTime.diff(startTime)).format("ss") + " Secs";
    let formattedDiff = [hrs, min, sec].join(" : ");
    return diff + " Days " + formattedDiff;
  };

  const renderSigner = (signer: any) => {
    let avatarName = "";
    if (signer.name) {
      avatarName = signer.name
        .split(" ")
        .map((item: any) => {
          return toUpper(item[0]);
        })
        .join("");
    }
    return (
      <Comment
        author={
          <Typography.Title
            level={5}
            style={{
              color: signer.signedDateTime ? styles.primary : styles.gray,
            }}
          >
            {signer.name} ({signer.email})
          </Typography.Title>
        }
        style={{ paddingTop: 0 }}
        avatar={
          <Avatar
            style={{
              background: signer.signedDateTime ? styles.primary : styles.gray,
            }}
          >
            {avatarName}
          </Avatar>
        }
        content={
          <>
            {signer.signedDateTime ? (
              <p>Signed At: {moment(signer.signedDateTime).format("DD MMM YYYY HH:mm:ss")}</p>
            ) : (
              <p className={signer.sentDateTime ? "" : "d-none"}>
                Sent At: {moment(signer.sentDateTime).format("DD MMM YYYY HH:mm:ss")}
              </p>
            )}
          </>
        }
      />
    );
  };

  useEffect(() => {
    if (!isEmpty(recipients)) {
      let arr: any = [];
      let _currentStep = 0;
      let signers = [...recipients.signers];
      signers = orderBy(
        signers,
        (o: any) => {
          return o.signedDateTime && moment(o.signedDateTime);
        },
        ["asc"]
      );
      signers.map((signer: any, index: number) => {
        let obj = {
          title: renderSigner(signer),
          description: "",
        };
        if (signer.signedDateTime) {
          _currentStep = index + 1;
          if (index + 1 === recipients.signers.length) {
            _currentStep += 1;
          }
        }
        arr.push(obj);
      });
      setCurrentStep(_currentStep);
      setSignerList(arr);
    }
  }, [recipients]);

  const Item = (
    <>
      <WrapperCard
        title={"Contract Details"}
        bodyClass="h-inherit"
        smallHeader
      >
        <Row>
          <Col
            md={6}
            xs={24}
          >
            {getItemText("Turn Around Time", getDiffDate())}
          </Col>

          <Col
            md={18}
            xs={24}
          >
            {getItemText("Email Subject", contract.emailSubject)}
          </Col>
          {contract.envelopeId && (
            <Col
              xs={24}
              md={6}
            >
              {getItemText("Envelope ID", contract.envelopeId)}
            </Col>
          )}
          <Col
            xs={24}
            md={6}
          >
            {getItemText("Sender Name", contract.senderName)}
          </Col>
          <Col
            xs={24}
            md={6}
          >
            {getItemText("Sender Email", contract.senderEmail)}
          </Col>

          <Col
            xs={24}
            md={6}
          >
            {getItemText("Created Date", moment(contract.createdDate).format("DD MMM YYYY HH:mm:ss"))}
          </Col>

          <Col
            xs={24}
            md={6}
          >
            {getItemText("Delivered Date", moment(contract.deliveredDate).format("DD MMM YYYY HH:mm:ss"))}
          </Col>

          {contract.expireDateTime && (
            <Col
              xs={24}
              md={6}
            >
              {getItemText("Expiry Date", moment(contract.expiryDate).format("DD MMM YYYY HH:mm:ss"), "", {
                color: styles.strawberry,
              })}
            </Col>
          )}

          {/* {contract.lastModifiedDateTime && (
            <Col xs={24} md={6}>
              {getItemText(
                "Last Modified Date",
                moment(contract.lastModifiedDateTime).format(
                  "DD MMM YYYY HH:mm:ss"
                )
              )}
            </Col>
          )} */}

          <Col
            xs={24}
            md={6}
          >
            {getItemText("Completed Date", moment(contract.completedDate).format("DD MMM YYYY HH:mm:ss"))}
          </Col>

          <Col
            xs={24}
            md={6}
          >
            {getItemText("Document Expiry Date", moment(contract.expiryDate).format("DD MMM YYYY HH:mm:ss"))}
          </Col>

          <Col
            xs={24}
            md={24}
          >
            {getItemText("Status", getColoriezedValue(contract.status), "mb-0")}
          </Col>
        </Row>
      </WrapperCard>
      {recipients && recipients.signers && (
        <div style={{ marginTop: 24 }}>
          <Row style={{ alignItems: "center" }}>
            <Typography.Title style={{ fontSize: 20, margin: 9 }}>
              Reviewer, Signers List & Signing Status
            </Typography.Title>
            <Button onClick={() => setOpenModal(true)}>
              View E-Signature History
              <Icon
                icon="ri:arrow-right-up-line"
                style={{
                  margin: "auto",
                }}
              />
            </Button>
          </Row>
          <EnvelopActivity
            data={data}
            openModal={openModal}
            setOpenModal={(value) => {
              setOpenModal(value);
            }}
          />
          <Steps
            progressDot
            current={currentStep}
            direction="vertical"
            className="signersList"
            items={[
              {
                title: "Start",
                description: "",
              },
              ...signerList,
              {
                title: "End",
                description: "",
              },
            ]}
          />
        </div>
      )}
      {recipients && recipients.carbonCopies && (
        <WrapperCard
          title={"Watchers List"}
          bodyClass="h-inherit"
          smallHeader
        >
          <Row>
            <Col span={24}>
              <DataTable
                height={400}
                multiSelect={false}
                tableData={map(recipients.carbonCopies, (license, i) => ({
                  ...license,
                  key: i,
                }))}
                columns={[
                  {
                    title: "Name",
                    dataIndex: "name",
                    render: (value: any) => value || <Typography.Text disabled>-</Typography.Text>,
                    sorter: (a: any, b: any) => (a.name || "").localeCompare(b.name || ""),
                  },
                  {
                    title: "Email Address",
                    dataIndex: "email",
                    render: (value: any) => value || <Typography.Text disabled>-</Typography.Text>,
                    sorter: (a: any, b: any) => (a.email || "").localeCompare(b.email || ""),
                  },
                  {
                    title: "Delivered At",
                    dataIndex: "deliveredDateTime",
                    render: (value: any) =>
                      value ? (
                        <Typography.Text>{moment(value).format("DD MMM YYYY HH:mm:ss")}</Typography.Text>
                      ) : (
                        <Typography.Text disabled>-</Typography.Text>
                      ),
                    ellipsis: true,
                    sorter: (a: any, b: any) =>
                      Number(new Date(a.deliveredDateTime)) - Number(new Date(b.deliveredDateTime)),
                  },
                ]}
                showTopBar={false}
              />
            </Col>
          </Row>
        </WrapperCard>
      )}
    </>
  );
  return Item;
};
