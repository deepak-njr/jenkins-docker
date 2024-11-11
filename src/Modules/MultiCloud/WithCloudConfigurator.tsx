import React, { useContext } from "react";
import { MultiCloudContext } from "@context/MultiCloutContext";
import { MultiCloud } from "./CloudConstants";

import {
  mockMulticloudAWS,
  mockMulticloudAzure,
  mockMulticloudDO,
  mockMulticloudOracle,
  mockMulticloudGCP,
} from "@utils/Constants";
import { filter, keys, map } from "lodash";

type Props = {
  configuredCloudApps: Array<MultiCloud>;
  fetchMultiCloud?: () => void;
};

export function withCloudConfigurator<T extends Props>(
  Component: React.ComponentType<T>
) {
  return (props: Omit<T, keyof Props>) => {
    return (
      <MultiCloudContext.Consumer>
        {({ multiCloudItems, fetchMultiCloud }) => {
          return (
            <Component
              {...(props as T)}
              configuredCloudApps={
                multiCloudItems
                  ? [
                      ...multiCloudItems.map(
                        (items) => items.cloudProviderName
                      ),
                      ...(mockMulticloudAWS
                        ? [
                            multiCloudItems
                              .map((items) => items.cloudProviderName)
                              .indexOf(MultiCloud.AWS) === -1 && MultiCloud.AWS,
                          ]
                        : []),
                      ...(mockMulticloudAzure
                        ? [
                            multiCloudItems
                              .map((items) => items.cloudProviderName)
                              .indexOf(MultiCloud.AZURE) === -1 &&
                              MultiCloud.AZURE,
                          ]
                        : []),
                      ...(mockMulticloudDO
                        ? [
                            multiCloudItems
                              .map((items) => items.cloudProviderName)
                              .indexOf(MultiCloud.DIGITAL_OCEAN) === -1 &&
                              MultiCloud.DIGITAL_OCEAN,
                          ]
                        : []),
                      ...(mockMulticloudGCP
                        ? [
                            multiCloudItems
                              .map((items) => items.cloudProviderName)
                              .indexOf(MultiCloud.GCP) === -1 && MultiCloud.GCP,
                          ]
                        : []),

                      ...(mockMulticloudOracle
                        ? [
                            multiCloudItems
                              .map((items) => items.cloudProviderName)
                              .indexOf(MultiCloud.ORACLE_CLOUD) === -1 &&
                              MultiCloud.ORACLE_CLOUD,
                          ]
                        : []),
                    ]
                  : []
              }
              fetchMultiCloud={fetchMultiCloud}
            />
          );
        }}
      </MultiCloudContext.Consumer>
    );
  };
}
