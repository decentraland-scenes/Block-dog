# Block Dog

A scene with a simple AI character. It randomly chooses what action to take: follow you, sit or remain idle. You can also tell it to sit or stand up by clicking it, or tell it to drink water by clicking its bowl.

![](screenshot/screenshot.png)

<!--
[Explore the scene](): this link takes you to a copy of the scene deployed to a remote server where you can interact with it just as if you were running `dcl start` locally.
-->

**Install the CLI**

Download and install the Decentraland CLI by running the following command

```bash
npm i -g decentraland
```

For a more details, follow the steps in the [Installation guide](https://docs.decentraland.org/documentation/installation-guide/).


**Previewing the scene**

Once you've installed the CLI, download this example and navigate to its directory from your terminal or command prompt.

_from the scene directory:_

```
$:  dcl start
```

Any dependencies are installed and then the CLI will open the scene in a new browser tab automatically.

**Usage**

- The dog has autonomous behavior and randomly sits and stands up on its own.
- If you click the dog, it switches from standing up to sitting down.
- If you click the water bowl, it walks towards it and drinks.
- If you step inside the bounds of the scene, the dog follows you and sits in front of you.

Learn more about how to build your own scenes in our [documentation](https://docs.decentraland.org/) site.