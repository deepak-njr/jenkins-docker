export interface MultiCloudContext {
  multiCloudItems: {
    cloudProviderName: string;
    cloudProviderLogo: string;
    clientId: string;
    tenantId: string;
    onboardedDate: string;
  }[];
  fetchMultiCloud: () => void;
}
