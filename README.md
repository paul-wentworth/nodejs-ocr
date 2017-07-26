## nodejs-ocr

A simple and easy to use client to perform OCR using ABBYY Cloud OCR SDK.

Implements the processImage, submitImage, processDocument, processTextField and processFields methods from the [OCR SDK API:](http://ocrsdk.com/documentation/apireference/). 

# Install
```cli
npm install nodejs-ocr
```
# Import
```json
let AbbyyClient = require('nodejs-ocr')
```
# Creating a client object
```
let client = new AbbyyClient('<my-abbyy-app-id>', '<my-password>', 'http://cloud.ocrsdk.com'); // Use https here if you'd like
```
# Running an API method and using the results
```
function ocrComplete(err, results) {
    if( !err ) {
        console.log(results); // Either a Abbyy Cloud TaskId string, or raw results of completed Task.
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


        
      
