"use strict";
const util = require('util');
const WebSocket = require('ws');
const SignalRClient = require('../lib/client.js');
let client = new SignalRClient({
    // websocket will be automatically reconnected if server does not respond to ping after 10s
    pingTimeout:10000,
    watchdog:{
        // automatically reconnect if we don't receive markets data for 30min (this is the default)
        markets:{
            timeout:1800000,
            reconnect:true
        }
    }
});

const ws = new WebSocket('ws://localhost:8080/ws')

ws.on('open', function open() {
    ws.send('hello')
})

ws.on('message', function incoming(data) {
    console.log(data)
})

//-- event handlers
client.on('orderBook', function(data){
    console.log(util.format("Got full order book for pair '%s' : cseq = %d", data.pair, data.cseq));
});
client.on('orderBookUpdate', function(data){
    console.log(util.inspect(data, false, null));
});
client.on('trades', function(data){
  //  console.log(util.inspect(data, false, null));
});

//-- start subscription
console.log("=== Subscribing to 'USDT-BTC' pair");
client.subscribeToMarkets(['USDT-BTC']);

// add subscription for 'USDT-ETH' & 'BTC-USDT' after 15s
setTimeout(function(){
    console.log("=== Adding subscription for USDT-ETH & BTC-ETH pairs");
    client.subscribeToMarkets(['USDT-ETH','BTC-ETH']);
}, 15000);

// add subscription for 'BTC-NEO', unsubscribe from previous pairs after 30s
setTimeout(function(){
    console.log("=== Setting BTC-NEO as the only pair we want to subscribe to");
    client.subscribeToMarkets(['BTC-NEO'], true);
}, 30000);

// disconnect client after 60s
setTimeout(function(){
    console.log('=== Disconnecting...');
    client.disconnect();
    process.exit(0);
}, 60000);
