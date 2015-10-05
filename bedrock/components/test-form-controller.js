define([], function() {

'use strict';

/* @ngInject */
function factory(brTestFormLibraryService) {
  var self = this;

  var CONTEXT = [
    'https://w3id.org/identity/v1',
    'https://w3id.org/credentials/v1',
    {
      'br': 'urn:bedrock:'
    }
  ];

  // library
  // use default
  self.library = null;
  /* FIXME: remove
  // use test library
  brTestFormLibraryService.getLibrary().then(function(library) {
    self.library = library;
  });
  */

  // TODO: reenable contexts
  self.consumers = [{
    description: 'Social Media Login',
    query: {
      '@context': CONTEXT,
      email: ''
    }
  }, {
    description: 'Over 21 Purchase',
    query: {
      '@context': CONTEXT,
      'br:test:ageOver': '',
      address: ''
    }
  }, {
    description: 'Health Insurance Quote',
    query: {
      '@context': CONTEXT,
      'schema:birthDate': '',
      'schema:height': '',
      'schema:weight': '',
      'br:test:isSmoker': ''
    }
  }, {
    description: 'International Travel',
    query: {
      '@context': CONTEXT,
      'schema:birthDate': '',
      'schema:birthPlace': ''
    }
  }, {
    description: 'No claims fulflilled',
    query: {
      '@context': CONTEXT,
      'schema:citizenship': ''
    }
  }, {
    description: 'Some claims fulflilled',
    query: {
      '@context': CONTEXT,
      'schema:birthDate': '',
      'schema:birthPlace': '',
      'schema:citizenship': ''
    }
  }];

  self.consumer = null; //self.consumers[0];

  var credentials = [{
    "@context": [
      "https://w3id.org/identity/v1",
      "https://w3id.org/credentials/v1",
      {
        "br": "urn:bedrock:"
      }
    ],
    "id": "urn:credential-1",
    "type": ["Credential", "br:test:EmailCredential"],
    "name": "Verified Email Credential",
    "image": "https://images.com/verified-email-badge",
    "issued": "2015-06-17T13:06:01Z",
    "claim": {
      "id": "did:2750995a-d4da-48bd-8d28-1ed73bb0d2da",
      "email": "2750995a-d4da-48bd-8d28-1ed73bb0d2da@example.com"
    },
    "signature": {
      "type": "GraphSignature2012",
      "created": "2015-06-17T13:06:01Z",
      "creator": "https://authorization.dev:33443/idp/keys/1",
      "signatureValue": "ARt2Sx3azDTDVb3pXJDlthEdpaq/4qLNmxkGrLCOtQOydeHOzbZVTHA5bdqujpvkvJpclacAWYOFVjWTXpt6/g=="
    }
  }, {
    "@context": [
      "https://w3id.org/identity/v1",
      "https://w3id.org/credentials/v1",
      {
        "br": "urn:bedrock:"
      }
    ],
    "id": "urn:credential-2",
    "type": ["Credential", "br:test:EmailCredential"],
    "name": "Verified Email Credential",
    "image": "https://images.com/verified-email-badge",
    "issued": "2015-06-17T13:06:01Z",
    "claim": {
      "id": "did:2750995a-d4da-48bd-8d28-1ed73bb0d2da",
      "email": "ilikeraisins@example.com"
    },
    "signature": {
      "type": "GraphSignature2012",
      "created": "2015-06-17T13:06:01Z",
      "creator": "https://authorization.dev:33443/idp/keys/1",
      "signatureValue": "ARt2Sx3azDTDVb3pXJDlthEdpaq/4qLNmxkGrLCOtQOydeHOzbZVTHA5bdqujpvkvJpclacAWYOFVjWTXpt6/g=="
    }
  }, {
    "@context": [
      "https://w3id.org/identity/v1",
      "https://w3id.org/credentials/v1",
      {
        "br": "urn:bedrock:"
      }
    ],
    "id": "urn:credential-3",
    "type": ["Credential", "br:test:VerifiedAddressCredential"],
    "name": "Verified Postal Address Credential",
    "image": "https://images.com/verified-email-badge",
    "issued": "2015-06-17T13:06:01Z",
    "claim": {
      "id": "did:2750995a-d4da-48bd-8d28-1ed73bb0d2da",
      "address": {
        "type": "PostalAddress",
        "streetAddress": "1006 Elm St",
        "addressLocality": "Dallas",
        "addressRegion": "TX",
        "postalCode": "78257-1234"
      }
    },
    "signature": {
      "type": "GraphSignature2012",
      "created": "2015-06-17T13:06:01Z",
      "creator": "https://authorization.dev:33443/idp/keys/1",
      "signatureValue": "ARt2Sx3azDTDVb3pXJDlthEdpaq/4qLNmxkGrLCOtQOydeHOzbZVTHA5bdqujpvkvJpclacAWYOFVjWTXpt6/g=="
    }
  }, {
    "@context": [
      "https://w3id.org/identity/v1",
      "https://w3id.org/credentials/v1",
      {
        "br": "urn:bedrock:"
      }
    ],
    "id": "urn:credential-4",
    "type": ["Credential", "br:test:VerifiedAddressCredential"],
    "name": "Verified Postal Address Credential",
    "image": "https://images.com/verified-email-badge",
    "issued": "2015-06-17T13:06:01Z",
    "claim": {
      "id": "did:2750995a-d4da-48bd-8d28-1ed73bb0d2da",
      "address": {
        "type": "PostalAddress",
        "streetAddress": "516 Sunset Blvd",
        "addressLocality": "St. Louis",
        "addressRegion": "MO",
        "postalCode": "7247-1234"
      }
    },
    "signature": {
      "type": "GraphSignature2012",
      "created": "2015-06-17T13:06:01Z",
      "creator": "https://authorization.dev:33443/idp/keys/1",
      "signatureValue": "ARt2Sx3azDTDVb3pXJDlthEdpaq/4qLNmxkGrLCOtQOydeHOzbZVTHA5bdqujpvkvJpclacAWYOFVjWTXpt6/g=="
    }
  }, {
    "@context": [
      "https://w3id.org/identity/v1",
      "https://w3id.org/credentials/v1",
      {
        "br": "urn:bedrock:"
      }
    ],
    "id": "urn:credential-5",
    "type": ["Credential", "br:test:AgeOverCredential"],
    "name": "Verified Over 21 Credential",
    "image": "https://images.com/verified-email-badge",
    "issued": "2015-06-17T13:06:01Z",
    "claim": {
      "id": "did:2750995a-d4da-48bd-8d28-1ed73bb0d2da",
      "br:test:ageOver": "21"
    },
    "signature": {
      "type": "GraphSignature2012",
      "created": "2015-06-17T13:06:01Z",
      "creator": "https://authorization.dev:33443/idp/keys/1",
      "signatureValue": "ARt2Sx3azDTDVb3pXJDlthEdpaq/4qLNmxkGrLCOtQOydeHOzbZVTHA5bdqujpvkvJpclacAWYOFVjWTXpt6/g=="
    }
  }, {
    "@context": [
      "https://w3id.org/identity/v1",
      "https://w3id.org/credentials/v1",
      {
        "br": "urn:bedrock:"
      }
    ],
    "id": "urn:credential-6",
    "type": ["Credential", "br:test:PhysicalExaminationCredential"],
    "name": "Physical Examination Credential",
    "image": "https://images.com/verified-email-badge",
    "issued": "2015-06-17T13:06:01Z",
    "claim": {
      "id": "did:2750995a-d4da-48bd-8d28-1ed73bb0d2da",
      "schema:height": "182 cm",
      "schema:weight": "77 Kg"
    },
    "signature": {
      "type": "GraphSignature2012",
      "created": "2015-06-17T13:06:01Z",
      "creator": "https://authorization.dev:33443/idp/keys/1",
      "signatureValue": "ARt2Sx3azDTDVb3pXJDlthEdpaq/4qLNmxkGrLCOtQOydeHOzbZVTHA5bdqujpvkvJpclacAWYOFVjWTXpt6/g=="
    }
  }, {
    "@context": [
      "https://w3id.org/identity/v1",
      "https://w3id.org/credentials/v1",
      {
        "br": "urn:bedrock:"
      }
    ],
    "id": "urn:credential-7",
    "type": ["Credential", "br:test:PhysicalExaminationCredential"],
    "name": "Physical Examination Credential",
    "image": "https://images.com/verified-email-badge",
    "issued": "2013-06-17T11:11:11Z",
    "claim": {
      "id": "did:2750995a-d4da-48bd-8d28-1ed73bb0d2da",
      "schema:height": "182 cm",
      "schema:weight": "87 Kg"
    },
    "signature": {
      "type": "GraphSignature2012",
      "created": "2015-06-17T13:06:01Z",
      "creator": "https://authorization.dev:33443/idp/keys/1",
      "signatureValue": "ARt2Sx3azDTDVb3pXJDlthEdpaq/4qLNmxkGrLCOtQOydeHOzbZVTHA5bdqujpvkvJpclacAWYOFVjWTXpt6/g=="
    }
  }, {
    "@context": [
      "https://w3id.org/identity/v1",
      "https://w3id.org/credentials/v1",
      {
        "br": "urn:bedrock:"
      }
    ],
    "id": "urn:credential-8",
    "type": ["Credential", "br:test:BirthDateCredential"],
    "name": "Birth Date Credential",
    "image": "https://images.com/verified-email-badge",
    "issued": "2013-06-17T11:11:11Z",
    "claim": {
      "id": "did:2750995a-d4da-48bd-8d28-1ed73bb0d2da",
      "schema:birthDate": {
        "@type": "xsd:dateTime",
        "@value": "1977-06-17T08:15:00Z"
      },
      "schema:birthPlace": {
        "address": {
          "type": "PostalAddress",
          "streetAddress": "1000 Birthing Center Rd",
          "addressLocality": "San Francisco",
          "addressRegion": "CA",
          "postalCode": "98888-1234"
        }
      }
    },
    "signature": {
      "type": "GraphSignature2012",
      "created": "2015-06-17T13:06:01Z",
      "creator": "https://authorization.dev:33443/idp/keys/1",
      "signatureValue": "ARt2Sx3azDTDVb3pXJDlthEdpaq/4qLNmxkGrLCOtQOydeHOzbZVTHA5bdqujpvkvJpclacAWYOFVjWTXpt6/g=="
    }
  }, {
    "@context": [
      "https://w3id.org/identity/v1",
      "https://w3id.org/credentials/v1",
      {
        "br": "urn:bedrock:"
      }
    ],
    "id": "urn:credential-9",
    "type": ["Credential", "br:test:BloodTestCredential"],
    "name": "Blood Test Credential",
    "image": "https://images.com/verified-email-badge",
    "issued": "2014-01-17T11:11:11Z",
    "claim": {
      "id": "did:2750995a-d4da-48bd-8d28-1ed73bb0d2da",
      "br:test:bloodType": "O-positive",
      "br:test:isSmoker": "false"
    },
    "signature": {
      "type": "GraphSignature2012",
      "created": "2015-06-17T13:06:01Z",
      "creator": "https://authorization.dev:33443/idp/keys/1",
      "signatureValue": "ARt2Sx3azDTDVb3pXJDlthEdpaq/4qLNmxkGrLCOtQOydeHOzbZVTHA5bdqujpvkvJpclacAWYOFVjWTXpt6/g=="
    }
  }, {
    "@context": [
      "https://w3id.org/identity/v1",
      "https://w3id.org/credentials/v1",
      {
        "br": "urn:bedrock:"
      }
    ],
    "id": "urn:credential-10",
    "type": [
      "Credential",
      "br:test:PassportCredential"
    ],
    "name": "Passport",
    "issued": "2014-01-17T11:11:11Z",
    "issuer": "urn:issuer:test",
    "image": "http://simpleicon.com/wp-content/uploads/global_1-128x128.png",
    "claim": {
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
        "br:test:documentId": "01001100001110000",
        "issuer": "https://us.gov",
        "issued": "2010-01-07T01:02:03Z",
        "expires": "2020-01-07T01:02:03Z"
      }
    },
    "signature": {
      "type": "GraphSignature2012",
      "created": "2015-01-09T01:02:03Z",
      "creator": "https://idp.identus.dev:38443/i/demo/keys/1",
      "signatureValue": "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz01234567890ABCDEFGHIJKLM=="
    }
}];

  // input identity
  self.identity = {
    '@context': 'https://w3id.org/identity/v1',
    id: 'did:2750995a-d4da-48bd-8d28-1ed73bb0d2da',
  };
  self.identity.credential = credentials.map(function(credential) {
    return {'@graph': credential};
  });
}

return {brTestFormController: factory};

});
