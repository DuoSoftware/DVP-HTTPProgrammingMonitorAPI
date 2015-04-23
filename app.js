
var restify = require('restify');
var redis = require('redis');
var config = require('config');

var ErrorMonitor=require('./ErrorMonitor.js');
var VoiceActivityFlow=require('./VoiceActivityFlow.js');


var redisClient = redis.createClient(config.Redis.port,config.Redis.ip);
redisClient.on('error',function(err){
    console.log('Error '.red, err);
    });


/////////////////////////////////////////////////////////////////////
var server = restify.createServer();
server.use(restify.fullResponse()).use(restify.bodyParser());
server.listen(config.HTTPServer.port);

////////////////////////////////////////////////////////////////////


 function send(req, res, next) {
   res.send('API ' + ' '+req.params.account+' '+req.params.guid);
   return next();
 }



 /////////////////////////////////////////////////////////create resource/////////////////////////
 server.put('/API/call/:version/:account/:guid/:action', send);
 server.put('/API/dialer/:version/:account/:action', send);
 server.put('/API/conference/:version/:account/:action', send);


 ////////////////////////////////////////////////////////modify resource//////////////////////////
 server.post('/API/call/:version/:account/:guid/:action', function actionmodify(req, res, next) {
   res.send(201, Math.random().toString(36).substr(3, 8));
   return next();
 });


 /////////////////////////////////////////////////////get resource details//////////////////////////
 server.get('/API/livecall/all/:version/:account/:number', function (req, res, next) {


     ////////////////////////validate accountID////////////////////////////////////////////////////////

     var account = req.params.account;
     var number = req.params.number;


     redisClient.lrange(req.params.number + "_live",0,-1, function (err, value) {

         var uuid_dev;
         if (err) {
             console.error("error");

             var errordata = { result: "unexpecter error occured" };
             res.writeHead(200, { "Content-Type": "text/json" });
             res.write(JSON.stringify(errordata));
             res.end();
         }
         else {


             if(!value)
             {

                 var errordata = { result: "nodata" };
                 res.writeHead(200, { "Content-Type": "text/json" });
                 res.write(JSON.stringify(errordata));
                 res.end();
                 
             }
             else
             {
                 var sessionData = { result: "data", ids : value};
                 res.writeHead(200, { "Content-Type": "text/json" });
                 res.write(JSON.stringify(sessionData));
                 res.end();
                 
             }

             //console.log("Worked: " + value);
            
         }
     });

     return next();
 });
 


////////////////////////////////////////////////////////////get command data/////////////////////////////////

server.get('/API/livecall/flowinfo/:version/:account/:guid', function (req, res, next) {


     ////////////////////////validate accountID////////////////////////////////////////////////////////

     var account = req.params.account;
     var callid = req.params.uuid;


     redisClient.lrange(req.params.number + "_command",0,-1, function (err, value) {

         var uuid_dev;
         if (err) {
             console.error("error");

             var errordata = { result: "unexpecter error occured" };
             res.writeHead(200, { "Content-Type": "text/json" });
             res.write(JSON.stringify(errordata));
             res.end();
         }
         else {


             if(!value)
             {

                 var errordata = { result: "nodata" };
                 res.writeHead(200, { "Content-Type": "text/json" });
                 res.write(JSON.stringify(errordata));
                 res.end();
                 
             }
             else
             {
                 var sessionData = { result: "data", ids : value};
                 res.writeHead(200, { "Content-Type": "text/json" });
                 res.write(JSON.stringify(sessionData));
                 res.end();
                 
             }

             //console.log("Worked: " + value);
            
         }
     });

     return next();
 });
 



////////////////////////////////////////////////////////////get error data/////////////////////////////////////

