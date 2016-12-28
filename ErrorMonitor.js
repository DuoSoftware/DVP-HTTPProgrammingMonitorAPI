/**
 * Created by pawan on 4/21/2015.
 */

var restify = require('restify');
var stringify=require('stringify');
var DbConn = require('dvp-dbmodels');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;


function ErrorsOfApplications(AppID,Company,Tenant,reqId,callback)
{
    if(AppID&&!isNaN(AppID))
    {
        try
        {
            logger.debug('[DVP-HTTPProgrammingMonitorAPI.ErrorsOfApplications] - [%s] -  Searching All Error Records Of Application %s -  Data - Application : %s of Company : %s and Tenant : %s',reqId,AppID,Company,Tenant);
            DbConn.Application.find({where:[{id:AppID}]}).complete(function(errApp,resApp)
            {
                if(errApp)
                {
                    logger.error('[DVP-HTTPProgrammingMonitorAPI.ErrorsOfApplications] - [%s] - [PGSQL] - Error occurred while searching Application %s ',reqId,AppID,errApp);
                    callback(errApp,undefined);
                }
                else
                {

                    if(resApp.CompanyId==Company && resApp.TenantId==Tenant)
                    {
                        logger.debug('[DVP-HTTPProgrammingMonitorAPI.ErrorsOfApplications] - [%s] - [PGSQL] - Company and Tenant is matched for received Application details %s ',reqId,AppID);
                        try
                        {
                            DbConn.ApplicationErrors.findAll({where:[{VoiceAppID:AppID},{CompanyId:Company},{TenantId:Tenant}]}).complete(function(errAppErr,resAppErr)
                            {
                                if(errAppErr)
                                {
                                    logger.error('[DVP-HTTPProgrammingMonitorAPI.ErrorsOfApplications] - [%s] - [PGSQL] - Error occurred while searching Errors of Application %s ',reqId,AppID,errAppErr);
                                    callback(errAppErr,undefined);
                                }
                                else
                                {
                                    if(resAppErr)
                                    {
                                        logger.debug('[DVP-HTTPProgrammingMonitorAPI.ErrorsOfApplications] - [%s] - [PGSQL] - Errors found for Application %s ',reqId,AppID);

                                        callback(undefined,resAppErr);
                                    }
                                    else
                                    {
                                        logger.debug('[DVP-HTTPProgrammingMonitorAPI.ErrorsOfApplications] - [%s] - [PGSQL] - No Errors found for Application %s ',reqId,AppID);

                                        callback(new Error("No Error record found"),undefined);
                                    }


                                }
                            });
                        }
                        catch(ex)
                        {
                            logger.error('[DVP-HTTPProgrammingMonitorAPI.ErrorsOfApplications] - [%s] - [PGSQL] - Exception occurred while searching Errors of Application %s ',reqId,AppID,ex);
                            callback(ex,undefined);
                        }
                    }
                    else
                    {
                        logger.error('[DVP-HTTPProgrammingMonitorAPI.ErrorsOfApplications] - [%s] - [PGSQL] - Company and Tenant is not matched for received Application details %s ',reqId,AppID);
                        callback(new Error("Illegal Access "),undefined);
                    }
                }
            })
        }
        catch(ex)
        {
            logger.error('[DVP-HTTPProgrammingMonitorAPI.ErrorsOfApplications] - [%s] - [PGSQL] - Exception occurred when starts GetAllErrorRecordsOfApplication %s ',reqId,AppID,ex);
            callback(ex,undefined);
        }
    }
    else
    {
        logger.error('[DVP-HTTPProgrammingMonitorAPI.ErrorsOfApplications] - [%s] - Application Id is Invalid $s',reqId,AppID);
        callback(new Error("Application Id is Invalid "+AppID),undefined);
    }


}

