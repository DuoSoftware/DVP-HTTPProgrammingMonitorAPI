module.exports = {
    Freeswitch : {
        ip: 'localhost',
        port: 8021,
        password: 'devadmin'
    },

    WebAPI : {
        domain: '192.168.1.58',
        port: 80,
        path: '/CSRequestWebApi/api/'
    },

    Redis : {
        ip: 'localhost',
        port: 6379
    },

    HTTPServer : {
        port: 8085
    },


    LBServer : {
        path: 'http://localhost:8086/'
    },

    "DB": {
        "Type":"postgres",
        "User":"duo",
        "Password":"DuoS123",
        "Port":5432,
        "Host":"127.0.0.1",
        "Database":"dvpdb"
    },
    "Types":{
        "Type":"DEV_API"
    },



    "Redis":
    {
        "ip": "192.168.3.200",
        "port": "6379"

    },

    "Host":
    {
        "domain": "0.0.0.0",
        "port": "8082",
        "version":"6.0"
    }

};