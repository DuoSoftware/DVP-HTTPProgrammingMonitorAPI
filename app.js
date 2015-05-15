
var restify = require('restify');
var redis = require('redis');
var config = require('config');
var Mailer=require('./Mailer.js');
var DbConn = require('DVP-DBModels');

var port = config.Host.port || 3000;
var version=config.Host.version;
var Rport=config.Redis.port;
var ip=config.Redis.ip;

var ErrorMonitor=require('./ErrorMonitor.js');
var VoiceActivityFlow=require('./VoiceActivityFlow.js');
var logger = require('DVP-Common/LogHandler/CommonLogHandler.js').logger;
var uuid = require('node-uuid');


var redisClient = redis.createClient(config.Redis.port,config.Redis.ip);
redisClient.on('error',function(err){
    console.log('Error '.red, err);
});

var FileUploaded='SYS:HTTPPROGRAMMING:FILEUPLOADED';
var DataError='SYS:HTTPPROGRAMMING:DATAERROR';
var HttpError='SYS:HTTPPROGRAMMING:HTTPERROR';

redisClient.psubscribe("SYS:HTTPPROGRAMMING:*");
//redisClient.subscribe(DataError);
//redisClient.subscribe(HttpError);

/////////////////////////////////////////////////////////////////////
var server = restify.createServer();
server.use(restify.fullResponse()).use(restify.bodyParser());
server.listen(port,function()
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }
    logger.debug('[DVP-HTTPProgrammingMonitorAPI] - [%s]  - Server starts at  %s ',reqId,port);
    console.log(port);
});

////////////////////////////////////////////////////////////////////


function send(req, res, next) {
    res.send('API ' + ' '+req.params.account+' '+req.params.guid);
    return next();
}

//pawan
//Alert services

