/* Storage layer. Talks to Azure Table Storage when STORAGE_CONNECTION is set.
   For local testing only, set LOCAL_MEMORY=1 to use an in-memory store instead. */
const tables = new Map();      // real TableClients, cached per table name
const memory = new Map();      // in-memory fallback: tableName -> Map("pk|rk" -> entity)

class NotConfigured extends Error { constructor(msg) { super(msg); this.code = "NOT_CONFIGURED"; } }

async function client(name) {
  if (tables.has(name)) return tables.get(name);
  const { TableClient } = require("@azure/data-tables");
  const c = TableClient.fromConnectionString(process.env.STORAGE_CONNECTION, name, { allowInsecureConnection: false });
  try { await c.createTable(); } catch (e) { if (e.statusCode !== 409) throw e; }
  tables.set(name, c);
  return c;
}
function mem(name) { if (!memory.has(name)) memory.set(name, new Map()); return memory.get(name); }
const key = (pk, rk) => pk + "|" + rk;

function mode() {
  if (process.env.STORAGE_CONNECTION) return "azure";
  if (process.env.LOCAL_MEMORY === "1") return "memory";
  throw new NotConfigured("STORAGE_CONNECTION is not set");
}

async function getEntity(table, pk, rk) {
  if (mode() === "memory") return mem(table).get(key(pk, rk)) || null;
  try { return await (await client(table)).getEntity(pk, rk); }
  catch (e) { if (e.statusCode === 404) return null; throw e; }
}
async function createEntity(table, entity) {
  if (mode() === "memory") {
    const m = mem(table), k = key(entity.partitionKey, entity.rowKey);
    if (m.has(k)) { const e = new Error("exists"); e.statusCode = 409; throw e; }
    m.set(k, { ...entity }); return;
  }
  await (await client(table)).createEntity(entity);
}
async function mergeEntity(table, entity) {
  if (mode() === "memory") {
    const m = mem(table), k = key(entity.partitionKey, entity.rowKey);
    m.set(k, { ...(m.get(k) || {}), ...entity }); return;
  }
  await (await client(table)).updateEntity(entity, "Merge");
}

module.exports = { getEntity, createEntity, mergeEntity, NotConfigured };
