import { bigintref, bigints, packs, storage, textref, texts } from "@hazae41/stdbob"

export namespace storages {

  export namespace supply {

    export function get(): bigintref {
      const found = storage.get(texts.fromString("supply"))

      if (!found)
        return bigints.one()

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