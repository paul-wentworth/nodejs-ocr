# nodejs-ocr

A simple and easy to use client to perform OCR using ABBYY Cloud OCR SDK.

Implements the processImage, submitImage, processDocument, processTextField and processFields methods from the [OCR SDK API:](http://ocrsdk.com/documentation/apireference/) 

## Quick Start
### Install
`$ npm install nodejs-ocr`
### Import
```js
let AbbyyClient = require('nodejs-ocr');
```
### Creating a client object
- Provide your Abbyy application id and password, available free at: (http://ocrsdk.com)
- Provide the protocol (http/https) and server hostname.
```js
let client = new AbbyyClient('myAppId', 'myPassword', 'http://cloud.ocrsdk.com'); // Use https here if you'd like
```
### Running an API method and using the results
- More information on API Parameters can be found here: (http://ocrsdk.com/documentation/apireference/)
```js
function ocrComplete(err, results) {
    if( !err ) {
        console.log(results); // Raw results of completed Task (or a TaskId for submitImage calls)
    }
}

let apiParameters = {
    language: 'English',
    profile:  'textExtraction',
    textType: 'typewriter'
    // etc...
}
client.processImage(apiParameters, './localFile.png', ocrComplete); // Buffers can also be passed
```
 
  
   
## Documentation
### processImage
`processImage([parameters], uploadData, callback)`
- `[parameters]` `<Object>` Optional Abbyy API method parameters. Object with string properties.
- `uploadData` `<string>` or <Buffer> Image to be processed by API method.  
- `callback(err, results)` `<Function>` Callback to return `err`s or OCR `results`.
 
### processTextField
`processTextField(parameters, uploadData, callback)`
- `parameters` `<Object>` Optional Abbyy API method parameters. Object with string properties. A text field region must be specified. 
- `uploadData` `<string>` or `<Buffer>` Image to be processed by API method.  
- `callback(err, results)` <Function> Callback to return `err`s or OCR `results`.
 
### submitImage
`submitImage([parameters], uploadData, callback)`
- `[parameters]` `<Object>` Optional Abbyy API method parameters. Object with string properties.
- `uploadData` `<string>` or `<Buffer>` File (image, pdf, etc) to be uploaded to Abbyy server.  
- `callback(err, results)` `<Function>` Callback to return `err`s or Task ID string representing uploaded image.
 
### processDocument
`processDocument(parameters, callback)`
- `parameters` `<Object>` Abbyy API method parameters. Object with string properties. Task ID is required.
- `callback(err, results)` `<Function>` Callback to return `err`s or OCR `results`.
 
### processFields
`processFields(parameters, fieldsXml, callback)`
- `parameters` `<Object>` Abbyy API method parameters. Object with string properties. Task ID is required.
- `uploadData` `<string>` or `<Buffer>` XML representing fields to be processed by API method. 
- `callback(err, results)` `<Function>` Callback to return `err`s or OCR `results`.

      
