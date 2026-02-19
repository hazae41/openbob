import { bigintref, bigints, blobref, blobs, env, packref, packs, sha256, storage, textref, texts } from "@hazae41/stdbob"
import { addresses } from "./libs/address/mod"
import { storages } from "./libs/storages/mod"

/**
 * Get the name of the token
 * @returns 
 */
export function name(): textref {
  return texts.fromString("Spark")
}

/**
 * Get the symbol of the token
 * @returns 
 */
export function symbol(): textref {
  return texts.fromString("SPARK")
}

/**
 * Get the number of decimals of the token
 * @returns 
 */
export function decimals(): i32 {
  return 18
}

/**
 * Get the balance of a specific address
 * @param target 
 * @returns i64
 */
export function balance(target: textref): bigintref {
  return storages.balances.get(target)
}

/**
 * Get the total supply of the token
 * @returns 
 */
export function supply(): bigintref {
  return storages.supply.get()
}

/**
 * Use some session to mint tokens to the caller address
 * @param session 
 * @param effort proof of work
 * @returns the amount of tokens minted
 */
export function mint(session: packref, effort: blobref): bigintref {
  const caller = addresses.verify(session)

  const proof = sha256.digest(effort)
  const stuff = sha256.digest(packs.create3(env.uuid(), caller, proof))

  if (storage.get(stuff))
    return env.panic<bigintref>(texts.fromString("Already used"))

  storage.set(stuff, true)

  const maximum = bigints.pow(bigints.two(), bigints.fromInt64(256))
  const integer = bigints.fromBase16(blobs.toBase16(stuff))

  const value = bigints.div(maximum, integer)

  const supply = storages.supply.get()
  const amount = bigints.min(value, supply)

  storages.balances.set(caller, bigints.add(storages.balances.get(caller), amount))

  storages.supply.set(bigints.add(supply, amount))

  storage.set(texts.fromString("mint"), packs.create2(caller, amount))

  return amount
}

/**
 * Use some session to burn tokens from the caller address
 * @param session 
 * @param amount 
 * @returns 
 */
export function burn(session: packref, amount: bigintref): void {
  const caller = addresses.verify(session)

  const bcaller = storages.balances.get(caller)

  if (bigints.lt(bcaller, amount))
    return env.panic<void>(texts.fromString("Insufficient balance"))

  storages.balances.set(caller, bigints.sub(bcaller, amount))

  storages.supply.set(bigints.sub(storages.supply.get(), amount))

  storage.set(texts.fromString("burn"), packs.create2(caller, amount))
}

/**
 * Use some session to transfer tokens to a specific address
 * @param session 
 * @param target 
 * @param amount 
 */
export function transfer(session: packref, target: textref, amount: bigintref): void {
  const caller = addresses.verify(session)

  const bcaller = storages.balances.get(caller)
  const btarget = storages.balances.get(target)

  if (bigints.lt(bcaller, amount)) // bsender < amount
    return env.panic<void>(texts.fromString("Insufficient balance"))

  storages.balances.set(caller, bigints.sub(bcaller, amount))
  storages.balances.set(target, bigints.add(btarget, amount))

  storage.set(texts.fromString("transfer"), packs.create3(caller, target, amount))
}