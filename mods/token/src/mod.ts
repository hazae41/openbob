import { bigintref, bigints, env, packref, packs, storage, textref, texts } from "@hazae41/stdbob"
import { addresses } from "./libs/address/mod"

namespace storages {

  export namespace init {

    export function get(): bool {
      const found = storage.get(texts.fromString("init"))

      if (!found)
        return false

      return true
    }

    export function set(): void {
      storage.set(texts.fromString("init"), true)
    }

  }

  export namespace owner {

    export function get(): textref {
      const found = storage.get(texts.fromString("owner"))

      if (!found)
        return texts.fromString("<insert default owner address here>")

      return packs.get<textref>(found, 0)
    }

    export function set(address: textref): void {
      storage.set(texts.fromString("owner"), address)
    }

  }

  export namespace supply {

    export function get(): bigintref {
      const found = storage.get(texts.fromString("supply"))

      if (!found)
        return bigints.zero()

      return packs.get<bigintref>(found, 0)
    }

    export function set(value: bigintref): void {
      storage.set(texts.fromString("supply"), value)
    }

  }

  export namespace balances {

    export function get(address: textref): bigintref {
      const found = storage.get(packs.create2(texts.fromString("balance"), address))

      if (!found)
        return bigints.zero()

      return packs.get<bigintref>(found, 0)
    }

    export function set(address: textref, value: bigintref): void {
      storage.set(packs.create2(texts.fromString("balance"), address), value)
    }

  }

}

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