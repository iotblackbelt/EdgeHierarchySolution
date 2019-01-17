# Azure IoT Edge Hierarchy Module
<p>The Azure IoT Edge Hierarchy Module is a module that can be deployed to Azure IoT Edge to create a hierarchy of edges. This module uses the transparent gateway pattern.</p>
<p style="align:center">
<img src="images/hierarchy.PNG">
</p>

## Prerequisite
<p>A good understanding of how Azure IoT Edge and IoT Hub works and some experience with deploying and developing custom Edge Modules.</p>

## How to build the module
<p>Clone this repo and and open the folder in Visual Studio Code (with Azure IoT Edge extension installed).</p>
<ol>
<li>Once opened in VS Code rename the file "module.template.json" to "module.json" and replace &#x3C;your container registry&#x3E; with the name of your container registry.</li>
<li>Right-click the "module.json" file and select "Build and Push IoT Edge Image".</li>
</ol>

## How to deploy
<p>A hierarchy of IoT Edges can be setup using the transparant gateway approach. For more detailed information, see How an IoT Edge device can be used as a gateway, which gives a conceptual overview: [https://docs.microsoft.com/en-us/azure/iot-edge/iot-edge-as-gateway].</p>
<p>Follow the steps below to create a hierarchy of two IoT Edge's:</p>
<ol>
<li>Deploy two IoT Edge's (See [https://docs.microsoft.com/en-us/azure/iot-edge/how-to-install-iot-edge-linux] for a Linux setup). One will act an upstream edge and one will act as a downstream edge. The dowwnstream edge will send its messages to the upstream edge. The upstream edge will then send the message to $upstream.</li>
<li>Follow the walk-through to use the upstream edge as a transparent gateway: [https://docs.microsoft.com/en-us/azure/iot-edge/how-to-create-transparent-gateway]</li>
<li>Follow the steps as described in the "Connect a downstream device to an Azure IoT Edge gateway" tutorial on the downstream edge: [https://docs.microsoft.com/en-us/azure/iot-edge/how-to-connect-downstream-device#install-certificates-using-the-os], but make sure you copy the certificate file to the directory "/edge-ca-cert".
</li>
<li>Deploy your EdgeHierarchyModule to the downstream edge using the steps as described in: [Deploy Azure IoT Edge modules from the Azure portal].</li>
<li><p>Set the Container Create Options to:</p>
<pre><code class="lang-json">{
  "HostConfig": {
    "Binds": [
      "/edge-ca-cert:/edge-ca-cert"
    ],
    "ExtraHosts": [
      "&#x3C;name of your upstream edge&#x3E;:&#x3C;ip address upstream edge&#x3E;"
    ]
  }
}
</code></pre>
</li><li>
<p>And set the environment variables:</p>
<pre><code>DOWNSTREAM_CONNECTIONSTRING = "&#x3C;Your IoT downstream edge connection string&#x3E;;GatewayHostName=&#x3C;name of your upstream edge&#x3E;"
CERTIFICATE_FILENAME="&#x3C;name of your certificate file&#x3E;"
</code></pre>
</li>
<li>Deploy the "Simulated Temperature Sensor" on the downstream edge using the approach as describe here: [https://docs.microsoft.com/en-us/azure/iot-edge/quickstart-linux#deploy-a-module]</li>
<li>Setup a route on the down stream device:
<pre><code class="lang-json">{
  "routes": {
    "upstream": "FROM /messages/modules/SimulatedTemperatureSensor/* INTO BrokeredEndpoint(\"/modules/EdgeHierarchyModule/inputs/input\")",
    "edge": "FROM /messages/modules/EdgeHierarchyModule/* INTO $upstream"
  }
}
</code></pre>
</li>
<li>And submit all the changes.</li>
</ol>
<p>You can now start monitoren your messages coming into the IoT Hub.</p>