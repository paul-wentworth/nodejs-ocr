# nodejs-ocr

A simple and easy to use client to perform OCR using ABBYY Cloud OCR SDK.

Implements the processImage, submitImage, processDocument, processTextField and processFields methods from the [OCR SDK API:](http://ocrsdk.com/documentation/apireference/) 

## Install
```
$ npm install nodejs-ocr
```
## Import
```js
let AbbyyClient = require('nodejs-ocr')
```
## Creating a client object
```js
let client = new AbbyyClient('<my-abbyy-app-id>', '<my-password>', 'http://cloud.ocrsdk.com'); // Use https here if you'd like
```
## Running an API method and using the results
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


        
      
