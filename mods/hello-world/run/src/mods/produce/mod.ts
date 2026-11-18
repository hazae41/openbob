import { generate } from "@/libs/effort/mod.ts";
import { Packable, Packed } from "@/libs/packed/mod.ts";
import { Writable } from "@hazae41/binary";
import { RpcResponse } from "@hazae41/jsonrpc";
import { readFileSync } from "node:fs";
import process from "node:process";

function parse(texts: string[]): Array<Packable> {
  const values = new Array<Packable>()

  for (const text of texts) {
    if (text === "null") {
      values.push(null)
      continue
    }

    if (text.startsWith("blob:")) {
      values.push(Uint8Array.fromHex(text.slice("blob:".length)))
      continue
    }

    if (text.startsWith("bigint:")) {
      values.push(BigInt(text.slice("bigint:".length)))
      continue
    }

    if (text.startsWith("number:")) {
      values.push(Number(text.slice("number:".length)))
      continue
    }

    if (text.startsWith("text:")) {
      values.push(text.slice("text:".length))
      continue
    }

    throw new Error("Unknown value type")
  }

  return values
}

const [file, server, ...params] = process.argv.slice(2)

const headers = { "Content-Type": "application/json" }

const codeAsRaw = readFileSync(file)
const codeAsHex = codeAsRaw.toHex()

const saltAsRaw = Writable.writeToBytes(new Packed(parse(params)))
const saltAsHex = saltAsRaw.toHex()

const effortAsRaw = await generate(codeAsRaw.length + saltAsRaw.length)
const effortAsHex = effortAsRaw.toHex()

const subrequest = { method: "bob_create", params: [codeAsHex, saltAsHex, effortAsHex] }

const response = await fetch(new URL("/api/create", server), { method: "POST", headers, body: JSON.stringify(subrequest) });

if (!response.ok)
  throw new Error("Failed to fetch", { cause: response })

const subresponse = RpcResponse.from<string>(await response.json())

if (!subresponse.isOk())
  throw subresponse.getErr()

console.log(subresponse.get())