redisClient.on('pmessage', function (pattern,MsgTyp, message) {
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }

    logger.debug('[DVP-HTTPProgrammingMonitorAPI] - [%s]  - Redis client started ',reqId);
    var Jobj=JSON.parse(message);

    if(MsgTyp == FileUploaded )
    {
        logger.debug('[DVP-HTTPProgrammingMonitorAPI] - [%s]  - Message type :  %s',reqId,FileUploaded);
        Mailer.GetAppDeveloperMail(Jobj.APPID,reqId,function(err,res)
        {
            if(err)
            {
                //console.error(err);
                //logger.error('[DVP-HTTPProgrammingMonitorAPI] - [%s]  - Redis client started ',reqId);
            }
            else
            {
                logger.debug('[DVP-HTTPProgrammingMonitorAPI] - [%s]  - Mail sending starts for Application  :  %s',reqId,Jobj.APPID);
                Mailer.AlertSender(res,'Application Upload Notification','Your new application '+Jobj.DisplayName+ ' is successfully uploaded and Application ID will be '+Jobj.APPID,reqId,function(errAlert,ResAlert)
                {
                    if(errAlert)
                    {
                        console.error(errAlert);
                    }
                    else
                    {
                        console.log(ResAlert);
                    }
                });
            }
        })
    }
    else
    {
        if(MsgTyp == DataError)
        {
            logger.debug('[DVP-HTTPProgrammingMonitorAPI] - [%s]  - Message type :  %s',reqId,DataError);
            GetErrorCount(Jobj.APPID,reqId,function(errCount,resCount)
            {
                if(errCount)
                {
                    //console.error(errCount);
                }
                else
                {
                    var Count=parseInt(resCount);
                    logger.debug('[DVP-HTTPProgrammingMonitorAPI] - [%s]  - %s Errors found in Application  :  %s',reqId,Count,APPID);
                    if(Count>=9)
                    {
                        Mailer.GetAppDeveloperMail(Jobj.APPID,reqId,function(err,res)
                        {
                            if(err)
                            {
                                console.error(err);
                            }
                            else
                            {
                                logger.debug('[DVP-HTTPProgrammingMonitorAPI] - [%s]  - Mail sending starts for Application  :  %s',reqId,Jobj.APPID);
                                Mailer.AlertSender(res,'Error Notification','Your Apllication '+Jobj.APPID+' is come up with 10 errors.Please check',reqId,function(errAlert,ResAlert)
                                {
                                    if(errAlert)
                                    {
                                        console.error(errAlert);
                                    }
                                    else
                                    {
                                        try {
                                            var NewErrobj = DbConn.ApplicationErrors
                                                .build(
                                                {
                                                    VoiceAppID: Jobj.VoiceAppID,
                                                    Code: Jobj.Code,
                                                    Message: Jobj.Description,
                                                    SessionID: Jobj.SessionID,
                                                    URL: Jobj.URL
                                                }
                                            );
                                            logger.debug('[DVP-HTTPProgrammingMonitorAPI] - [%s]  - New DataError details of  Application  :  %s - Data - %s',reqId,APPID,JSON.stringify(NewErrobj));
                                        }
                                        catch (ex)
                                        {
                                            logger.error('[DVP-HTTPProgrammingMonitorAPI] - [%s]  - Exception occurred while creating New DataError details of  Application  :  %s ',reqId,Jobj.APPID,ex);
                                            console.error(ex);
                                        }

                                        try
                                        {
                                            NewErrobj.save().complete(function (errSave,resultSave)
                                            {

                                                if(err)
                                                {
                                                    logger.error('[DVP-HTTPProgrammingMonitorAPI] - [%s] - [PGSQL] - Error occurred while saving New DataError details of  Application  :  %s ',reqId,Jobj.APPID,err);
                                                    console.error(errSave);
                                                }
                                                else
                                                {
                                                    logger.debug('[DVP-HTTPProgrammingMonitorAPI] - [%s] - [PGSQL] -  New DataError details of  Application  :  %s is successfully saved',reqId,Jobj.APPID);
                                                    console.log(resultSave);
                                                }
                                            })
                                        }
                                        catch(ex)
                                        {
                                            logger.error('[DVP-HTTPProgrammingMonitorAPI] - [%s] - [PGSQL] - Exception occurred when saving New DataError details of  Application  :  %s ',reqId,Jobj.APPID,ex);
                                            console.error(ex);
                                        }
                                    }
                                });
                            }
                        })
                    }
                }

            })
        }

        else if(MsgTyp == HttpError )
        {
            logger.debug('[DVP-HTTPProgrammingMonitorAPI] - [%s]  - Message type :  %s',reqId,HttpError);
            GetErrorCount(Jobj.APPID,reqId,function(errCount,resCount)
            {
                if(errCount)
                {
                    console.error(errCount);
                }
                else
                {
                    var Count=parseInt(resCount);
                    logger.debug('[DVP-HTTPProgrammingMonitorAPI] - [%s]  - %s Errors found in Application  :  %s',reqId,Count,APPID);
                    if(Count>=9)
                    {
                        Mailer.GetAppDeveloperMail(Jobj.APPID,reqId,function(err,res)
                        {
                            if(err)
                            {
                                console.error(err);
                            }
                            else
                            {
                                logger.debug('[DVP-HTTPProgrammingMonitorAPI] - [%s]  - Mail sending starts for Application  :  %s',reqId,Jobj.APPID);
                                Mailer.AlertSender(res,'Error Notification','Your Application '+Jobj.APPID+' is come up with 10 errors.Please check',reqId,function(errAlert,ResAlert)
                                {
                                    if(errAlert)
                                    {
                                        console.error(errAlert);
                                    }
                                    else
                                    {
                                        try {
                                            var NewErrobj = DbConn.ApplicationErrors
                                                .build(
                                                {
                                                    VoiceAppID: Jobj.VoiceAppID,
                                                    Code: Jobj.Code,
                                                    Message: Jobj.Description,
                                                    SessionID: Jobj.SessionID,
                                                    URL: Jobj.URL
                                                }
                                            );
                                            logger.debug('[DVP-HTTPProgrammingMonitorAPI] - [%s]  - New HttpError details of  Application  :  %s - Data - %s',reqId,APPID,JSON.stringify(NewErrobj));
                                        }
                                        catch (ex)
                                        {
                                            logger.error('[DVP-HTTPProgrammingMonitorAPI] - [%s]  - Exception occurred while creating New HttpError details of  Application  :  %s ',reqId,APPID,ex);
                                            //console.error(ex);
                                        }

                                        try
                                        {
                                            NewErrobj.save().complete(function (errSave,resultSave)
                                            {

                                                if(err)
                                                {
                                                    logger.error('[DVP-HTTPProgrammingMonitorAPI] - [%s] - [PGSQL] - Error occurred while saving New HttpError details of  Application  :  %s ',reqId,Jobj.APPID,err);
                                                    console.error(errSave);
                                                }
                                                else
                                                {
                                                    logger.debug('[DVP-HTTPProgrammingMonitorAPI] - [%s] - [PGSQL] -  New HttpError details of  Application  :  %s is successfully saved',reqId,Jobj.APPID);
                                                    console.log(resultSave);
                                                }
                                            })
                                        }
                                        catch(ex)
                                        {
                                            logger.error('[DVP-HTTPProgrammingMonitorAPI] - [%s] - [PGSQL] - Exception occurred when saving New HttpErrory details of  Application  :  %s ',reqId,Jobj.APPID,ex);
                                            console.error(ex);
                                        }
                                    }
                                });
                            }
                        })
                    }
                }

            })
        }
    }

    //var channelactivate = "CSCOMMAND:"+config.Freeswitch.id+":profileactivate";

});

