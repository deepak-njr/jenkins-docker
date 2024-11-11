import axios from "axios";
import { stripeDomain } from "@utils/Constants";

const customerId = "cus_MWKb7SUTzFJVPH";
const stripePaymentToken =
  "pi_3LnI2vJ6PaybcjnG0ZSxiZmU_secret_KmtwVZ4wQaahV1xGfvli8jT9I";

export const getPaymentIndent = () => {
  const userDetails = localStorage.getItem("user");

  return new Promise((resolve, reject) => {
    axios
      .post(`${stripeDomain}/payment/create-payment-intent`, {
        currency: "MYR",
        description: "sample payment",
        amount: 1000,
        stripeEmail: userDetails && JSON.parse(userDetails).email,
        custId: customerId,
        stripeToken: stripePaymentToken,
      })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
};
