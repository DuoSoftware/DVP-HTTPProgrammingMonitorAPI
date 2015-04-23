/**
 * Created by pawan on 4/21/2015.
 */

var restify = require('restify');
var stringify=require('stringify');
var DbConn = require('./DVP-DBModels');
var Config=require('./config/default.js');

var Type=Config.Types.Type;

var RestServer = restify.createServer({
    name: "myapp",
    version: '1.0.0'
},function(req,res)
{

});
//Server listen
RestServer.listen(8085, function () {
    console.log('%s listening at %s', RestServer.name, RestServer.url);
    GetAllVoiceAppActivitiesBySessionID(1,1,'121',function(err,res)
    {
        if(err)
        {
            console.log(err);
        }
        else
        {
            console.log(res);
        }
    })

});
//Enable request body parsing(access)
RestServer.use(restify.bodyParser());
RestServer.use(restify.acceptParser(RestServer.acceptable));
RestServer.use(restify.queryParser());


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
