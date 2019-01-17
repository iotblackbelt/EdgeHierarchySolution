# Azure IoT Edge Hierarchy Module
<p>The Azure IoT Edge Hierarchy Module is a module that can be deployed to Azure IoT Edge to create a hierarchy of edges. This module uses the transparent gateway pattern.</p>
<p style="align:center">
<img src="images/hierarchy.PNG">
</p>

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
<li>Follow the walk-through to use the upstreeam edge as a transparent gateway: [https://docs.microsoft.com/en-us/azure/iot-edge/how-to-create-transparent-gateway]</li>
<li>
<li>Setup the downstream edge as a downstream device:</li>
<p>Set the Container Create Options and select <strong>Save</strong>.</p>
    <pre><code class="lang-json">{
  "HostConfig": {
    "Privileged": true,
    "Binds": [
      "/edge-ca-cert:/edge-ca-cert"
    ],
    "ExtraHosts": [
      "#x3C;name of your upstream edge&#x3E;:#x3C;ip address upstream edge&#x3E;"
    ]
  }
}
}</code></pre>
</li>
</ol>