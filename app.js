
var restify = require('restify');
var redis = require('redis');
var config = require('config');
var Mailer=require('./Mailer.js');

var port = config.Host.port || 3000;
var version=config.Host.version;
var Rport=config.Redis.port;
var ip=config.Redis.ip;

var ErrorMonitor=require('./ErrorMonitor.js');
var VoiceActivityFlow=require('./VoiceActivityFlow.js');


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
    console.log(port);
});

////////////////////////////////////////////////////////////////////


function send(req, res, next) {
    res.send('API ' + ' '+req.params.account+' '+req.params.guid);
    return next();
}

//pawan
//Alert services

redisClient.on('pmessage', function (pattern, MsgTyp, message) {


    var Jobj=JSON.parse(message);

    if(MsgTyp = FileUploaded )
    {
        Mailer.GetAppDeveloperMail(Jobj.APPID,function(err,res)
        {
            if(err)
            {
                console.error(err);
            }
            else
            {
                Mailer.AlertSender(res,'Application Upload Notification','Your new application '+Jobj.DisplayName+ ' is successfully uploaded and Application ID will be '+APPID,function(errAlert,ResAlert)
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
        if(MsgTyp = DataError)
        {
            GetErrorCount(Jobj.APPID,function(errCount,resCount)
            {
                if(errCount)
                {
                    console.error(errCount);
                }
                else
                {
                    var Count=parseInt(resCount);
                    if(Count>=9)
                    {
                        Mailer.GetAppDeveloperMail(Jobj.APPID,function(err,res)
                        {
                            if(err)
                            {
                                console.error(err);
                            }
                            else
                            {
                                Mailer.AlertSender(res,'Error Notification','Your Apllication '+Jobj.APPID+' is come up with 10 errors.Please check',function(errAlert,ResAlert)
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
                                            )
                                        }
                                        catch (ex)
                                        {
                                            console.error(ex);
                                        }

                                        try
                                        {
                                            NewErrobj.save().complete(function (errSave,resultSave)
                                            {

                                                if(err)
                                                {
                                                    console.error(errSave);
                                                }
                                                else
                                                {
                                                    console.log(resultSave);
                                                }
                                            })
                                        }
                                        catch(ex)
                                        {
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

        else if(MsgTyp = HttpError )
        {
            GetErrorCount(Jobj.APPID,function(errCount,resCount)
            {
                if(errCount)
                {
                    console.error(errCount);
                }
                else
                {
                    var Count=parseInt(resCount);
                    if(Count>=9)
                    {
                        Mailer.GetAppDeveloperMail(Jobj.APPID,function(err,res)
                        {
                            if(err)
                            {
                                console.error(err);
                            }
                            else
                            {
                                Mailer.AlertSender(res,'Error Notification','Your Application '+Jobj.APPID+' is come up with 10 errors.Please check',function(errAlert,ResAlert)
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
                                            )
                                        }
                                        catch (ex)
                                        {
                                            console.error(ex);
                                        }

                                        try
                                        {
                                            NewErrobj.save().complete(function (errSave,resultSave)
                                            {

                                                if(err)
                                                {
                                                    console.error(errSave);
                                                }
                                                else
                                                {
                                                    console.log(resultSave);
                                                }
                                            })
                                        }
                                        catch(ex)
                                        {
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
server.get('DVP/'+version+'/HTTPProgrammingMonitorAPI/ErrorMonitor/GetAllErrorRecordsOfApplication/:AppID/:Company/:Tenent',function(req,res,next)
{
    ErrorMonitor.GetAllErrorRecordsOfApplication(req.params.AppID,req.params.Company,req.params.Tenent,function(err,Rec)
    {
        if(err)
        {
            res.end(err);
        }
        else
        {
            res.end(Rec);
        }
    })
    return next();
});


//////////////////////////////////////////////////////Get Error Records of Application by Error Code////////////////////////////////

server.get('DVP/'+version+'/HTTPProgrammingMonitorAPI/ErrorMonitor/GetAllErrorRecordsOfApplicationByErrorCode/:AppID/:ECode/:Company/:Tenent',function(req,res,next)
{
    ErrorMonitor.GetAllErrorRecordsOfApplicationByErrorCode(req.params.AppID,req.params.ECode,req.params.Company,req.params.Tenent,function(err,Rec)
    {
        if(err)
        {
            res.end(err);
        }
        else
        {
            res.end(Rec);
        }
    })
    return next();
});

//////////////////////////////////////////////////////Get Error Records of Application by Company////////////////////////////////

server.get('DVP/'+version+'/HTTPProgrammingMonitorAPI/ErrorMonitor/GetAllErrorRecordsOfApplicationByCompany/:AppID/:Company',function(req,res,next)
{
    ErrorMonitor.GetAllErrorRecordsOfApplicationByErrorCode(req.params.AppID,req.params.Company,function(err,Rec)
    {
        if(err)
        {
            res.end(err);
        }
        else
        {
            res.end(Rec);
        }
    })
    return next();
});


//////////////////////////////////////////////////////Get All VoiceApp Activities By SessionID////////////////////////////////

server.get('DVP/'+version+'/HTTPProgrammingMonitorAPI/ErrorMonitor/GetAllErrorRecordsOfApplicationByCompany/:Company/:Tenent/:SID',function(req,res,next)
{
    VoiceActivityFlow.GetAllVoiceAppActivitiesBySessionID(req.params.Company,req.params.Tenent,req.params.SID,function(err,Rec)
    {
        if(err)
        {
            res.end(err);
        }
        else
        {
            res.end(Rec);
        }
    })
    return next();
});

//////////////////////////////////////////////////////Get All VoiceApp Activities By EventCatagory////////////////////////////////

server.get('DVP/'+version+'/HTTPProgrammingMonitorAPI/ErrorMonitor/GetAllVoiceAppActivitiesByEventCatagory/:Company/:Tenent/:ECAT',function(req,res,next)
{
    VoiceActivityFlow.GetAllVoiceAppActivitiesByEventCatagory(req.params.Company,req.params.Tenent,req.params.ECAT,function(err,Rec)
    {
        if(err)
        {
            res.end(err);
        }
        else
        {
            res.end(Rec);
        }
    })
    return next();
});

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