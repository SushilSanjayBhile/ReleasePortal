#!/usr/bin/env node
/*
proxy server for serving mock data remotely and else directed to webpack server listening to
localhost:4200
 */
var http = require('http');
var httpProxy = require('http-proxy');

var APP_URL = 'http://localhost:3000';
// var APP_URL = 'http://localhost:5051';

// var DJANGOURL = '/api/tcinfo'
// // var DATA_URL = 'http://172.16.19.57:8000';
// // var DATA_URL = 'http://localhost:5051';
// var djangourl = 'http://localhost:8000';

// var APP_URL = 'http://localhost:5000';

var URL = ['/api'];
var USER = ['/user'];
var JIRA = ['/rest'];
var TEST = ['/test'];
var VAGSERV = ['/vag'];
//  var DATA_URL = 'http://localhost:8000';
//  var DATA_URL = 'http://localhost:5051';
// var DATA_URL = 'http://172.16.19.57:8000';
// var DATA_URL = 'http://192.168.1.34:8000';
// var DATA_URL = 'http://172.16.19.57:8000';
// var DATA_URL = 'http://@vagserv3:8000';
var DATA_URL = 'http://release:8000';
var JIRA_URL = 'http://localhost:5051';
var USER_URL = 'http://localhost:5051';
var TEST_URL = 'http://localhost:5051';
// var VAGSERV_URL = 'http://@vagserv3:8000'



var proxy = httpProxy.createProxyServer({ changeOrigin: true, timeout: 60000 });

try {

    var server = http.createServer(function (req, res) {
        var target = APP_URL;

        for (var i = 0; i < URL.length; i++) {
            if (req.url.startsWith(URL[i])) {
                target = DATA_URL;
                break;
            }
        }
        for (var i = 0; i < JIRA.length; i++) {
            if (req.url.startsWith(JIRA[i])) {
                target = JIRA_URL;
                break;
            }
        }
        for (var i = 0; i < USER.length; i++) {
            if (req.url.startsWith(USER[i])) {
                target = USER_URL;
                break;
            }
        }
        for (var i = 0; i < TEST.length; i++) {
            if (req.url.startsWith(TEST[i])) {
                target = TEST_URL;
                break;
            }
        }
        for (var i = 0; i < VAGSERV.length; i++) {
            if (req.url.startsWith(VAGSERV[i])) {
                target = VAGSERV_URL;
                break;
            }
        }
        try {
            proxy.web(req, res, { target: target }, err => {
                console.log('caught in deep web ', err)

            });
        } catch (err) {
            console.log('err in web ', err);
        }
    }, function (err) {
        console.log('problem connecting')
    });

    console.log('listening on port 5050');
    server.listen(5050);

} catch (err) {
    console.log('caught ', err)
}
