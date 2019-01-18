'use strict';

var Transport = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').ModuleClient;
var DownstreamClient = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;
// Access to file system to load certificate for tarnsparant gateway communication
var fs = require('fs');

// 1) Obtain the connection string for your downstream device and to it
//    append this string GatewayHostName=<edge device hostname>;
// 2) The Azure IoT Edge device hostname is the hostname set in the config.yaml of the Azure IoT Edge device
//    to which this sample will connect to.
//
// The resulting string should look like the following
//  "HostName=<iothub_host_name>;DeviceId=<device_id>;SharedAccessKey=<device_key>;GatewayHostName=<edge device hostname>"
const connectionString = process.env.DOWNSTREAM_CONNECTIONSTRING;

// Path to the Edge "owner" root CA certificate
const edge_ca_cert_path = '/edge-ca-cert/' + process.env.CERTIFICATE_FILENAME;



// Create Module client
Client.fromEnvironment(Transport, function (err, client) {
  if (err) {
    throw err;
  } else {
    client.on('error', function (err) {
      throw err;
    });

    // connect to the Edge instance
    client.open(function (err) {
      if (err) {
        throw err;
      } else {
        // Initialize downstream client
        // fromConnectionString must specify a transport constructor, coming from any transport package.
        var downstreamClient = DownstreamClient.fromConnectionString(connectionString, Transport);

        // Provide the Azure IoT device client via setOptions with the X509
        // Edge root CA certificate that was used to setup the Edge runtime
        console.log('Get Upstream Edge Certificate.');
        var options = {
          ca : fs.readFileSync(edge_ca_cert_path, 'utf-8'),
        };

        console.log('Set Downstream Client Options.');
        downstreamClient.setOptions(options, function(err) {
          if (err) {
            console.log('SetOptions Error: ' + err);
          } else {
            console.log('Initiate Downstream Client.');
            downstreamClient.open( function(err) {
              if (err) {
                console.error('Could not connect: ' + err.message);
              } else {
                console.log('Downstream Client connected.');
              }
            });
          }
        });

        // Act on input messages to the module.
        client.on('inputMessage', function (inputName, msg) {
          pipeMessage(client, downstreamClient, inputName, msg);
        });
      }
    });
  }
});

// This function just sends the messages through to next edge without any change.
function pipeMessage(client, downstreamClient, inputName, msg) {
  client.complete(msg, printResultFor('Receiving message'));

  if (inputName === 'upstream') {
    var message = msg.getBytes().toString('utf8');
    if (message) {
      var outputMsg = new Message(message);
      downstreamClient.sendEvent(outputMsg, printResultFor('Send downstream message'));
    }
  }
}

// Helper function to print results in the console
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) {
      console.log(op + ' error: ' + err.toString());
    }
    if (res) {
      console.log(op + ' status: ' + res.constructor.name);
    }
  };
}
