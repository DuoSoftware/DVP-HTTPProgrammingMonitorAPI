/**
 * Created by pawan on 4/21/2015.
 */

var restify = require('restify');
var stringify=require('stringify');
var redis=require('redis');

var client = redis.createClient(6379,"localhost");
client.on("error", function (err) {
    console.log("Error " + err);

});

var RestServer = restify.createServer({
    name: "myapp",
    version: '1.0.0'
},function(req,res)
{

});
//Server listen
RestServer.listen(8085, function () {
    console.log('%s listening at %s', RestServer.name, RestServer.url);

    LiveDEVDataViewer('APP0012',function(err,res)
    {
        if(err)
        {
            console.log(err);

        }
        else
        {
            //console.log(JSON.parse(res[0]).name);

            console.log(JSON.parse(ViewArray[0]).name);


        }
    })

});
//Enable request body parsing(access)
RestServer.use(restify.bodyParser());
RestServer.use(restify.acceptParser(RestServer.acceptable));
RestServer.use(restify.queryParser());



var index =0;
var ViewArray=[];

function GetRealtimeCallsCountOfVoiceApp(AppID,callback)
{
    client.get(AppID,function(err,result)
    {
        if(err)
        {

            callback(err, undefined);
        }
        else
        {

            callback(undefined, result);
        }

    });
}

function UUIDSelection(AppID,callback)
{
    client.lrange(AppID,0,-1,function(err,result)
    {
        if(err)
        {

            callback(err, undefined);
        }
        else
        {

            callback(undefined, result);
        }

    });
}

function LiveDEVDataViewer(AppID,callback)
{
    UUIDSelection(AppID,function(err,result)
    {
        if(err)
        {
            callback(err,undefined);
        }
        else
        {
            AddToArray(result,function(error,Status)
            {
                if(error)
                {
                    callback(error,undefined);
                }
                else
                {
                    console.log(ViewArray);
                    callback(undefined,true);
                }
            })


        }

    })
}

function LiveDataViewer(AppID,callback)
{
    UUIDSelection(AppID,function(err,result)
    {
        if(err)
        {
            callback(err,undefined);
        }
        else
        {
            for (var i= 0;i<result.length;i++)
            {
                client.get(result[i]+"_DATA",function(errz,res)
                {
                    if(errz)
                    {
                        console.log('Error in getting details '+result[indx].toString());

                    }
                    else
                    {


                        console.log(JSON.parse(res).name);

                    }
                });
            }


        }

    })
}

function AddToArray(ResultArray,Cat,callback) {
    var len = ResultArray.length;
    var count = 0;
    if (Cat == "_DEV")
    {
        for (var i = 0; i < len; i++) {
            client.get(ResultArray[i] + "_DEV", function (err, res) {

                if (err) {
                    callback(err, false);
                }
                else {

                    if (count < len) {
                        ViewArray.push(res);
                        count++

                        if (count >= len) {
                            callback(undefined, true);
                        }
                    }
                    else {
                        callback(err, false);
                    }
                }
            })
        }
    }
    else
    {
        if(Cat=="_DATA")
        {
            for (var i = 0; i < len; i++) {
                client.get(ResultArray[i] + "_DATA", function (err, res) {

                    if (err) {
                        callback(err, false);
                    }
                    else {

                        if (count < len) {
                            ViewArray.push(res);
                            count++

                            if (count >= len) {
                                callback(undefined, true);
                            }
                        }
                        else {
                            callback(err, false);
                        }
                    }
                })
            }
        }
    }
}

module.exports.GetRealtimeCallsCountOfVoiceApp = GetRealtimeCallsCountOfVoiceApp;
module.exports.UUIDSelection = UUIDSelection;