/////////////////////////////////////////////////////////create resource/////////////////////////
server.put('/API/call/'+version+'/:account/:guid/:action', send);
server.put('/API/dialer/'+version+'/:account/:action', send);
server.put('/API/conference/'+version+'/:account/:action', send);


////////////////////////////////////////////////////////modify resource//////////////////////////
server.post('/API/call/'+version+'/:account/:guid/:action', function actionmodify(req, res, next) {
    res.send(201, Math.random().toString(36).substr(3, 8));
    return next();
});


/////////////////////////////////////////////////////get resource details//////////////////////////
server.get('/API/livecall/all/'+version+'/:account/:number', function (req, res, next) {


    ////////////////////////validate accountID////////////////////////////////////////////////////////

    var account = req.params.account;
    var number = req.params.number;


    redisClient.lrange(req.params.number + "_live",0,-1, function (err, value) {

        var uuid_dev;
        if (err) {
            console.error("error");

            var errordata = { result: "unexpecter error occured" };
            res.writeHead(200, { "Content-Type": "text/json" });
            res.write(JSON.stringify(errordata));
            res.end();
        }
        else {


            if(!value)
            {

                var errordata = { result: "nodata" };
                res.writeHead(200, { "Content-Type": "text/json" });
                res.write(JSON.stringify(errordata));
                res.end();

            }
            else
            {
                var sessionData = { result: "data", ids : value};
                res.writeHead(200, { "Content-Type": "text/json" });
                res.write(JSON.stringify(sessionData));
                res.end();

            }

            //console.log("Worked: " + value);

        }
    });

    return next();
});



////////////////////////////////////////////////////////////get command data/////////////////////////////////

server.get('/API/livecall/flowinfo/'+version+'/:account/:guid', function (req, res, next) {


    ////////////////////////validate accountID////////////////////////////////////////////////////////

    var account = req.params.account;
    var callid = req.params.uuid;


    redisClient.lrange(req.params.number + "_command",0,-1, function (err, value) {

        var uuid_dev;
        if (err) {
            console.error("error");

            var errordata = { result: "unexpecter error occured" };
            res.writeHead(200, { "Content-Type": "text/json" });
            res.write(JSON.stringify(errordata));
            res.end();
        }
        else {


            if(!value)
            {

                var errordata = { result: "nodata" };
                res.writeHead(200, { "Content-Type": "text/json" });
                res.write(JSON.stringify(errordata));
                res.end();

            }
            else
            {
                var sessionData = { result: "data", ids : value};
                res.writeHead(200, { "Content-Type": "text/json" });
                res.write(JSON.stringify(sessionData));
                res.end();

            }

            //console.log("Worked: " + value);

        }
    });

    return next();
});




