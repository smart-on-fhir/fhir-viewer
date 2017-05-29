/**
 * The URLs in this array are used for the reference links resolving
 * functionality. If the FHIR resource you are using is not from one of these
 * servers the app will not be able to compute the full path to the references.
 * You can just add more servers to this list to make the app aware of them...
 *
 * This also acts as whitelist of servers that we support. For security reasons
 * the app will not load any URLs but only those from the listed servers.
 * As an exception, the app will still load URLs from localhost or 127.0.0.1
 * but for the references to be resolved correctly you will still have to add
 * your base URL to this array.
 */
window.KNOWN_SERVERS = [
    "https://sb-fhir-dstu2.smarthealthit.org/api/smartdstu2/open",
    "https://stub-dstu2.smarthealthit.org/api/fhir",
    "http://fhirtest.uhn.ca/baseDstu3",
    "https://sb-fhir-stu3.smarthealthit.org/smartstu3/open",
    "http://34.195.196.20:9074/smartstu3",
    "http://52.90.126.238:8080/fhir/baseDstu3"
];