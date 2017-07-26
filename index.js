/* -------------------- IMPORT -------------------- */
const http   = require('http');
const https  = require('https');
const url    = require('url');
const fs     = require('fs');
const xml2js = require('xml2js');


/* -------------------- CLASSES -------------------- */
class Task
{
    constructor(connectionSettings, requestSettings, completeCallback) // Setup properties and send out initial HTTP request
    {
        // Callback methods
        this.receiveResponse          = this.receiveResponse.bind(this); 
        this.readResponseData         = this.readResponseData.bind(this);
        this.processResponse          = this.processResponse.bind(this); 
        this.processParsedResponseXml = this.processParsedResponseXml.bind(this); 
        this.waitForTaskCompletion    = this.waitForTaskCompletion.bind(this); 
        this.getTaskStatus            = this.getTaskStatus.bind(this); 
        this.downloadResults          = this.downloadResults.bind(this);
        this.receiveResults           = this.receiveResults.bind(this); 
        this.processResults           = this.processResults.bind(this); 
        this.error                    = this.error.bind(this); 
        this.finish                   = this.finish.bind(this); 

        // Properties
        this.connectionSettings = connectionSettings;
        this.callback           = completeCallback;
        this.responseBuffer     = Buffer.alloc(0);

        // Send out HTTP Request to start task (Cloud API call)
        let requestOptions     = url.parse(this.connectionSettings.svrUrl + requestSettings.urlPathAndQuery);
        requestOptions.auth    = this.connectionSettings.appId + ':' + this.connectionSettings.pass;
        requestOptions.method  = requestSettings.method;
        requestOptions.headers = { 'User-Agent': 'node.js client library' };

        let request = undefined;
        if (requestOptions.protocol == 'http:') { request = http.request(requestOptions, this.receiveResponse); } 
        else { request = https.request(requestOptions, this.receiveResponse); }
        
        request.on('error', this.error);
        if( requestSettings.uploadData ) { request.write(requestSettings.uploadData); }
        request.end(); 
    }

    receiveResponse(response) // Bind listeners to Abbyy response events
    {
        response.on('data',  this.readResponseData);
        response.on('end',   this.processResponse); 
        response.on('error', this.error);
    }

    readResponseData(responseData) // Read data from Abbyy response into response buffer
    {
        this.responseBuffer = Buffer.concat([this.responseBuffer, responseData]);
    }

    processResponse() // Process Abbyy response
    {
        // Parse XML response and then process it further
        let parserOptions = 
        {
            explicitCharKey: false,
            trim: true,
            explicitRoot: true,
            mergeAttrs: true 
        };
        
        let parser = new xml2js.Parser(parserOptions);
        parser.parseString(this.responseBuffer, this.processParsedResponseXml);
    }

    processParsedResponseXml(err, parsedObj) // Process the XML Response from Abbyy server
    {
        this.responseBuffer = Buffer.alloc(0); // Garbage collect old buffer and create new empty buffer

        if( err ) { this.error(err); }
        else if( !parsedObj ) { this.error(new Error('Null output from xml2js')); }
        else
        {
            if( parsedObj.error ) 
            {
                // Abbyy server error response
                this.error(new Error(parsedObj.error.message[0]._)); 
            }
            else if( !parsedObj.response || !parsedObj.response.task || !parsedObj.response.task[0] ) 
            {
                // Unkown response from Abbyy server
                this.error(new Error('Unknown server response'));
            }
            else
            {
                // Normal response from Abbyy server
                let taskInfo = parsedObj.response.task[0];
                let id = taskInfo.id.toString();
                if( id.indexOf('00000000') > -1 ) { this.error( new Error('Null id received')); }
                else
                {
                    if( !this.id ) { this.id = id; } // Initialize ID Property 
                    
                    if( this.id != id ) { this.error( new Error('Id collision')); }
                    else
                    {
                        let status = taskInfo.status;
                        if( status == 'Queued' || status == 'InProgress' ) 
                        {
                            this.waitForTaskCompletion();
                        }
                        else if( status == 'Completed' )
                        {
                            this.downloadResults(taskInfo.resultUrl[0]);
                        }
                        else if( status == 'Submitted' )
                        { 
                            this.results = this.id;
                            this.finish(); 
                        }
                        else { this.error(new Error('Unrecognized task status received')); }
                    }
                }
            }
        }
    }

    waitForTaskCompletion() // Wait 5 seconds (Abbyy recommended time) then poll task status
    {
        const waitTimeout = 5000;
        setTimeout(this.getTaskStatus, waitTimeout);
    }

