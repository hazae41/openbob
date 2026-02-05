/// <reference types="@/libs/bytes/lib.d.ts"/>

import { Packed } from "@/libs/packed/mod.ts";
import { Writable } from "@hazae41/binary";
import process from "node:process";

process.loadEnvFile("../../../.env.local")
process.loadEnvFile("../../../.env")

const [module] = process.argv.slice(2)

const keypair = await crypto.subtle.generateKey("Ed25519", true, ["sign", "verify"]) as CryptoKeyPair

const sigkey = new Uint8Array(await crypto.subtle.exportKey("pkcs8", keypair.privateKey))
const pubkey = new Uint8Array(await crypto.subtle.exportKey("spki", keypair.publicKey))

console.log("sigkey", sigkey.toHex())
console.log("pubkey", pubkey.toHex())

const encoded = Writable.writeToBytesOrThrow(new Packed([module, pubkey]))
const address = new Uint8Array(await crypto.subtle.digest("SHA-256", encoded))

console.log("address", address.toHex())