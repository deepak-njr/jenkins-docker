import { Icon } from "@iconify/react";
import { Image } from "antd";
import { imageKey } from "./Constants";

export const walletIcons = (value: string) => {
  switch (value) {
    case "Apple Pay":
      return <Icon icon="logos:apple-pay" />;
    case "Google Pay":
      return <Icon icon="logos:google-pay-icon" />;
    case "Grab Pay":
      return (
        <Image
          style={{ width: 30 }}
          src={`https://saaspemedia.blob.core.windows.net/images/logos/png/grab-pay-logo.png${imageKey}`}
        />
      );
  }
};
