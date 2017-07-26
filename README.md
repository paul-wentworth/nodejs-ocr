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
`processImage([parameters], [uploadData], callback)`
- `[parameters]` <Object> Optional Abbyy API method parameters. Object with string properties.
- `[uploadData]` <string> or <Buffer> Optional upload data required for Abbyy API method. Can be either a string representing a file path, or a Buffer object. 
- `callback(err, results)` <Function> User callback to process results of OCR. Will return an `err` if anything goes wrong in the OCR process, otherwise returns the `results` of the API method. `results` are either OCR results or a taskId, in the case of the submitImage API method.




        
      