function ApplicationErrorsByErrorCode(AppID,ECode,Company,Tenant,reqId,callback)
{
    try
    {
        logger.debug('[DVP-HTTPProgrammingMonitorAPI.ApplicationErrorsByErrorCode] - [%s] -  Searching All Error Records Of Application %s  by Error Code %s -  Data - Application : %s of Company : %s and Tenant : %s',reqId,AppID,ECode,Company,Tenant);
        DbConn.Application.find({where:[{id:AppID}]}).complete(function(errApp,resApp)
        {
            if(errApp)
            {
                logger.error('[DVP-HTTPProgrammingMonitorAPI.ApplicationErrorsByErrorCode] - [%s] - [PGSQL] - Error occurred while searching Application %s ',reqId,AppID,errApp);
                callback(errApp,undefined);
            }
            else
            {
                if(resApp.CompanyId==Company && resApp.TenantId==Tenant)
                {
                    logger.debug('[DVP-HTTPProgrammingMonitorAPI.ApplicationErrorsByErrorCode] - [%s] - [PGSQL] - Company and Tenant is matched for received Application details %s ',reqId,AppID);
                    try
                    {
                        DbConn.ApplicationErrors.find({where:[{VoiceAppID:AppID},{CompanyId:Company},{TenantId:Tenant},{Code:ECode}]}).complete(function(errAppErr,resAppErr)
                        {
                            if(errAppErr)
                            {
                                logger.error('[DVP-HTTPProgrammingMonitorAPI.ApplicationErrorsByErrorCode] - [%s] - [PGSQL] - Error occurred while searching Errors of Application %s with ErrorCode %s',reqId,AppID,ECode,errAppErr);
                                callback(errAppErr,undefined);
                            }
                            else
                            {
                                if(resAppErr)
                                {
                                    logger.debug('[DVP-HTTPProgrammingMonitorAPI.ApplicationErrorsByErrorCode] - [%s] - [PGSQL] - Errors found for Application %s with ErrorCode %s',reqId,AppID,ECode);
                                    callback(undefined,resAppErr);
                                }
                                else
                                {
                                    logger.debug('[DVP-HTTPProgrammingMonitorAPI.ApplicationErrorsByErrorCode] - [%s] - [PGSQL] - No Errors found for Application %s with ErrorCode %s',reqId,AppID,ECode);
                                    callback(new Error("No Error record found"),undefined);
                                }

                            }
                        });
                    }
                    catch(ex)
                    {
                        logger.error('[DVP-HTTPProgrammingMonitorAPI.ApplicationErrorsByErrorCode] - [%s] - [PGSQL] - Exception occurred while searching Errors of Application %s with ErrorCode ',reqId,AppID,ECode,ex);
                        callback(ex,undefined);
                    }
                }
                else
                {
                    logger.error('[DVP-HTTPProgrammingMonitorAPI.ApplicationErrorsByErrorCode] - [%s] - [PGSQL] - Exception occurred when starts GetAllErrorRecordsOfApplication %s ErrorCode %s',reqId,AppID,ECode,ex);
                    callback(new Error("Illegal Access "),undefined);
                }
            }
        })
    }
    catch(ex)
    {
        logger.error('[DVP-HTTPProgrammingMonitorAPI.ApplicationErrorsByErrorCode] - [%s] - Exception occurred when starts ApplicationErrorsByErrorCode %s with ErrorCode ',reqId,AppID,ECode,ex);
        callback(ex,undefined);
    }

}

function ErrorRecordsOfCompany(Company,reqId,callback)
{
if(Company && !isNaN(Company))
{

    try
    {
        logger.debug('[DVP-HTTPProgrammingMonitorAPI.ErrorRecordsOfCompany] - [%s] -  Searching All Application Error Records of Application %s Of Company %s  ',reqId,Company);
        DbConn.ApplicationErrors.find({where:[{CompanyId:Company}]}).complete(function(errAppErr,resAppErr)
        {
            if(errAppErr)
            {
                logger.error('[DVP-HTTPProgrammingMonitorAPI.ErrorRecordsOfCompany] - [%s] - [PGSQL] -  Error occurred while searching All Application Error Records Of Company %s  ',reqId,Company,errAppErr);
                callback(errAppErr,undefined);
            }
            else
            {
                if(resAppErr)
                {
                    logger.debug('[DVP-HTTPProgrammingMonitorAPI.ErrorRecordsOfCompany] - [%s] - [PGSQL] -  Error Records  found Of Company %s  ',reqId,Company);
                    callback(undefined,resAppErr);
                }else
                {
                    logger.debug('[DVP-HTTPProgrammingMonitorAPI.ErrorRecordsOfCompany] - [%s] - [PGSQL] - No error Records found for Company %s ',reqId,Company);
                    callback(undefined,resAppErr);
                }

            }
        });
    }
    catch(ex)
    {
        logger.error('[DVP-HTTPProgrammingMonitorAPI.ErrorRecordsOfCompany] - [%s] -  Exception occurred when starting  searching All Application Error Records Of Company %s process ',reqId,Company,ex);
        callback(ex,undefined);
    }
}
    else
{
    logger.error('[DVP-HTTPProgrammingMonitorAPI.ErrorRecordsOfCompany] - [%s] -  Company is Invalid %s ',reqId,Company);
    callback(new Error("Company is Invalid "+Company),undefined);
}



}

module.exports.ErrorsOfApplications = ErrorsOfApplications;
module.exports.ErrorRecordsOfCompany = ErrorRecordsOfCompany;
module.exports.ApplicationErrorsByErrorCode = ApplicationErrorsByErrorCode;
