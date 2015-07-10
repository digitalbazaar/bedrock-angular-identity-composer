define([], function() {

'use strict';

/* @ngInject */
function factory() {
  var self = this;

  var CONTEXT_URL = 'https://w3id.org/identity/v1';

  // TODO: reenable contexts
  self.consumers = [{
    description: 'Social Media Login',
    query: {
      //'@context': CONTEXT_URL,
      email: ""
    }
  }, {
    description: 'Over 21 Purchase',
    query: {
      //'@context': CONTEXT_URL,
      ageOver: "",
      address: ""
    }
  }, {
    description: 'Health Insurance Quote',
    query: {
      //'@context': CONTEXT_URL,
      birthDate: "",
      height: "",
      weight: "",
      isSmoker: ""
    }
  }];

  self.consumer = self.consumers[0];

  self.credentials = [{
    "@context": "https://w3id.org/identity/v1",
    "id": "urn:credential-1",
    "type": ["Credential", "EmailCredential"],
    "name": "Verified Email Credential",
    "image": "https://images.com/verified-email-badge",
    "issued": "2015-06-17T13:06:01Z",
    "claim": {
      "id": "did:2750995a-d4da-48bd-8d28-1ed73bb0d2da",
      "email": "did:2750995a-d4da-48bd-8d28-1ed73bb0d2da@example.com"
    },
    "signature": {
      "type": "GraphSignature2012",
      "created": "2015-06-17T13:06:01Z",
      "creator": "https://authorization.dev:33443/idp/keys/1",
      "signatureValue": "ARt2Sx3azDTDVb3pXJDlthEdpaq/4qLNmxkGrLCOtQOydeHOzbZVTHA5bdqujpvkvJpclacAWYOFVjWTXpt6/g=="
    }
  }, {
    "@context": "https://w3id.org/identity/v1",
    "id": "urn:credential-2",
    "type": ["Credential", "EmailCredential"],
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
    "@context": "https://w3id.org/identity/v1",
    "id": "urn:credential-3",
    "type": ["Credential", "VerifiedAddressCredential"],
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
    "@context": "https://w3id.org/identity/v1",
    "id": "urn:credential-4",
    "type": ["Credential", "VerifiedAddressCredential"],
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
    "@context": "https://w3id.org/identity/v1",
    "id": "urn:credential-5",
    "type": ["Credential", "AgeOverCredential"],
    "name": "Verified Over 21 Credential",
    "image": "https://images.com/verified-email-badge",
    "issued": "2015-06-17T13:06:01Z",
    "claim": {
      "id": "did:2750995a-d4da-48bd-8d28-1ed73bb0d2da",
      "ageOver": "21"
    },
    "signature": {
      "type": "GraphSignature2012",
      "created": "2015-06-17T13:06:01Z",
      "creator": "https://authorization.dev:33443/idp/keys/1",
      "signatureValue": "ARt2Sx3azDTDVb3pXJDlthEdpaq/4qLNmxkGrLCOtQOydeHOzbZVTHA5bdqujpvkvJpclacAWYOFVjWTXpt6/g=="
    }
  }, {
    "@context": "https://w3id.org/identity/v1",
    "id": "urn:credential-6",
    "type": ["Credential", "PhysicalExaminationCredential"],
    "name": "Physical Examination Credential",
    "image": "https://images.com/verified-email-badge",
    "issued": "2015-06-17T13:06:01Z",
    "claim": {
      "id": "did:2750995a-d4da-48bd-8d28-1ed73bb0d2da",
      "height": "182 cm",
      "weight": "77 Kg"
    },
    "signature": {
      "type": "GraphSignature2012",
      "created": "2015-06-17T13:06:01Z",
      "creator": "https://authorization.dev:33443/idp/keys/1",
      "signatureValue": "ARt2Sx3azDTDVb3pXJDlthEdpaq/4qLNmxkGrLCOtQOydeHOzbZVTHA5bdqujpvkvJpclacAWYOFVjWTXpt6/g=="
    }
  }, {
    "@context": "https://w3id.org/identity/v1",
    "id": "urn:credential-7",
    "type": ["Credential", "PhysicalExaminationCredential"],
    "name": "Physical Examination Credential",
    "image": "https://images.com/verified-email-badge",
    "issued": "2013-06-17T11:11:11Z",
    "claim": {
      "id": "did:2750995a-d4da-48bd-8d28-1ed73bb0d2da",
      "height": "182 cm",
      "weight": "87 Kg"
    },
    "signature": {
      "type": "GraphSignature2012",
      "created": "2015-06-17T13:06:01Z",
      "creator": "https://authorization.dev:33443/idp/keys/1",
      "signatureValue": "ARt2Sx3azDTDVb3pXJDlthEdpaq/4qLNmxkGrLCOtQOydeHOzbZVTHA5bdqujpvkvJpclacAWYOFVjWTXpt6/g=="
    }
  }, {
    "@context": "https://w3id.org/identity/v1",
    "id": "urn:credential-8",
    "type": ["Credential", "BirthDateCredential"],
    "name": "Birth Date Credential",
    "image": "https://images.com/verified-email-badge",
    "issued": "2013-06-17T11:11:11Z",
    "claim": {
      "id": "did:2750995a-d4da-48bd-8d28-1ed73bb0d2da",
      "birthDate": "1977-06-17T08:15:00Z",
      "birthPlace": {
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
    "@context": "https://w3id.org/identity/v1",
    "id": "urn:credential-9",
    "type": ["Credential", "BloodTestCredential"],
    "name": "Blood Test Credential",
    "image": "https://images.com/verified-email-badge",
    "issued": "2014-01-17T11:11:11Z",
    "claim": {
      "id": "did:2750995a-d4da-48bd-8d28-1ed73bb0d2da",
      "bloodType": "O-positive",
      "isSmoker": "false"
    },
    "signature": {
      "type": "GraphSignature2012",
      "created": "2015-06-17T13:06:01Z",
      "creator": "https://authorization.dev:33443/idp/keys/1",
      "signatureValue": "ARt2Sx3azDTDVb3pXJDlthEdpaq/4qLNmxkGrLCOtQOydeHOzbZVTHA5bdqujpvkvJpclacAWYOFVjWTXpt6/g=="
    }
  }];

  self.sampleCredential = {
    "@context": "https://w3id.org/identity/v1",
    "type": ["Credential", "EmailCredential"],
    "name": "Verified Email Credential",
    "image": "https://images.com/verified-email-badge",
    "issued": "2015-06-17T13:06:01Z",
    "claim": {
      "id": "did:2750995a-d4da-48bd-8d28-1ed73bb0d2da",
      "email": "did:2750995a-d4da-48bd-8d28-1ed73bb0d2da@example.com"
    },
    "signature": {
    "type": "GraphSignature2012",
    "created": "2015-06-17T13:06:01Z",
    "creator": "https://authorization.dev:33443/idp/keys/1",
    "signatureValue": "ARt2Sx3azDTDVb3pXJDlthEdpaq/4qLNmxkGrLCOtQOydeHOzbZVTHA5bdqujpvkvJpclacAWYOFVjWTXpt6/g=="
    }
  };
}

return {brTestFormController: factory};

});
