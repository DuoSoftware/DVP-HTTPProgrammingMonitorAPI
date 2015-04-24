/**
 * Created by pawan on 4/21/2015.
 */

var restify = require('restify');
var stringify=require('stringify');
var DbConn = require('DVP-DBModels');




function GetAllVoiceAppActivitiesBySessionID(Company,Tenent,SID,callback)
{
    try
    {
        DbConn.DVPEvent.findAll({where:[{CompanyId:Company},{TenantId:Tenent},{EventData:SID},{EventType:Type}]}).complete(function (err, result) {

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

module.exports.GetAllVoiceAppActivitiesBySessionID = GetAllVoiceAppActivitiesBySessionID;
