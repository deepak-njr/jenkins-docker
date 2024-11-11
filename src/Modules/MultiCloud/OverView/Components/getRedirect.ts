import { camelCase } from 'lodash';
import { MultiCloud } from "~/Modules/MultiCloud/CloudConstants";

export const getRedirectLink = (name: string) => {
  switch (name) {
    case "AWS":
      return `/multi-cloud/resources?vendor=${MultiCloud.AWS}`;
    case "GCP":
      return `/multi-cloud/resources?vendor=${MultiCloud.GCP}`;
    case "Azure":
      return `/multi-cloud/resources?vendor=${MultiCloud.AZURE}`;
    case "Digital Ocean":
      return `/multi-cloud/resources?vendor=${camelCase(MultiCloud.DIGITAL_OCEAN)}`;
    case "Oracle Cloud":
      return `/multi-cloud/resources?vendor=${camelCase(MultiCloud.ORACLE_CLOUD)}`;
    default:
      return "";
  }
};
