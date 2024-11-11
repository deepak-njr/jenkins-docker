#!/usr/bin/env bash

OUTPUT_CONFIG_FILE="public/config/app-config.js"
TEMPLATE_DIR=$(pwd)/templates

if [ -e ./config.sh ]
then
    . ./config.sh
    echo "Loaded config.sh"
else
    echo "error loading config.sh"
    exit 1
fi

if [ -e "${TEMPLATE_DIR}/app-config.js_template" ]
then
    . "${TEMPLATE_DIR}/app-config.js_template"
    echo "Loaded app-config.json_template"
else
    echo "error loading app-config.js_template"
    exit 1
fi



case $1 in
    -d | --dev )
        IMAGE_KEY=${DEV_IMAGE_KEY}
        API_URL=${DEV_API_URL}
        API_BASE=${DEV_API_BASE}
        STRIPE_DOMAIN=${DEV_STRIPE_DOMAIN}
        STRIPE_KEY=${DEV_STRIPE_KEY}
        STRIPE_ENABLED=${DEV_STRIPE_ENABLED}
        INACTIVITY_TIMEOUT=${DEV_INACTIVITY_TIMEOUT}
        LOGOUT_TIMEOUT=${DEV_LOGOUT_TIMEOUT}
        REFRESH_TIME=${DEV_REFRESH_TIME}
        CURRENCY_CODE=${DEV_CURRENCY_CODE}
        CURRENCY_CODE_MULTICLOUD=${DEV_CURRENCY_CODE_MULTICLOUD}
        SALT=${DEV_SALT}
        MULTICLOUD_AWS_MOCK=${DEV_MULTICLOUD_AWS_MOCK}
        MULTICLOUD_AZURE_MOCK=${DEV_MULTICLOUD_AZURE_MOCK}
        MULTICLOUD_DIGITAL_OCEAN_MOCK=${DEV_MULTICLOUD_DIGITAL_OCEAN_MOCK}
        MULTICLOUD_GCP_MOCK=${DEV_MULTICLOUD_GCP_MOCK}
        MULTICLOUD_ORACLE_CLOD_MOCK=${DEV_MULTICLOUD_ORACLE_CLOD_MOCK}
        ENABLED_MENU=${DEV_ENABLED_MENU}
        DEFAULT_REDIRECT=${DEV_DEFAULT_REDIRECT}
        TENANTID=${DEV_AZUREAD_TENANTID}
        CLIENTID=${DEV_AZUREAD_CLIENTID}
        SUPPORTEMAIL=${DEV_SUPPORT_EMAIL}
        ORGNAME=${DEV_ORG_NAME}
        MEDIAHOST=${DEV_MEDIA_HOST}
        ;;
    -s | --sit )
        IMAGE_KEY=${SIT_IMAGE_KEY}
        API_URL=${SIT_API_URL}
        API_BASE=${SIT_API_BASE}
        STRIPE_DOMAIN=${SIT_STRIPE_DOMAIN}
        STRIPE_KEY=${SIT_STRIPE_KEY}
        STRIPE_ENABLED=${SIT_STRIPE_ENABLED}
        INACTIVITY_TIMEOUT=${SIT_INACTIVITY_TIMEOUT}
        LOGOUT_TIMEOUT=${SIT_LOGOUT_TIMEOUT}
        REFRESH_TIME=${SIT_REFRESH_TIME}
        CURRENCY_CODE=${SIT_CURRENCY_CODE}
        CURRENCY_CODE_MULTICLOUD=${SIT_CURRENCY_CODE_MULTICLOUD}
        SALT=${SIT_SALT}
        MULTICLOUD_AWS_MOCK=${SIT_MULTICLOUD_AWS_MOCK}
        MULTICLOUD_AZURE_MOCK=${SIT_MULTICLOUD_AZURE_MOCK}
        MULTICLOUD_DIGITAL_OCEAN_MOCK=${SIT_MULTICLOUD_DIGITAL_OCEAN_MOCK}
        MULTICLOUD_GCP_MOCK=${SIT_MULTICLOUD_GCP_MOCK}
        MULTICLOUD_ORACLE_CLOD_MOCK=${SIT_MULTICLOUD_ORACLE_CLOD_MOCK}
        ENABLED_MENU=${SIT_ENABLED_MENU}
        DEFAULT_REDIRECT=${SIT_DEFAULT_REDIRECT}
        TENANTID=${SIT_AZUREAD_TENANTID}
        CLIENTID=${SIT_AZUREAD_CLIENTID}
        SUPPORTEMAIL=${SIT_SUPPORT_EMAIL}
        ORGNAME=${SIT_ORG_NAME}
        MEDIAHOST=${SIT_MEDIA_HOST}
        ;;
    * )
