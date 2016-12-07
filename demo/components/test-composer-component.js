/*!
 * Copyright (c) 2016 Digital Bazaar, Inc. All rights reserved.
 */
define([], function() {

'use strict';

function register(module) {
  module.component('brTestComposer', {
    controller: Ctrl,
    templateUrl:
      requirejs.toUrl('bedrock-composer-test/test-composer-component.html')
  });
}

/* @ngInject */
function Ctrl() {
  var self = this;

  var CONTEXT = [
    'https://w3id.org/identity/v1',
    'https://w3id.org/credentials/v1',
    {
      'br': 'urn:bedrock:'
    }
  ];

  self.query = {
    '@context': CONTEXT,
    'urn:bedrock:test:passport': '',
    //'email': ''
  };

  self.identity = {
    "@context": [
      "https://w3id.org/identity/v1", "https://w3id.org/credentials/v1"
    ],
    "id": "did:40b16795-73a6-446e-b06d-767087241f24",
    "type": "Identity",
    "credential": [
      {
        "@graph": {
          "@context": [
            "https://w3id.org/identity/v1",
            "https://w3id.org/credentials/v1"
          ],
          "id": "urn:uuid:e3de5bc3-34de-4306-9a13-85932d2bd3ea",
          "type": [
            "Credential",
            "sec:CryptographicKeyCredential"
          ],
          "name": "Key Credential",
          "claim": {
            "id": "did:40b16795-73a6-446e-b06d-767087241f24",
            "publicKey": {
              "@context": "https://w3id.org/identity/v1",
              "id": "did:40b16795-73a6-446e-b06d-767087241f24/keys/1",
              "type": "CryptographicKey",
              "owner": "did:40b16795-73a6-446e-b06d-767087241f24",
              "publicKeyPem": "-----BEGIN PUBLIC KEY-----\r\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtgh3YFHbRwIjwxWKh9Ij\r\nphRzRl5gV5qlawjoDZW5FXPnjeoWhJ7OFwiFG8Pekmg5qqy3uZi6r5PbmhhRlJEG\r\ndA0NmCEpgHj9H0PkCwiMcy6KnPGsdD3gGeYCoxUqj1TGYrGmEUEFwl0dRqehUqQL\r\nlhKKYmZbMnPlCpvn4JqdgX4fLtw2zWdV2TBVnOFrRmRXNJ26Ww2MwdbrKBXLzUDO\r\ndPO3xBNxfeHiYCZSfrH4lW+ydBFO/oi/k6r6022DGv5zqOzOWRPcKn9ZvdgyfSiy\r\nCZ1s2dbBoZfAtfoPkrmstsZBbfPY283KvTc25aQxSUwDFFW8unWFwBcAoK3cmP/C\r\nmwIDAQAB\r\n-----END PUBLIC KEY-----\r\n"
            }
          },
          "signature": {
            "type": "GraphSignature2012",
            "created": "2016-09-14T14:37:54Z",
            "creator": "https://authorization.dev:33443/idp/keys/1",
            "signatureValue": "eX0BvV6L1Qxklr/SBhxet+IwfD/1/5oEcWzUafAz5WZBicRU3PAi5Bo7kXBZAonTNCwrvdsxHxS6m4Wo7xkwCg=="
          }
        }
      },
      {
        "@graph": {
          "@context": [
            "https://w3id.org/identity/v1",
            "https://w3id.org/credentials/v1",
            {
              "br": "urn:bedrock:"
            }
          ],
          "type": [
            "Credential",
            "br:test:EmailCredential"
          ],
          "name": "Email Credential",
          "claim": {
            "id": "did:40b16795-73a6-446e-b06d-767087241f24",
            "email": "test@40b16795-73a6-446e-b06d-767087241f24.example.com"
          },
          "id": "urn:uuid:13dfc503-1938-4ab6-8c76-7acdd0e777fb",
          "signature": {
            "type": "GraphSignature2012",
            "created": "2016-09-14T14:18:39Z",
            "creator": "https://authorization.dev:33443/idp/keys/1",
            "signatureValue": "XBNZvkOC1lF8AsqBWizCoN5AsH+gRqXvxydf00K1jSmRGU22HA6jGjSCsIJ+ENL4eP2tjUB9cly+yNOMrXVEcQ=="
          }
        }
      },
      {
        "@graph": {
          "@context": [
            "https://w3id.org/identity/v1",
            "https://w3id.org/credentials/v1",
            {
              "br": "urn:bedrock:"
            }
          ],
          "type": [
            "Credential",
            "br:test:EmailCredential"
          ],
          "name": "Email Credential",
          "claim": {
            "id": "did:40b16795-73a6-446e-b06d-767087241f24",
            "email": "test@40b16795-73a6-446e-b06d-767087241f24.example.org"
          },
          "id": "urn:uuid:bf266390-2143-4187-b6ee-dcbacd8ef6f4",
          "signature": {
            "type": "GraphSignature2012",
            "created": "2016-09-14T14:18:39Z",
            "creator": "https://authorization.dev:33443/idp/keys/1",
            "signatureValue": "ID4MkpUexVFEFPIn68pZHWNsEmZd5fpzrqfWI2/9wUFfC4nNhsDyLPD+VQeMLGi2Q8Yf6iGFY3tWzIlG2bOrag=="
          }
        }
      },
      {
        "@graph": {
          "@context": [
            "https://w3id.org/identity/v1",
            "https://w3id.org/credentials/v1",
            {
              "br": "urn:bedrock:"
            }
          ],
          "id": "https://authorization.dev:33443/issuer/credentials/1473862731352",
          "type": [
            "Credential",
            "br:test:PassportCredential"
          ],
          "name": "Passport",
          "issued": "2016-09-14T14:18:51.352Z",
          "issuer": "urn:issuer:test",
          "image": "http://simpleicon.com/wp-content/uploads/global_1-128x128.png",
          "claim": {
            "id": "did:40b16795-73a6-446e-b06d-767087241f24",
            "name": "Pat Doe",
            "image": "http://simpleicon.com/wp-content/uploads/business-woman-2-128x128.png",
            "schema:birthDate": {
              "@value": "1980-01-01T00:00:00Z",
              "@type": "xsd:dateTime"
            },
            "schema:gender": "female",
            "schema:height": "65in",
            "br:test:eyeColor": "blue",
            "schema:nationality": {
              "name": "United States"
            },
            "address": {
              "type": "PostalAddress",
              "streetAddress": "1 Main St.",
              "addressLocality": "Blacksburg",
              "addressRegion": "Virginia",
              "postalCode": "24060",
              "addressCountry": "US"
            },
            "br:test:passport": {
              "type": "br:test:Passport",
              "name": "Test Passport",
              "br:test:documentId": "1473862731352",
              "issuer": "https://example.gov/",
              "issued": "2010-01-07T01:02:03Z",
              "expires": "2020-01-07T01:02:03Z"
            }
          },
          "signature": {
            "type": "GraphSignature2012",
            "created": "2016-09-14T14:18:51Z",
            "creator": "https://authorization.dev:33443/issuer/keys/1",
            "signatureValue": "Dex6kqi8fZHbyHkscPcLz2gFvaWBUET5ZkjHN+SJNY2Rq7UfcQ0oOwI2A0NUOA7hivGszFszxbEaEloaUDyzrg=="
          }
        }
      },
      {
        "@graph": {
          "@context": [
            "https://w3id.org/identity/v1",
            "https://w3id.org/credentials/v1",
            {
              "br": "urn:bedrock:"
            }
          ],
          "id": "https://authorization.dev:33443/issuer/credentials/1473862731353",
          "type": [
            "Credential",
            "br:test:ProofOfAgeCredential"
          ],
          "claim": {
            "id": "did:40b16795-73a6-446e-b06d-767087241f24",
            "br:test:ageOver": 21
          },
          "signature": {
            "type": "GraphSignature2012",
            "created": "2016-09-14T14:18:51Z",
            "creator": "https://authorization.dev:33443/issuer/keys/1",
            "signatureValue": "bmdwFAtEMJ7IooNl6Qo6L+UvXIymjsNIJ8+Ay+LioN5feQe/E8v+QFTyl2q3lfWeJj7W8+j4qOJqEKtpmZ8naQ=="
          }
        }
      }
    ]
};
}

return register;

});