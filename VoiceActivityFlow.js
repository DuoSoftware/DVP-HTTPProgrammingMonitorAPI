/**
 * Created by pawan on 4/21/2015.
 */

var restify = require('restify');
var stringify=require('stringify');
var DbConn = require('DVP-DBModels');
var config=require('config');
var logger = require('DVP-Common/LogHandler/CommonLogHandler.js').logger;



function ApplicationActivitiesBySessionID(Company,Tenant,SID,reqId,callback)
{
    if(SID && !isNaN(SID))
    {
        try
        {
            logger.debug('[DVP-HTTPProgrammingMonitorAPI.ApplicationActivitiesBySessionID] - [%s] -  Searching Application activities by SessionID %s - Company : %s and Tenant : %s',reqId,SID,Company,Tenant);
            DbConn.DVPEvent.findAll({where:[{CompanyId:Company},{EventClass:config.Types.Class},{TenantId:Tenent},{EventData:SID},{EventType:config.Types.Type}]}).complete(function (errEvent, resEvent) {

                if(errEvent)
                {
                    logger.error('[DVP-HTTPProgrammingMonitorAPI.ApplicationActivitiesBySessionID] - [%s] - [PGSQL] - Error occurred while searching Application Activities of SessionId %s ',reqId,SID,errEvent);
                    callback(errEvent,undefined);
                }
                else
                {
                    if(resEvent.length>0)
                    {
                        logger.debug('[DVP-HTTPProgrammingMonitorAPI.ApplicationActivitiesBySessionID] - [%s] - [PGSQL] - Records found for session ID %s ',reqId,SID);
                        callback(undefined,resEvent);
                    }else
                    {
                        logger.debug('[DVP-HTTPProgrammingMonitorAPI.ApplicationActivitiesBySessionID] - [%s] - [PGSQL] - No Records found for session ID %s ',reqId,SID);
                        callback(new Error('No Records found for session ID'),undefined);
                    }

                }
            })
        }
        catch(ex)
        {
            logger.error('[DVP-HTTPProgrammingMonitorAPI.ApplicationActivitiesBySessionID] - [%s] - [PGSQL] - Exception occurred while searching activities of sessionID %s ',reqId,SID,ex);
            callback(ex,undefined);
        }
    }
    else
    {
        logger.error('[DVP-HTTPProgrammingMonitorAPI.ApplicationActivitiesBySessionID] - [%s] -  SessionID is undefined %s ',reqId,SID);
        callback(new Error("SessionID is undefined "+SID),undefined);
    }

}

function ApplicationActivitiesByCatagory(Company,Tenant,Ecat,reqId,callback)
{
    try
    {
        DbConn.DVPEvent.findAll({where:[{CompanyId:Company},{TenantId:Tenant},{EventClass:config.Types.Class},{EventCategory:Ecat},{EventType:config.Types.Type}]}).complete(function (errEvent, resEvent) {

            if(errEvent)
            {
                logger.error('[DVP-HTTPProgrammingMonitorAPI.ApplicationActivitiesByCatagory] - [%s] - [PGSQL] - Error occurred while searching Application Activities of Event Category %s ',reqId,Ecat,errEvent);
                callback(errEvent,undefined);
            }
            else
            {
                if(resEvent)
                {
                    logger.debug('[DVP-HTTPProgrammingMonitorAPI.ApplicationActivitiesByCatagory] - [%s] - [PGSQL] - Activity records found of Event Category %s ',reqId,Ecat);
                    callback(undefined,resEvent);
                }else
                {
                    logger.debug('[DVP-HTTPProgrammingMonitorAPI.ApplicationActivitiesByCatagory] - [%s] - [PGSQL] - No Activity records found of Event Category %s ',reqId,Ecat);
                    callback(new Error('No Activity records found of Event Category '+Ecat),undefined);
                }

            }
        })
    }
    catch(ex)
    {
        logger.error('[DVP-HTTPProgrammingMonitorAPI.ApplicationActivitiesByCatagory] - [%s] - [PGSQL] - Exception occurred while searching activities of EventCatagory %s ',reqId,Ecat,ex);
        callback(ex,undefined);
    }
}



module.exports.ApplicationActivitiesBySessionID = ApplicationActivitiesBySessionID;
module.exports.ApplicationActivitiesByCatagory = ApplicationActivitiesByCatagory;

