import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
import { Input } from "https://deno.land/x/cliffy@v0.25.7/prompt/mod.ts";
import { Table } from "https://deno.land/x/cliffy@v0.25.4/table/mod.ts";
import { format } from "@std/datetime/format";

// create const for main top level key
const mainTopLevelKey = "connection_name";


async function addConnection() {
  const connectionName = await Input.prompt("Enter the connection name");
  const connectionKey = await Input.prompt("Enter path to the Key file");
  const connectionString = await Input.prompt("Enter the username and host");
  const connectionPort = await Input.prompt({
    message: "Enter the port",
    default: "22",
  })

  const kv = await Deno.openKv();

  const prefs = {
    connectionKey: connectionKey,
    connectionString: connectionString,
    connectionPort: connectionPort,
    created_at: new Date().toISOString(),
  };

  await kv.set([mainTopLevelKey, connectionName], prefs);

  console.log(`New connection "${connectionName}" has been added. ssh -i ${connectionKey} ${connectionString} -p ${connectionPort}`);
  kv.close();
}

function convertISOTimeToLocalTime(isoTime: string): string {
  const date = format(new Date(isoTime), "dd-MM-yyyy HH:mm:ss");
  return date;
}

async function listConnections() {
  const kv = await Deno.openKv();
  const entries = kv.list({ prefix: [mainTopLevelKey] });

  const table: Table = new Table()
    .header(["Name", "Command", "Created At"])

  for await (const entry of entries) {
    // Cast entry.value to the expected type
    const value = entry.value as { connectionKey: string, connectionString: string, connectionPort: number, created_at: string };
    const connectionName = String(entry.key[1]);

    const ssh_key = value.connectionKey ? `-i ${value.connectionKey}` : "";
    const ssh_port = value.connectionPort ? `-p ${value.connectionPort}` : "";
    const connectionCreatedAt = convertISOTimeToLocalTime(value.created_at);

    const connectionCommand = `ssh ${ssh_key} ${value.connectionString} ${ssh_port}`;
  
    table.push([connectionName, connectionCommand, connectionCreatedAt]);
  }

  table.maxColWidth(100)
    .padding(1)
    .indent(2)
    .border(true)
    .render();

  kv.close();
}

async function removeConnection() {
  const connectionName = await Input.prompt("Enter the connection name");
  const kv = await Deno.openKv();
  await kv.delete([mainTopLevelKey, connectionName]);
  console.log("Successfully removed connection name" + connectionName);
  kv.close();
}

async function connectTo(connectionName: string) {
  console.log(connectionName);
}

await new Command()
  .name("SSH-Ez : SSH connection management")
  .version("0.1.0")
  .description("Command line to manage your ssh connections")
  .command("add", "Add a new connection")
  .action(() => {
    addConnection();
  })
  .command("list", "List all the connections")
  .action(() => {
    listConnections();
  })
  .command("remove", "Remove a connection")
  .action(() => {
    removeConnection();
  })
  .command("conn <dir>", "Remove directory.")
  .usage("sshez connect <connection_name>")
  .action((dir) => {
    connectTo(dir);
  })
  .parse(Deno.args);