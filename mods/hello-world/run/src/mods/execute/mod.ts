// deno-lint-ignore-file no-unused-vars

import { generate } from "@/libs/effort/mod.ts";
import { Packable, Packed } from "@/libs/packed/mod.ts";
import { Readable, Writable } from "@hazae41/binary";
import { RpcResponse } from "@hazae41/jsonrpc";
import process from "node:process";

type Proof = [Array<string>, Array<[string, Uint8Array, Uint8Array]>, Array<[string, Uint8Array, Uint8Array]>, Packable, bigint]

async function execute(server: string, module: string, method: string, params: Array<Packable>) {
  for (let target = 1n; true; target *= 2n) {
    const headers = { "Content-Type": "application/json" }

    const paramsAsRaw = Writable.writeToBytes(new Packed(params))
    const effortAsRaw = await generate(target)

    const paramsAsHex = paramsAsRaw.toHex()
    const effortAsHex = effortAsRaw.toHex()

    const subrequest = { method: "bob_execute", params: [module, method, paramsAsHex, effortAsHex] }

    const response = await fetch(server, { method: "POST", headers, body: JSON.stringify(subrequest) })

    if (!response.ok)
      throw new Error("Failed to fetch", { cause: response })

    const subresponse = RpcResponse.from<string>(await response.json())

    if (!subresponse.isOk() && subresponse.getErr().code === -32002)
      continue
    if (!subresponse.isOk())
      throw subresponse.getErr()

    const resultAsHex = subresponse.get()
    const resultAsRaw = Uint8Array.fromHex(resultAsHex)

    const packed = Readable.readFromBytes(Packed, resultAsRaw)

    const [logs, reads, writes, returned, sparks] = packed as Proof

    for (const log of logs)
      console.log(log)

    return returned
  }
}

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

function jsonify(value: Packable): unknown {
  if (value == null)
    return { type: "null" }

  if (value instanceof Uint8Array)
    return { type: "blob", value: value.toHex() }

  if (typeof value === "bigint")
    return { type: "bigint", value: value.toString() }

  if (typeof value === "number")
    return { type: "number", value: value.toString() }

  if (typeof value === "string")
    return { type: "text", value }

  if (Array.isArray(value)) {
    const entries = new Array<unknown>()

    for (const subvalue of value)
      entries.push(jsonify(subvalue))

    return { type: "array", value: entries }
  }

  throw new Error("Unknown value type")
}

const [server, module, method, ...params] = process.argv.slice(2)

console.log(jsonify(await execute(server, module, method, parse(params))))