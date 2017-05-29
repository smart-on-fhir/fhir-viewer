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
- Big response: [DSTU3 Sandbox conformance statement](http://docs.smarthealthit.org/fhir-viewer/?url=http%3A%2F%2Ffhirtest.uhn.ca%2FbaseDstu3%2Fmetadata)
- [Patient encounters with references preview](http://docs.smarthealthit.org/fhir-viewer/?url=https%3A%2F%2Fsb-fhir-stu3.smarthealthit.org%2Fsmartstu3%2Fopen%2FEncounter%3Fpatient%3Dsmart-1291938)
- [Patient encounters with references preview (dark theme)](http://docs.smarthealthit.org/fhir-viewer/?url=https%3A%2F%2Fsb-fhir-stu3.smarthealthit.org%2Fsmartstu3%2Fopen%2FEncounter%3Fpatient%3Dsmart-1291938&dark)
- [Patient encounters with references preview (dark theme and XML format)](http://docs.smarthealthit.org/fhir-viewer/?url=https%3A%2F%2Fsb-fhir-stu3.smarthealthit.org%2Fsmartstu3%2Fopen%2FEncounter%3Fpatient%3Dsmart-1291938%26_format%3Dxml&dark)

## Usage

You can use the online version or host your own. The only thing that you need to do is to pass a `url` parameter in the query string that would be the URL of the resource you want to view. The app will download it and render it into read-only editor.

To be continued...
