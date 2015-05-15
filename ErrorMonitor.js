/**
 * Created by pawan on 4/21/2015.
 */

var restify = require('restify');
var stringify=require('stringify');
var DbConn = require('DVP-DBModels');
var logger = require('DVP-Common/LogHandler/CommonLogHandler.js').logger;


function GetAllErrorRecordsOfApplication(AppID,Company,Tenant,reqId,callback)
{
    try
    {
        logger.debug('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllErrorRecordsOfApplication] - [%s] -  Searching All Error Records Of Application %s -  Data - Application : %s of Company : %s and Tenant : %s',reqId,AppID,Company,Tenant);
        DbConn.Application.find({where:[{id:AppID}]}).complete(function(err,AppObj)
        {
            if(err)
            {
                logger.error('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllErrorRecordsOfApplication] - [%s] - [PGSQL] - Error occurred while searching Application %s ',reqId,AppID,err);
                callback(err,undefined);
            }
            else
            {

                if(AppObj.CompanyId==Company && AppObj.TenantId==Tenant)
                {
                    logger.debug('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllErrorRecordsOfApplication] - [%s] - [PGSQL] - Company and Tenant is matched for received Application details %s ',reqId,AppID);
                    try
                    {
                        DbConn.ApplicationErrors.findAll({where:[{VoiceAppID:AppID},{CompanyId:Company},{TenantId:Tenant}]}).complete(function(errVE,ErrObj)
                        {
                           if(errVE)
                           {
                               logger.error('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllErrorRecordsOfApplication] - [%s] - [PGSQL] - Error occurred while searching Errors of Application %s ',reqId,AppID,errVE);
                               callback(errVE,undefined);
                           }
                            else
                           {
                               logger.debug('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllErrorRecordsOfApplication] - [%s] - [PGSQL] - Errors found for Application %s Successfully',reqId,AppID);
                               callback(undefined,JSON.stringify(ErrObj));
                           }
                        });
                    }
                    catch(ex)
                    {
                        logger.error('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllErrorRecordsOfApplication] - [%s] - [PGSQL] - Exception occurred while searching Errors of Application %s ',reqId,AppID,ex);
                        callback(ex,undefined);
                    }
                }
                else
                {
                    logger.error('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllErrorRecordsOfApplication] - [%s] - [PGSQL] - Company and Tenant is not matched for received Application details %s ',reqId,AppID);
                    callback("Illegal Access ",undefined);
                }
            }
        })
    }
    catch(ex)
    {
        logger.error('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllErrorRecordsOfApplication] - [%s] - [PGSQL] - Exception occurred when starts GetAllErrorRecordsOfApplication %s ',reqId,AppID,ex);
        callback(ex,undefined);
    }

}

function GetAllErrorRecordsOfApplicationByErrorCode(AppID,ECode,Company,Tenant,reqId,callback)
{
    try
    {
        logger.debug('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllErrorRecordsOfApplicationByErrorCode] - [%s] -  Searching All Error Records Of Application %s  by Error Code %s -  Data - Application : %s of Company : %s and Tenant : %s',reqId,AppID,ECode,Company,Tenant);
        DbConn.Application.find({where:[{id:AppID}]}).complete(function(err,AppObj)
        {
            if(err)
            {
                logger.error('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllErrorRecordsOfApplicationByErrorCode] - [%s] - [PGSQL] - Error occurred while searching Application %s ',reqId,AppID,err);
                callback(err,undefined);
            }
            else
            {
                if(AppObj.CompanyId==Company && AppObj.TenantId==Tenant)
                {
                    logger.debug('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllErrorRecordsOfApplicationByErrorCode] - [%s] - [PGSQL] - Company and Tenant is matched for received Application details %s ',reqId,AppID);
                    try
                    {
                        DbConn.ApplicationErrors.find({where:[{VoiceAppID:AppID},{CompanyId:Company},{TenantId:Tenant},{Code:ECode}]}).complete(function(errVE,ErrObj)
                        {
                            if(errVE)
                            {
                                logger.error('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllErrorRecordsOfApplicationByErrorCode] - [%s] - [PGSQL] - Error occurred while searching Errors of Application %s with ErrorCode %s',reqId,AppID,ECode,errVE);
                                callback(errVE,undefined);
                            }
                            else
                            {
                                logger.debug('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllErrorRecordsOfApplication] - [%s] - [PGSQL] - Errors found for Application %s with ErrorCode %s',reqId,AppID,ECode);
                                callback(undefined,JSON.stringify(ErrObj));
                            }
                        });
                    }
                    catch(ex)
                    {
                        logger.error('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllErrorRecordsOfApplication] - [%s] - [PGSQL] - Exception occurred while searching Errors of Application %s with ErrorCode ',reqId,AppID,ECode,ex);
                        callback(ex,undefined);
                    }
                }
                else
                {
                    logger.error('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllErrorRecordsOfApplication] - [%s] - [PGSQL] - Exception occurred when starts GetAllErrorRecordsOfApplication %s ErrorCode %s',reqId,AppID,ECode,ex);
                    callback("Illegal Access ",undefined);
                }
            }
        })
    }
    catch(ex)
    {
        logger.error('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllErrorRecordsOfApplication] - [%s] - Exception occurred when starts GetAllErrorRecordsOfApplication %s with ErrorCode ',reqId,AppID,ECode,ex);
        callback(ex,undefined);
    }

}

function GetAllErrorRecordsOfApplicationByCompany(Company,reqId,callback)
{
      //logger.debug('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllErrorRecordsOfApplicationByCompany] - [%s] -  Searching All Application Error Records Of Company %s  ',reqId,Company);
       /* DbConn.Application.find({where:[{id:AppID}]}).complete(function(err,AppObj)
        {
            if(err)
            {
                logger.error('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllErrorRecordsOfApplicationByCompany] - [%s] - [PGSQL] - Company and Tenant is matched for received Application details %s ',reqId,AppID);
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
        */
        try
        {
            logger.debug('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllErrorRecordsOfApplicationByCompany] - [%s] -  Searching All Application Error Records Of Company %s  ',reqId,Company);
            DbConn.ApplicationErrors.find({where:[{CompanyId:Company}]}).complete(function(errVE,ErrObj)
            {
                if(errVE)
                {
                    logger.error('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllErrorRecordsOfApplicationByCompany] - [%s] - [PGSQL] -  Error occurred while searching All Application Error Records Of Company %s  ',reqId,Company,err);
                    callback(errVE,undefined);
                }
                else
                {
                    logger.debug('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllErrorRecordsOfApplicationByCompany] - [%s] - [PGSQL] -  Successfully completed : searching All Application Error Records Of Company %s  ',reqId,Company);
                    callback(undefined,JSON.stringify(ErrObj));
                }
            });
        }
        catch(ex)
        {
            logger.error('[DVP-HTTPProgrammingMonitorAPI.ErrorMonitor.GetAllErrorRecordsOfApplicationByCompany] - [%s] -  Exception occurred when starting  searching All Application Error Records Of Company %s process ',reqId,Company,err);
            callback(ex,undefined);
        }



}

module.exports.GetAllErrorRecordsOfApplication = GetAllErrorRecordsOfApplication;
module.exports.GetAllErrorRecordsOfApplicationByErrorCode = GetAllErrorRecordsOfApplicationByErrorCode;
module.exports.GetAllErrorRecordsOfApplicationByCompany = GetAllErrorRecordsOfApplicationByCompany;
