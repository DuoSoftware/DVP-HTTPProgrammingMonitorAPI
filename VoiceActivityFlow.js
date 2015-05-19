/**
 * Created by pawan on 4/21/2015.
 */

var restify = require('restify');
var stringify=require('stringify');
var DbConn = require('DVP-DBModels');
var config=require('config');
var logger = require('DVP-Common/LogHandler/CommonLogHandler.js').logger;



function GetAllVoiceAppActivitiesBySessionID(Company,Tenant,SID,reqId,callback)
{
    try
    {
        logger.debug('[DVP-HTTPProgrammingMonitorAPI.GetAllVoiceAppActivitiesBySessionID] - [%s] -  Searching Application activities by SessionID %s - Company : %s and Tenant : %s',reqId,SID,Company,Tenant);
        DbConn.DVPEvent.findAll({where:[{CompanyId:Company},{EventClass:config.Types.Class},{TenantId:Tenent},{EventData:SID},{EventType:config.Types.Type}]}).complete(function (err, result) {

            if(err)
            {
                logger.error('[DVP-HTTPProgrammingMonitorAPI.GetAllVoiceAppActivitiesBySessionID] - [%s] - [PGSQL] - Error occurred while searching Application Activities of SessionId %s ',reqId,SID,err);
                callback(err,undefined);
            }
            else
            {
                logger.debug('[DVP-HTTPProgrammingMonitorAPI.GetAllVoiceAppActivitiesBySessionID] - [%s] - [PGSQL] - Records found of session ID %s ',reqId,SID);

                callback(undefined,JSON.stringify(result));
            }
        })
    }
    catch(ex)
    {
        logger.error('[DVP-HTTPProgrammingMonitorAPI.GetAllVoiceAppActivitiesBySessionID] - [%s] - [PGSQL] - Exception occurred while searching activities of sessionID %s ',reqId,SID,ex);
        callback(ex,undefined);
    }
}

function GetAllVoiceAppActivitiesByEventCatagory(Company,Tenant,Ecat,reqId,callback)
{
    try
    {
        DbConn.DVPEvent.findAll({where:[{CompanyId:Company},{TenantId:Tenant},{EventClass:config.Types.Class},{EventCategory:Ecat},{EventType:config.Types.Type}]}).complete(function (err, result) {

            if(err)
            {
                logger.error('[DVP-HTTPProgrammingMonitorAPI.GetAllVoiceAppActivitiesByEventCatagory] - [%s] - [PGSQL] - Error occurred while searching Application Activities of Event Category %s ',reqId,Ecat,err);
                callback(err,undefined);
            }
            else
            {
                logger.debug('[DVP-HTTPProgrammingMonitorAPI.GetAllVoiceAppActivitiesBySessionID] - [%s] - [PGSQL] - Activity records found of Event Category %s ',reqId,Ecat);
                callback(undefined,JSON.stringify(result));
            }
        })
    }
    catch(ex)
    {
        logger.error('[DVP-HTTPProgrammingMonitorAPI.GetAllVoiceAppActivitiesBySessionID] - [%s] - [PGSQL] - Exception occurred while searching activities of EventCatagory %s ',reqId,Ecat,ex);
        callback(ex,undefined);
    }
}

/*
function GetAllVoiceAppActivitiesBetweenEventTimes(Company,Tenent,Ecat,dt1,dt2,callback)
{
    console.log(new Date(Date.parse(dt1)));
    console.log(new Date(Date.parse(dt2)));

    try
    {
        DbConn.DVPEvent.findAll({where:[{CompanyId:Company},{TenantId:Tenent},{EventClass:config.Types.Class},{EventCategory:Ecat},{EventType:config.Types.Type},
            {
                EventTime:
                {
                    gte:new Date(Date.parse(dt1))
                   // ,
                    //lte:new Date(Date.parse(dt1))
                }
            }

        ]}).complete(function (err, result) {

            if(err)
            {
                callback(err,undefined);
            }
            else
            {
                callback(undefined,JSON.stringify(result));
            }
        })
    }
    catch(ex)
    {
        callback(ex,undefined);
    }
}

*/

module.exports.GetAllVoiceAppActivitiesBySessionID = GetAllVoiceAppActivitiesBySessionID;
module.exports.GetAllVoiceAppActivitiesByEventCatagory = GetAllVoiceAppActivitiesByEventCatagory;
//module.exports.GetAllVoiceAppActivitiesBetweenEventTimes = GetAllVoiceAppActivitiesBetweenEventTimes;
