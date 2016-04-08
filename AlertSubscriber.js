/**
 * Created by pawan on 4/28/2015.
 */
var stringify=require('stringify');
var redis=require('redis');
var DbConn = require('dvp-dbmodels');
var config = require('config');
var Mailer=require('./Mailer.js');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;

var redisClient = redis.createClient(ip,port);
redisClient.auth(config.Security.password, function (error) {

    console.log("Error in Redis Auth :" + error);
});
redisClient.on("error", function (err) {
    console.log("Error " + err);


});


var FileUploaded='SYS:HTTPPROGRAMMING:FILEUPLOADED';
var DataError='SYS:HTTPPROGRAMMING:DATAERROR';
var HttpError='SYS:HTTPPROGRAMMING:HTTPERROR';

redisClient.subscribe(FileUploaded);
redisClient.subscribe(DataError);
redisClient.subscribe(HttpError);


redisClient.on('message', function (MsgTyp, message) {


    var Jobj=JSON.parse(message);

    if(MsgTyp = FileUploaded )
    {
        Mailer.GetAppDeveloperMail(Jobj.APPID,function(err,res)
        {
            if(err)
            {

            }
            else
            {
                Mailer.AlertSender(res,'Application Upload Notification','Your new application '+Jobj.DisplayName+ ' is successfully uploaded and Application ID will be '+APPID,function(errAlert,ResAlert)
                {
                    if(errAlert)
                    {

                    }
                    else
                    {

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

                            }
                            else
                            {
                                Mailer.AlertSender(res,'Error Notification','Your Apllication '+Jobj.APPID+' is come up with 10 errors.',function(errAlert,ResAlert)
                                {
                                    if(errAlert)
                                    {

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

                                        }

                                        try
                                        {
                                            NewErrobj.save().complete(function (err,result)
                                            {

                                                if(err)
                                                {

                                                }
                                                else
                                                {

                                                }
                                            })
                                        }
                                        catch(ex)
                                        {

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

                            }
                            else
                            {
                                Mailer.AlertSender(res,'Error Notification','Your Application '+Jobj.APPID+' is come up with 10 errors.',function(errAlert,ResAlert)
                                {
                                    if(errAlert)
                                    {

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

                                        }

                                        try
                                        {
                                            NewErrobj.save().complete(function (err,result)
                                            {

                                                if(err)
                                                {

                                                }
                                                else
                                                {

                                                }
                                            })
                                        }
                                        catch(ex)
                                        {

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



