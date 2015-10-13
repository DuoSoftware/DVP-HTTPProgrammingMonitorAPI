/**
 * Created by pawan on 4/22/2015.
 */

var restify = require('restify');
var stringify=require('stringify');
var DbConn = require('dvp-dbmodels');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;


function SaveErrors(ErrObj,callback)
{
    try {
        var NewErrobj = DbConn.LimitInfo
            .build(
            {
                VoiceAppID: ErrObj.VoiceAppID,
                Code: ErrObj.Code,
                Message: ErrObj.Message,
                CompanyId: ErrObj.CompanyId,
                TenantId: ErrObj.TenantId
            }
        )
    }
    catch (ex)
    {
        callback(ex,undefined);
    }

    try
    {
        NewErrobj.save().complete(function (err,result)
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
    catch(ex)
    {
        callback(ex,undefined);
    }
}

function ErrorDeletion(AppID,callback)
{
    try
    {
        DbConn.ApplicationErrors.destoy({where:[{VoiceAppID:AppID}]}).then(function(raws)
        {
            callback(undefined,raws+" affected");
        })
    }
    catch(ex)
    {
        callback(ex,undefined);
    }
}

function DeleteAllErrors(callback)
{
    try
    {
        DbConn.ApplicationErrors.destoy().then(function(raws)
        {
            callback(undefined,raws+" affected");
        })
    }
    catch(ex)
    {
        callback(ex,undefined);
    }
}

module.exports.SaveErrors = SaveErrors;
module.exports.ErrorDeletion = ErrorDeletion;
module.exports.DeleteAllErrors = DeleteAllErrors;
