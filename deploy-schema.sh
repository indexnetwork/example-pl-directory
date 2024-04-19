#!/bin/bash

DID_PRIVATE_KEY=***
CERAMIC_URL=http://localhost:7007

composedb composite:create schema.graphql --output ./temp/schema-graphql.json --did-private-key $DID_PRIVATE_KEY -c=$CERAMIC_URL

composedb composite:merge ./temp/schema-graphql.json --output ./temp/merged.json -c=$CERAMIC_URL
composedb composite:compile ./temp/merged.json ./temp/merged-runtime.json -c=$CERAMIC_URL
composedb composite:compile ./temp/merged.json ./temp/merged-runtime.js -c=$CERAMIC_URL

composedb composite:deploy ./temp/merged.json --did-private-key $DID_PRIVATE_KEY -c=$CERAMIC_URL
