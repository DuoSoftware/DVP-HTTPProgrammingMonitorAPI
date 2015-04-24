/**
 * Created by pawan on 4/21/2015.
 */

var restify = require('restify');
var stringify=require('stringify');
var DbConn = require('DVP-DBModels');


function GetAllErrorRecordsOfApplication(AppID,Company,Tenent,callback)
{
    try
    {
        DbConn.Application.find({where:[{id:AppID}]}).complete(function(err,AppObj)
        {
            if(err)
            {
                callback(err,undefined);
            }
            else
            {
                if(AppObj.CompanyId==Company && AppObj.TenantId==Tenent)
                {
                    try
                    {
                        DbConn.ApplicationErrors.findAll({where:[{VoiceAppID:AppID},{CompanyId:Company},{TenantId:Tenent}]}).complete(function(errVE,ErrObj)
                        {
                           if(errVE)
                           {
                               callback(errVE,undefined);
                           }
                            else
                           {
                               callback(undefined,JSON.stringify(ErrObj));
                           }
                        });
                    }
                    catch(ex)
                    {
                        callback(ex,undefined);
                    }
                }
                else
                {
                    callback("Illegal Access ",undefined);
                }
            }
        })
    }
    catch(ex)
    {
        callback(ex,undefined);
    }

}

function GetAllErrorRecordsOfApplicationByErrorCode(AppID,ECode,Company,Tenent,callback)
{
    try
    {
        DbConn.Application.find({where:[{id:AppID}]}).complete(function(err,AppObj)
        {
            if(err)
            {
                callback(err,undefined);
            }
            else
            {
                if(AppObj.CompanyId==Company && AppObj.TenantId==Tenent)
                {
                    try
                    {
                        DbConn.ApplicationErrors.find({where:[{VoiceAppID:AppID},{CompanyId:Company},{TenantId:Tenent},{Code:ECode}]}).complete(function(errVE,ErrObj)
                        {
                            if(errVE)
                            {
                                callback(errVE,undefined);
                            }
                            else
                            {
                                callback(undefined,JSON.stringify(ErrObj));
                            }
                        });
                    }
                    catch(ex)
                    {
                        callback(ex,undefined);
                    }
                }
                else
                {
                    callback("Illegal Access ",undefined);
                }
            }
        })
    }
    catch(ex)
    {
        callback(ex,undefined);
    }

}

function GetAllErrorRecordsOfApplicationByCompany(AppID,Company,callback)
{
    try
    {
        DbConn.Application.find({where:[{id:AppID}]}).complete(function(err,AppObj)
        {
            if(err)
            {
                callback(err,undefined);
            }
            else
            {
                if(AppObj.CompanyId==Company)
                {
                    try
                    {
                        DbConn.ApplicationErrors.find({where:[{VoiceAppID:AppID},{CompanyId:Company}]}).complete(function(errVE,ErrObj)
                        {
                            if(errVE)
                            {
                                callback(errVE,undefined);
                            }
                            else
                            {
                                callback(undefined,JSON.stringify(ErrObj));
                            }
                        });
                    }
                    catch(ex)
                    {
                        callback(ex,undefined);
                    }
                }
                else
                {
                    callback("Illegal Access ",undefined);
                }
            }
        })
    }
    catch(ex)
    {
        callback(ex,undefined);
    }

}

module.exports.GetAllErrorRecordsOfApplication = GetAllErrorRecordsOfApplication;
module.exports.GetAllErrorRecordsOfApplicationByErrorCode = GetAllErrorRecordsOfApplicationByErrorCode;
module.exports.GetAllErrorRecordsOfApplicationByCompany = GetAllErrorRecordsOfApplicationByCompany;