server.get('/API/developerinfo/:version/:account/:number', function (req, res, next) {


     ////////////////////////validate accountID////////////////////////////////////////////////////////

     var account = req.params.account;
     var number = req.params.number;


     redisClient.lrange(req.params.number + "_error",0,-1,function (err, value) {

         var uuid_dev;
         if (err) {
             console.error("error");

             var errordata = { result: "unexpecter error occured" };
             res.writeHead(200, { "Content-Type": "text/json" });
             res.write(JSON.stringify(errordata));
             res.end();
         }
         else {


             if(!value)
             {

                 var errordata = { result: "nodata" };
                 res.writeHead(200, { "Content-Type": "text/json" });
                 res.write(JSON.stringify(errordata));
                 res.end();
                 
             }
             else
             {
                 var sessionData = { result: "data", errors : value};
                 res.writeHead(200, { "Content-Type": "text/json" });
                 res.write(JSON.stringify(sessionData));
                 res.end();
                 
             }

             //console.log("Worked: " + value);
            
         }
     });

     return next();
 });


 
 server.get('/API/livecall/calldata/:version/:account/:guid', function (req, res, next) {

      ////////////////////////validate accountID////////////////////////////////////////////////////////

     var account = req.params.account;
     var callid = req.params.guid;


     redisClient.get(callid + "_dev", function (err, value) {

         var uuid_dev;
         if (err) {
             console.error("error");

             var errordata = { result: "unexpecter error occured" };
             res.writeHead(200, { "Content-Type": "text/json" });
             res.write(JSON.stringify(errordata));
             res.end();
         }
         else {


             if(!value)
             {

                 var errordata = { result: "nodata" };
                 res.writeHead(200, { "Content-Type": "text/json" });
                 res.write(JSON.stringify(errordata));
                 res.end();
                 
             }
             else
             {

                 var originalcalldata = JSON.parse(value);              
                 var body = { session: originalcalldata.serverdata["session_id"], direction: originalcalldata.serverdata["Caller-Direction"], ani: originalcalldata.serverdata["Caller-ANI"], dnis: originalcalldata.serverdata["Caller-Destination-Number"], name: originalcalldata.serverdata["Caller-Caller-ID-Name"], time :  originalcalldata.serverdata["Caller-Channel-Created-Time"], nexturl : originalcalldata["nexturl"], currenturl : originalcalldata["currenturl"], result : originalcalldata["result"], lastcommand : originalcalldata["lastcommand"], lastresult : originalcalldata["lastresult"]};

                 var sessionData = { result: "data", calldata : body};
                 res.writeHead(200, { "Content-Type": "text/json" });
                 res.write(JSON.stringify(sessionData));
                 res.end();
                 
             }

             //console.log("Worked: " + value);
            
         }
     });

     return next();
 });

 
 
 //server.head('/API/call/:version/:account/:guid/:action', send);
 

 //////////////////////////////////////////////////////delete resource////////////////////////////////
 server.del('/API/developerinfo/:version/:account/:number', function rm(req, res, next) {

     var number = req.params.number;
     redisClient.del(number + "_error", redis.print);
     res.send(204);
     return next();
 });



//................................................PAWAN......................................................

//////////////////////////////////////////////////////Get Error Records of Application////////////////////////////////
server.get('DVP/:version/HTTPProgrammingMonitorAPI/ErrorMonitor/GetAllErrorRecordsOfApplication/:AppID/:Company/:Tenent',function(req,res,next)
{
    ErrorMonitor.GetAllErrorRecordsOfApplication(req.params.AppID,req.params.Company,req.params.Tenent,function(err,Rec)
    {
        if(err)
        {
            res.end(err);
        }
        else
        {
            res.end(Rec);
        }
    })
    return next();
});


//////////////////////////////////////////////////////Get Error Records of Application by Error Code////////////////////////////////

server.get('DVP/:version/HTTPProgrammingMonitorAPI/ErrorMonitor/GetAllErrorRecordsOfApplicationByErrorCode/:AppID/:ECode/:Company/:Tenent',function(req,res,next)
{
    ErrorMonitor.GetAllErrorRecordsOfApplicationByErrorCode(req.params.AppID,req.params.ECode,req.params.Company,req.params.Tenent,function(err,Rec)
    {
        if(err)
        {
            res.end(err);
        }
        else
        {
            res.end(Rec);
        }
    })
    return next();
});

//////////////////////////////////////////////////////Get Error Records of Application by Company////////////////////////////////

server.get('DVP/:version/HTTPProgrammingMonitorAPI/ErrorMonitor/GetAllErrorRecordsOfApplicationByCompany/:AppID/:Company',function(req,res,next)
{
    ErrorMonitor.GetAllErrorRecordsOfApplicationByErrorCode(req.params.AppID,req.params.Company,function(err,Rec)
    {
        if(err)
        {
            res.end(err);
        }
        else
        {
            res.end(Rec);
        }
    })
    return next();
});


//////////////////////////////////////////////////////Get All VoiceApp Activities By SessionID////////////////////////////////

server.get('DVP/:version/HTTPProgrammingMonitorAPI/ErrorMonitor/GetAllErrorRecordsOfApplicationByCompany/:Company/:Tenent/:SID',function(req,res,next)
{
    VoiceActivityFlow.GetAllVoiceAppActivitiesBySessionID(req.params.Company,req.params.Tenent,req.params.SID,function(err,Rec)
    {
        if(err)
        {
            res.end(err);
        }
        else
        {
            res.end(Rec);
        }
    })
    return next();
});






process.stdin.resume();