    getTaskStatus() // Send out HTTP request to poll task status
    {
        let requestOptions = url.parse(this.connectionSettings.svrUrl + '/getTaskStatus?taskId=' + this.id);
        requestOptions.auth = this.connectionSettings.appId + ':' + this.connectionSettings.pass;
        requestOptions.method = 'GET';
        requestOptions.headers = { 'User-Agent': 'node.js client library' };

        let request = undefined;
        if (requestOptions.protocol == 'http:') { request = http.request(requestOptions, this.receiveResponse); } 
        else { request = https.request(requestOptions, this.receiveResponse); }
        
        request.on('error', this.error);
        request.end(); 
    }

    downloadResults(resultsUrl) // Send out HTTP request to download results
    {
        let requestOptions = url.parse(resultsUrl); // [TODO] Test if this is always https url anyway
        let request = undefined;
        if (requestOptions.protocol == 'http:') { request = http.request(requestOptions, this.receiveResults); } 
        else { request = https.request(requestOptions, this.receiveResults); }

        request.on('error', this.error);
        request.end();
    }

    receiveResults(response)
    {
        response.on('data',  this.readResponseData);
        response.on('end',   this.processResults); 
        response.on('error', this.error);
    }

    processResults() // Return response (results) directly to user
    {
        this.results = this.responseBuffer;
        this.finish(); 
    }

    error(error) // Log any errors associated with Task and return it to user
    {
        this.error = error;
        this.callback(error);
    }

    finish() // Task complete! Return it to the user
    {
        this.callback(null, this.results);
    }
}

class AbbyyClient
{
    constructor(applicationId, password, serverUrl)
    {
        this.connectionSettings = 
        {
            appId:  applicationId,
            pass:   password,
            svrUrl: serverUrl
        };
    }
    
    _toUrlString(parameters) 
    {
        if( parameters )
        {
            return '?' + Object.keys(parameters).map((key) => `${key}=${parameters[key]}`).join('&');	
        }
        else { return ''; }
    }

    _checkArgs(args)
    {
        let parameters = undefined;
        let uploadData = undefined; 

        if( args.length == 2 ) 
        {
            if( Buffer.isBuffer(args[0]) || typeof args[0] == 'string' ) { uploadData =  args[0]; }
            else { parameters = args [0]; }
        }
        else if( args.length == 3 ) 
        {
            parameters = args[0]; 
            uploadData = args [1]; 
        }

        return {parameters: parameters, uploadData: uploadData, userCallback: args[args.length - 1]};
    }

    _runApiMethod(method, parameters, uploadData, userCallback) 
    {
        if( method == 'processImage'     || 
            method == 'processTextField' || 
            method == 'processFields'    ||
            method == 'submitImage' )
        {
            // Prepare Upload Data
            let uploadBuffer;
            if( typeof uploadData == 'string' ) 
            { 
                if( fs.existsSync(uploadData) ) { uploadBuffer = fs.readFileSync(uploadData); }
                else { userCallback(new Error('File does not exist.')); }
            }
            else { uploadBuffer = uploadData; } // Buffer with data directly passed

            // Create new task
            let requestSettings = 
            {
                method: 'POST',
                urlPathAndQuery: '/' + method + this._toUrlString(parameters),
                uploadData: uploadBuffer
            };
            new Task(this.connectionSettings, requestSettings, userCallback); 
        }
        else if ( method == 'processDocument' )
        {
            // Create new task
            let requestSettings = 
            {
                method: 'GET',
                urlPathAndQuery: '/' + method + this._toUrlString(parameters),
            };
            new Task(this.connectionSettings, requestSettings, userCallback); 
        }
        else { throw new Error('Invalid API method name'); }
    }


    /* -------------------- PUBLIC METHODS -------------------- */
    processImage(/* [parameters], [upload data], callback */)
    {
        let args = this._checkArgs(arguments); 
        this._runApiMethod('processImage', args.parameters, args.uploadData, args.userCallback); 
    }

    processTextField(/* [parameters], [upload data], callback */)
    {
        let args = this._checkArgs(arguments); 
        this._runApiMethod('processTextField', args.parameters, args.uploadData, args.userCallback); 
    }

    submitImage(/* [parameters], [upload data], callback */)
    {
        let args = this._checkArgs(arguments); 
        this._runApiMethod('submitImage', args.parameters, args.uploadData, args.userCallback); 
    }

    processDocument(/* [parameters], [upload data], callback */)
    {
        let args = this._checkArgs(arguments); 
        this._runApiMethod('processDocument', args.parameters, args.uploadData, args.userCallback); 
    }
    
    processFields(/* [parameters], [upload data], callback */)
    {
        let args = this._checkArgs(arguments); 
        this._runApiMethod('processFields', args.parameters, args.uploadData, args.userCallback); 
    }
}


/* -------------------- EXPORT -------------------- */
module.exports = AbbyyClient; 