////////////////////////////////////////////////////////////get error data/////////////////////////////////////

server.get('/API/developerinfo/'+version+'/:account/:number', function (req, res, next) {


    ////////////////////////validate accountID////////////////////////////////////////////////////////

    var account = req.params.account;
    var number = req.params.number;


    redisClient.lrange(req.params.number + "_error",0,-1,function (err, value) {

        var uuid_dev;
        if (err) {
            console.error("error");

            var errordata = { result: "unexpecter error occured" };
            res.writeHead(200, { "Content-Type": "text/json" });
            res.write(JSON.stringify(errordata));
            res.end();
        }
        else {


            if(!value)
            {

                var errordata = { result: "nodata" };
                res.writeHead(200, { "Content-Type": "text/json" });
                res.write(JSON.stringify(errordata));
                res.end();

            }
            else
            {
                var sessionData = { result: "data", errors : value};
                res.writeHead(200, { "Content-Type": "text/json" });
                res.write(JSON.stringify(sessionData));
                res.end();

            }

            //console.log("Worked: " + value);

        }
    });

    return next();
});



server.get('/API/livecall/calldata/'+version+'/:account/:guid', function (req, res, next) {

    ////////////////////////validate accountID////////////////////////////////////////////////////////

    var account = req.params.account;
    var callid = req.params.guid;


    redisClient.get(callid + "_dev", function (err, value) {

        var uuid_dev;
        if (err) {
            console.error("error");

            var errordata = { result: "unexpecter error occured" };
            res.writeHead(200, { "Content-Type": "text/json" });
            res.write(JSON.stringify(errordata));
            res.end();
        }
        else {


            if(!value)
            {

                var errordata = { result: "nodata" };
                res.writeHead(200, { "Content-Type": "text/json" });
                res.write(JSON.stringify(errordata));
                res.end();

            }
            else
            {

                var originalcalldata = JSON.parse(value);
                var body = { session: originalcalldata.serverdata["session_id"], direction: originalcalldata.serverdata["Caller-Direction"], ani: originalcalldata.serverdata["Caller-ANI"], dnis: originalcalldata.serverdata["Caller-Destination-Number"], name: originalcalldata.serverdata["Caller-Caller-ID-Name"], time :  originalcalldata.serverdata["Caller-Channel-Created-Time"], nexturl : originalcalldata["nexturl"], currenturl : originalcalldata["currenturl"], result : originalcalldata["result"], lastcommand : originalcalldata["lastcommand"], lastresult : originalcalldata["lastresult"]};

                var sessionData = { result: "data", calldata : body};
                res.writeHead(200, { "Content-Type": "text/json" });
                res.write(JSON.stringify(sessionData));
                res.end();

            }

            //console.log("Worked: " + value);

        }
    });

    return next();
});



//server.head('/API/call/:version/:account/:guid/:action', send);


//////////////////////////////////////////////////////delete resource////////////////////////////////
server.del('/API/developerinfo/'+version+'/:account/:number', function rm(req, res, next) {

    var number = req.params.number;
    redisClient.del(number + "_error", redis.print);
    res.send(204);
    return next();
});



//................................................PAWAN......................................................

