import { bigintref, bigints, env, packref, packs, storage, textref, texts } from "@hazae41/stdbob"
import { addresses } from "./libs/address/mod"
import { storages } from "./libs/storages/mod"

/**
 * Get the current owner of the token
 * @returns 
 */
export function owner(): textref {
  return storages.owner.get()
}

/**
 * Use owner session to transfer the ownership to a specific address
 * @param session 
 * @param target 
 * @returns 
 */
export function dispose(session: packref, target: textref): void {
  const caller = addresses.verify(session)

  if (!texts.equals(caller, storages.owner.get()))
    return env.panic<void>(texts.fromString("Unauthorized"))

  storages.owner.set(target)

  storage.set(texts.fromString("dispose"), target)
}

/**
 * Get the name of the token
 * @returns 
 */
export function name(): textref {
  return texts.fromString("Token")
}

/**
 * Get the symbol of the token
 * @returns 
 */
export function symbol(): textref {
  return texts.fromString("TKN")
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
 * Use the owner session to mint tokens to a specific address
 * @param session 
 * @param target 
 * @param amount 
 */
export function mint(session: packref, target: textref, amount: bigintref): void {
  const caller = addresses.verify(session)

  if (!texts.equals(caller, storages.owner.get()))
    return env.panic<void>(texts.fromString("Unauthorized"))

  storages.balances.set(target, bigints.add(storages.balances.get(target), amount))

  storages.supply.set(bigints.add(storages.supply.get(), amount))

  storage.set(texts.fromString("mint"), packs.create2(target, amount))
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

  if (bigints.lt(bcaller, amount)) // bcaller < amount
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