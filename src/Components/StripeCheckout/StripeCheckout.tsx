import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { getPaymentIndent } from "@services/stripe";
import { useNotification } from "@hooks/useNotification";
import { Divider, Modal, Space, Spin, Statistic } from "antd";
import styled from "styled-components";
import { stripeSecret } from "@utils/Constants";

import { PaymentComponent } from "./PaymentComponent";

const CenterEl = styled.div`
  min-height: 200px;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface Props {
  paymentFor: string;
  show: string;
  setShow: (value: string) => void;
  returnURL: string;
}
const stripePromise = loadStripe(stripeSecret);

export const StripeCheckout = ({ show, setShow, returnURL, paymentFor }: Props) => {
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [proceedtoPayment, setProceedtoPayment] = useState(false);
  const { openToast } = useNotification();
  const [paymentLoading, setPaymentLoaidng] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (Boolean(show)) {
      setLoading(true);
      getPaymentIndent()
        .then((res: any) => {
          setSecret(res.clientSecret);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(err);
        });
    }
    return () => {
      setSecret("");
    };
  }, [show]);

  const options: StripeElementsOptions = {
    clientSecret: secret,
    appearance: {
      theme: "stripe",
    },
  };

  const afterPayment = () => {
    setPaymentLoaidng(false);
    setShow("");
  };

  return (
    <Modal
      open={Boolean(show)}
      closable
      maskClosable={false}
      width={600}
      onCancel={() => setShow("")}
      okText={"Proceed to pay"}
      okButtonProps={{ loading: paymentLoading, disabled: hasError }}
      title="Pay Now"
      onOk={() => {
        setPaymentLoaidng(true);
        setProceedtoPayment(true);
      }}
    >
      {loading ? (
        <CenterEl>
          <Spin size="large" />
        </CenterEl>
      ) : secret ? (
        <Space
          split={<Divider />}
          direction="vertical"
          style={{ width: "100%" }}
        >
          <Statistic
            title={paymentFor}
            value={show}
            valueStyle={{ fontSize: 16 }}
          />

          <Elements
            options={options}
            stripe={stripePromise}
          >
            <PaymentComponent
              secret={secret}
              proceedToPayment={proceedtoPayment}
              afterPayment={afterPayment}
              returnUrl={returnURL}
              setHasError={setHasError}
            />
          </Elements>
        </Space>
      ) : (
        <></>
      )}
    </Modal>
  );
};
