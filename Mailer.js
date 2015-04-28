/**
 * Created by pawan on 4/27/2015.
 */

var restify = require('restify');
var stringify=require('stringify');
var DbConn = require('DVP-DBModels');

var nodemailer = require('nodemailer');

// create reusable transporter object using SMTP transport

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'pawan@duosoftware.com',
        pass: 'my@0112257699aps'
    }
});


function AlertSender(To,Subject,body,callback)
{
    var mailOptions = {
        from: 'Duo Voice', // sender address
        to: To, // list of receivers
        subject: Subject, // Subject line
        text: body // plaintext body
        // html body
    };

    try {


        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                //console.log(error);
                callback(err, undefined);
            } else {
                //console.log('Message sent: ' + info.response);
                callback(undefined, info.response);
            }
        });
    }
    catch(ex)
    {
        callback(ex, undefined);
    }

}

function GetAppDeveloperMail(AppID,callback)
{

    DbConn.Application.find({where:{id:AppID},include:[{model:DbConn.AppDeveloper,as :"AppDeveloper"}]}).complete(function(err,result)
    {
        if(err)
        {
            callback(err,undefined);
        }
        else
        {
            callback(undefined,result.Email);
        }
    });
}

function GetErrorCount(AppID,callback)
{
    DbConn.ApplicationErrors.count({where:{VoiceAppID:AppID}}).complete(function(err,result)
    {
        if(err)
        {
            callback(err,undefined);
        }
        else
        {
            callback(undefined,result);
        }
    })
}


module.exports.AlertSender = AlertSender;
module.exports.GetAppDeveloperMail = GetAppDeveloperMail;
module.exports.GetErrorCount = GetErrorCount;




