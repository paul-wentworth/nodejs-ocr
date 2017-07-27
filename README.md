# nodejs-ocr

A simple and easy to use client to perform OCR using ABBYY Cloud OCR SDK.

Unlike the alternatives, ABBYY's OCR is simple and practical. It's perfect for reliably reading basic text from pictures, documents, cheques, receipts and business cards. Requires no setup. OCR results are dependably consistent - the same input will never yield different results.

Implements the processImage, submitImage, processDocument, processTextField and processFields methods from the [OCR SDK API](http://ocrsdk.com/documentation/apireference/).



## Quick Start
### Install
`$ npm install nodejs-ocr`
### Import
```js
let AbbyyClient = require('nodejs-ocr');
```
### Creating a client object
- Provide your Abbyy application id and password, available free at: [http://ocrsdk.com](http://ocrsdk.com)
- Provide the protocol (http/https) and server hostname.
```js
let client = new AbbyyClient('myAppId', 'myPassword', 'https://cloud.ocrsdk.com'); // Use https here if you'd like
```
### Running an API method and using the results
- More information on API Parameters can be found here: [API Reference](http://ocrsdk.com/documentation/apireference/).
```js
function ocrComplete(err, results) {
    if( !err ) {
        console.log(results.toString()); // Raw results of completed Task (or a TaskId for submitImage calls)
    }
}

let apiParameters = {
    language: 'English',
    profile:  'textExtraction',
    textType: 'typewriter',
    exportFormat: 'xml'
    // etc...
};
client.processImage(apiParameters, './localFile.png', ocrComplete); // Buffers can also be passed
```
 
  
   
## Documentation
### processImage([parameters], uploadData, callback)
- `[parameters]` `<Object>` Optional Abbyy API method parameters. Object with string properties.
- `uploadData` `<string>` or `<Buffer>` Image to be processed by API method.  
- `callback(err, results)` `<Function>` Callback to return `err`s or OCR `results`.


### processTextField(parameters, uploadData, callback)
- `parameters` `<Object>` Abbyy API method parameters. A text field region must be specified. 
- `uploadData` `<string>` or `<Buffer>` File to be processed by API method.  
- `callback(err, results)` <Function> Callback to return `err`s or OCR `results`.
 
 
### submitImage([parameters], uploadData, callback)
- `[parameters]` `<Object>` Optional Abbyy API method parameters.
- `uploadData` `<string>` or `<Buffer>` File to be uploaded to Abbyy server.  
- `callback(err, results)` `<Function>` Callback to return `err`s or Task ID string representing uploaded file.
 
 
### processDocument(parameters, callback)
- `parameters` `<Object>` Abbyy API method parameters. Task ID corresponding to a file uploaded via submitImage is required.
- `callback(err, results)` `<Function>` Callback to return `err`s or OCR `results`.
 
  
### processFields(parameters, uploadData, callback)
- `parameters` `<Object>` Abbyy API method parameters. Task ID corresponding to a file uploaded via submitImage is required.
- `uploadData` `<string>` or `<Buffer>` XML representing fields to be processed by API method. For more information on the format of this XML see: [XML Parameters of Field Recognition](http://ocrsdk.com/documentation/specifications/xml-scheme-field-settings/).
- `callback(err, results)` `<Function>` Callback to return `err`s or OCR `results`.

      
