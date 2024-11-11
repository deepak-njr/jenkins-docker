import styled from "styled-components";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useEffect } from "react";
import { useNotification } from "@hooks/useNotification";

interface Props {
  secret: string;
  proceedToPayment: boolean;
  afterPayment: () => void;
  setHasError: (val: boolean) => void;
  returnUrl: string;
}
export const PaymentComponent = ({ secret, proceedToPayment, afterPayment, returnUrl, setHasError }: Props) => {
  const stripe = useStripe();
  const elements = useElements();
  const { openToast } = useNotification();

  const pay = async () => {
    if (!stripe || !elements) return;

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    if (result.error) {
      openToast({
        content: result.error.message || "Error",
        type: "error",
      });
      afterPayment();
    } else {
      afterPayment();
    }
  };

  useEffect(() => {
    if (proceedToPayment) {
      pay();
    }
  }, [proceedToPayment, stripe, elements]);

  return <PaymentElement onChange={(e) => setHasError(!e.complete)} />;
};