//////////////////////////////////////////////////////Get Error Records of Application////////////////////////////////
//server.get('DVP/'+version+'/HTTPProgrammingMonitorAPI/ErrorMonitor/GetAllErrorRecordsOfApplication/:AppID/:Company/:Tenent',function(req,res,next)
server.get('DVP/'+version+'/HTTPProgrammingMonitorAPI/ErrorMonitor/GetAllErrorRecordsOfApplication/:AppID/:Company/:Tenant',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }
    logger.debug('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllErrorRecordsOfApplication] - [%s] - [HTTP]  - Request received -  Data - Application : %s of Company : %s and Tenant : %s',reqId,req.params.AppID,req.params.Company,req.params.Tenant);
    ErrorMonitor.GetAllErrorRecordsOfApplication(req.params.AppID,req.params.Company,req.params.Tenent,reqId,function(err,Rec)
    {
        if(err)
        {
            res.end(err);
        }
        else
        {
            res.end(Rec);
        }
    });
    return next();
});


//////////////////////////////////////////////////////Get Error Records of Application by Error Code////////////////////////////////

server.get('DVP/'+version+'/HTTPProgrammingMonitorAPI/ErrorMonitor/GetAllErrorRecordsOfApplicationByErrorCode/:AppID/:ECode/:Company/:Tenent',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }
    logger.debug('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllErrorRecordsOfApplicationByErrorCode] - [%s] - [HTTP]  - Request received -  Data - Application : %s of Company : %s and Tenant : %s and ErrorCode : %s',reqId,req.params.AppID,req.params.Company,req.params.Tenant,req.params.ECode);

    try
    {
        ErrorMonitor.GetAllErrorRecordsOfApplicationByErrorCode(req.params.AppID, req.params.ECode, req.params.Company, req.params.Tenent, function (err, Rec) {
            if (err) {
                res.end(err);
            }
            else {
                res.end(Rec);
            }
        });
    }
    catch(ex)
    {
        logger.error('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllErrorRecordsOfApplicationByErrorCode] - [%s] - [HTTP]  - Exception occurred when starting service : GetAllErrorRecordsOfApplicationByErrorCode -  Data - Application : %s of Company : %s and Tenant : %s and ErrorCode : %s',reqId,req.params.AppID,req.params.Company,req.params.Tenant,req.params.ECode,ex);
    }

    return next();
});

//////////////////////////////////////////////////////Get Error Records of Application by Company////////////////////////////////

//server.get('DVP/'+version+'/HTTPProgrammingMonitorAPI/ErrorMonitor/GetAllErrorRecordsOfApplicationByCompany/:AppID/:Company',function(req,res,next)
server.get('DVP/'+version+'/HTTPProgrammingMonitorAPI/ErrorMonitor/GetAllErrorRecordsOfApplicationsByCompany/:AppID/:Company',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }
    try {
        logger.debug('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllErrorRecordsOfApplicationsByCompany] - [%s] - [HTTP]  - Request received -  Data - Application : %s of Company : %s and Tenant : %s and ErrorCode : %s',reqId,req.params.AppID,req.params.Company,req.params.Tenant,req.params.ECode);
        ErrorMonitor.GetAllErrorRecordsOfApplicationByCompany(req.params.Company,reqId, function (err, Rec) {
            if (err)
            {
                res.end(err);
            }
            else {
                res.end(Rec);
            }
        });
    }
    catch(ex)
    {
        logger.error('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllErrorRecordsOfApplicationsByCompany] - [%s] - [HTTP]  - Exception occurred when starting service : GetAllErrorRecordsOfApplicationByErrorCode -  Data -  Company : %s ',reqId,req.params.Company,ex);
    }
    return next();
});


//////////////////////////////////////////////////////Get All VoiceApp Activities By SessionID////////////////////////////////

