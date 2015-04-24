/**
 * Created by pawan on 4/21/2015.
 */

var restify = require('restify');
var stringify=require('stringify');
var DbConn = require('DVP-DBModels');
var confg=require('config');



function GetAllVoiceAppActivitiesBySessionID(Company,Tenent,SID,callback)
{
    try
    {
        DbConn.DVPEvent.findAll({where:[{CompanyId:Company},{TenantId:Tenent},{EventData:SID},{EventType:config.Types.Type}]}).complete(function (err, result) {

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
