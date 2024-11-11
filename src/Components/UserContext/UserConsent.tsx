import { Button, Col, Modal, Row, Typography } from "antd";

import SaasPE from "@assets/SVG/logo.svg";
import { reactAuthFlow } from "~/Utils";
import styles from "@styles/variables.module.scss";

interface Props {
  openModal: boolean;
  consentURL: string;
  setOpenModal: (value: boolean) => void;
}
export const UserConsent = ({ openModal, setOpenModal, consentURL }: Props) => {

  const handleClose = () => {
    setOpenModal(false);
  };

  return (
    <Modal
      open={openModal}
      closable={reactAuthFlow === "BOTH" && true}
      footer={null}
      onCancel={handleClose}
    >
      <Row>
        <Col
          offset={6}
          style={{ paddingTop: styles.whitespace2 }}
        >
          <img
            src={SaasPE}
            alt="SAASPE.PNG"
          />
        </Col>
        <Col
          style={{ paddingTop: styles.whitespace3,margin:styles.whitespaceAuto}}
        >
          <Typography.Title level={5}>Saaspe CLM is requesting permission to:</Typography.Title>
        </Col>
        <Col>
          <ul
            style={{
              paddingTop: styles.whitespace3,
              color: styles.black,
              fontWeight: styles.fontWeight5,
              margin: styles.whitespaceAuto,
            }}
          >
            <li>Thank you for choosing Saaspe CLM. As part of the onboarding process, a DocuSign user account has been created.</li>
            <li>We have sent an account activation email. Kindly follow the procedure outlined in the email.</li>
            <li>Once the account is activated, please provide consent by clicking the "Grant Consent" button below.</li>
          </ul>
        </Col>
        <Col
          span={24}
          style={{ paddingTop: styles.whitespace3 }}
        >
          <Button
            className="w-100"
            onClick={() => {
              window.open(consentURL);
            }}
            type="primary"
          >
            Grand Consent
          </Button>
        </Col>
      </Row>
    </Modal>
  );
};