//server.get('DVP/'+version+'/HTTPProgrammingMonitorAPI/ErrorMonitor/GetAllErrorRecordsOfApplicationByCompany/:Company/:Tenent/:SID',function(req,res,next)
server.get('DVP/'+version+'/HTTPProgrammingMonitorAPI/ErrorMonitor/GetAllVoiceAppActivitiesBySessionID/:Company/:Tenant/:SID',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }
    try
    {
        logger.debug('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllVoiceAppActivitiesBySessionID] - [%s] - [HTTP]  - Request received -  Data - Application : %s of Company : %s and Tenant : %s and Session ID : %s',reqId,req.params.AppID,req.params.Company,req.params.Tenant,req.params.SID);
        VoiceActivityFlow.GetAllVoiceAppActivitiesBySessionID(req.params.Company, req.params.Tenent, req.params.SID,reqId,function (err, Rec) {
            if (err)
            {

                res.end(err);
            }
            else {
                res.end(Rec);
            }
        });
    }
    catch(ex)
    {
        logger.error('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllVoiceAppActivitiesBySessionID] - [%s] - [HTTP]  - Exception occurred when starting service : GetAllVoiceAppActivitiesBySessionID -  Data -  Company : %s Tenant : %s SessionID : %s',reqId,req.params.Company,req.params.Tenant,req.params.SID,ex);
    }
    return next();
});

//////////////////////////////////////////////////////Get All VoiceApp Activities By EventCatagory////////////////////////////////

//server.get('DVP/'+version+'/HTTPProgrammingMonitorAPI/ErrorMonitor/GetAllVoiceAppActivitiesByEventCatagory/:Company/:Tenent/:ECAT',function(req,res,next)
server.get('DVP/'+version+'/HTTPProgrammingMonitorAPI/ErrorMonitor/GetAllVoiceAppActivitiesByEventCatagory/:Company/:Tenant/:ECAT',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }
    try {
        logger.debug('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllVoiceAppActivitiesByEventCatagory] - [%s] - [HTTP]  - Request received -  Data - Application : %s of Company : %s and Tenant : %s and Catagory : %s', reqId, req.params.AppID, req.params.Company, req.params.Tenant, req.params.ECAT);
        VoiceActivityFlow.GetAllVoiceAppActivitiesByEventCatagory(req.params.Company, req.params.Tenent, req.params.ECAT,reqId,function (err, Rec) {
            if (err)
            {
                res.end(err);
            }
            else {
                res.end(Rec);
            }
        });
    }
    catch(ex)
    {
        logger.error('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllVoiceAppActivitiesBySessionID] - [%s] - [HTTP]  - Exception occurred when starting service : GetAllVoiceAppActivitiesBySessionID -  Data -  Company : %s Tenant : %s catagory : %s',reqId,req.params.Company,req.params.Tenant,req.params.ECAT,ex);
    }
    return next();
});

function GetErrorCount(AppID,reqId,callback)
{
    try
    {
        DbConn.ApplicationErrors.count({where:[{VoiceAppID:AppID}]}).complete(function(Err,ErrObj)
        {
            if(Err)
            {
                logger.debug('[DVP-HTTPProgrammingMonitorAPI.ErrorCount] - [%s] - [PGSQL] -  Error occurred while searching ApplicationErrors of Application %s',reqId,AppID,err);
                callback(Err,undefined);
            }
            else
            {
                logger.debug('[DVP-HTTPProgrammingMonitorAPI.ErrorCount] - [%s] - [PGSQL] - Records found for ApplicationErrors of Application %s',reqId,AppID,JSON.stringify(ErrObj));
                callback(undefined,JSON.stringify(ErrObj));
            }
        });
    }
    catch(ex)
    {

    }
}

/*
 //////////////////////////////////////////////////////Get All VoiceApp Activities By BetweenEventTimes////////////////////////////////

 server.get('DVP/'+version+'/HTTPProgrammingMonitorAPI/ErrorMonitor/GetAllVoiceAppActivitiesBetweenEventTimes/:Company/:Tenent/:ECAT/:DTO/:DTT)',function(req,res,next)
 {
 console.log(new Date(Date.parse(req.params.DTO)));
 console.log(new Date(Date.parse(req.params.DTT)));
 VoiceActivityFlow.GetAllVoiceAppActivitiesBetweenEventTimes(req.params.Company,req.params.Tenent,req.params.ECAT,req.params.DTO,req.params.DTT,function(err,Rec)
 {
 if(err)
 {
 res.send(err);
 res.end();
 }
 else
 {
 res.send(Rec);
 res.end();
 }
 })
 return next();
 });
 */



process.stdin.resume();