esac

echo "Generating ${OUTPUT_CONFIG_FILE}..."
rm "${OUTPUT_CONFIG_FILE}"

config_sections1="${PROPERTIES_BODY//\%IMAGE_KEY\%/${IMAGE_KEY}}"
config_sections2="${config_sections1//\%API_URL\%/${API_URL}}"
config_sections3="${config_sections2//\%API_BASE\%/${API_BASE}}"
config_sections4="${config_sections3//\%STRIPE_DOMAIN\%/${STRIPE_DOMAIN}}"
config_sections5="${config_sections4//\%STRIPE_KEY\%/${STRIPE_KEY}}"
config_sections6="${config_sections5//\%STRIPE_ENABLED\%/${STRIPE_ENABLED}}"
config_sections7="${config_sections6//\%INACTIVITY_TIMEOUT\%/${INACTIVITY_TIMEOUT}}"
config_sections8="${config_sections7//\%LOGOUT_TIMEOUT\%/${LOGOUT_TIMEOUT}}"
config_sections9="${config_sections8//\%REFRESH_TIME\%/${REFRESH_TIME}}"
config_sections10="${config_sections9//\%CURRENCY_CODE\%/${CURRENCY_CODE}}"
config_sections11="${config_sections10//\%CURRENCY_CODE_MULTICLOUD\%/${CURRENCY_CODE_MULTICLOUD}}"
config_sections12="${config_sections11//\%SALT\%/${SALT}}"
config_sections13="${config_sections12//\%MULTICLOUD_AWS_MOCK\%/${MULTICLOUD_AWS_MOCK}}"
config_sections14="${config_sections13//\%MULTICLOUD_AZURE_MOCK\%/${MULTICLOUD_AZURE_MOCK}}"
config_sections15="${config_sections14//\%MULTICLOUD_DIGITAL_OCEAN_MOCK\%/${MULTICLOUD_DIGITAL_OCEAN_MOCK}}"
config_sections16="${config_sections15//\%MULTICLOUD_GCP_MOCK\%/${MULTICLOUD_GCP_MOCK}}"
config_sections17="${config_sections16//\%MULTICLOUD_ORACLE_CLOD_MOCK\%/${MULTICLOUD_ORACLE_CLOD_MOCK}}"
config_sections18="${config_sections17//\%ENABLED_MENU\%/${ENABLED_MENU}}"
config_sections19="${config_sections18//\%DEFAULT_REDIRECT\%/${DEFAULT_REDIRECT}}"
config_sections20="${config_sections19//\%TENANTID\%/${TENANTID}}"
config_sections21="${config_sections20//\%CLIENTID\%/${CLIENTID}}"
config_sections22="${config_sections21//\%SUPPORTEMAIL\%/${SUPPORTEMAIL}}"
config_sections23="${config_sections22//\%ORGNAME\%/${ORGNAME}}"
config_sections24="${config_sections23//\%MEDIAHOST\%/${MEDIAHOST}}"


echo "$config_sections24" >>"${OUTPUT_CONFIG_FILE}"
