/**
 * Created by pawan on 4/21/2015.
 */

var restify = require('restify');
var stringify=require('stringify');
var DbConn = require('./DVP-DBModels');
var config=require('config');



function GetAllVoiceAppActivitiesBySessionID(Company,Tenent,SID,callback)
{
    try
    {
        DbConn.DVPEvent.findAll({where:[{CompanyId:Company},{EventClass:config.Types.Class},{TenantId:Tenent},{EventData:SID},{EventType:config.Types.Type}]}).complete(function (err, result) {

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

function GetAllVoiceAppActivitiesByEventCatagory(Company,Tenent,Ecat,callback)
{
    try
    {
        DbConn.DVPEvent.findAll({where:[{CompanyId:Company},{TenantId:Tenent},{EventClass:config.Types.Class},{EventCategory:Ecat},{EventType:config.Types.Type}]}).complete(function (err, result) {

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
