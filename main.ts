#!/usr/bin/env -S deno run

// Latest version
import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
import { Input } from "https://deno.land/x/cliffy@v0.25.7/prompt/mod.ts";


async function addConnection() {

  
  const connectionName = await Input.prompt("Enter the connection name");
  const connectionKey = await Input.prompt("Enter path to the Key file");
  const connectionString = await Input.prompt("Enter the username and host");
  const connectionPort: number = await Input.prompt("Enter the port")

  console.log(`New connection "${connectionName}" has been added. ssh -i ${connectionKey} ${connectionString} -p ` + connectionPort);

 

  // const newConnection = { name: connectionName, connection: connectionString };

  // // Load existing connections
  // let connections: Array<{ name: string; connection: string }> = [];
  // try {
  //   const fileContent = await Deno.readTextFile(filePath);
  //   connections = JSON.parse(fileContent);
  // } catch {
  //   // If file doesn't exist, start with an empty array
  //   connections = [];
  // }

  // // Add the new connection
  // connections.push(newConnection);

  // // Save back to the file
  // await Deno.writeTextFile(filePath, JSON.stringify(connections, null, 2));
  // console.log(`Connection "${connectionName}" has been saved.`);
}

await new Command()
  .name("SSH-Ez : SSH connection management")
  .version("0.1.0")
  .description("Command line to manage your ssh connections")
  .command("add", "Add a new connection")
  .action(() => {
    // print all the options
    addConnection();
  })
  .parse(Deno.args);