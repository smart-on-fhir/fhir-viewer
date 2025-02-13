FHIR Viewer
===========
In-browser viewer for FHIR resources

This is a simple application for FHIR resources that was created for several reasons:
1. Allow FHIR responses to be viewed in the browser regardless of
their specific response headers that will typically force the browser to download them.
2. Give the developers the ability to review the FHIR responses in their preferred environment - text-editor.
3. The app uses the Monaco editor which gives use many advantages like
    - Syntax highlighting
    - Code folding
    - Keyboard shortcuts and keyboard navigation
    - Easy search within the code
    - Great (size-independent) performance
    - Color themes support
    - Custom extensions to turn FHIR references into links and even preview them on hover
    
## Examples
- [DSTU3 Sandbox conformance statement (big response)](http://docs.smarthealthit.org/fhir-viewer/index.html?url=https%3A%2F%2Fr3.smarthealthit.org%2Fmetadata)
- [Patient encounters with references preview](http://docs.smarthealthit.org/fhir-viewer/index.html?url=https%3A%2F%2Fr3.smarthealthit.org%2FEncounter%3Fpatient%3Dsmart-1291938)
- [Patient encounters with references preview (dark theme)](http://docs.smarthealthit.org/fhir-viewer/index.html?dark=&url=https%3A%2F%2Fr3.smarthealthit.org%2FEncounter%3Fpatient%3Dsmart-1291938)
- [Patient encounters with references preview (dark theme and XML format)](http://docs.smarthealthit.org/fhir-viewer/index.html?dark=&url=https%3A%2F%2Fr3.smarthealthit.org%2FEncounter%3Fpatient%3Dsmart-1291938%26_format%3Dxml)

## Usage

You can use the online version or host your own. The only thing that you need to do is to pass a `url` parameter in the query string that would be the URL of the resource you want to view. The app will download it and render it into read-only editor. The `url` parameter **MUST BE URL ENCODED!**

- to specify XML or JSON format add `_format=json` or `_format=xml` to the original `url` parameter and url-encode the whole thing.
- to use the dark theme add `dark` url parameter with any value (or even without a value)

## Contribution
This app is designed to be as simple as possible. If you want to make changes please keep that in mind and also use only ES5 because there is no builder or transpiler involved.

## installation
If you want to use it locally simply do:
```sh
git clone https://github.com/smart-on-fhir/fhir-viewer.git
cd fhir-viewer
npm i
npm start
```
Then open http://127.0.0.1:8080/?url=http%3A%2F%2Ffhirtest.uhn.ca%2FbaseDstu3%2Fmetadata in your browser.

## Installation from Docker Hub
This will start the viewer and make it available on http://localhost:9090/
```
docker run -p 9090:80 smartonfhir/fhir-viewer:latest
```
