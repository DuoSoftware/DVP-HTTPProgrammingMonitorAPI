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
    }

};