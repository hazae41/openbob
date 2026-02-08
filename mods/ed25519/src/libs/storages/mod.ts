import { bigintref, bigints, blobref, packs, storage, texts } from "@hazae41/stdbob"

export namespace storages {

  export namespace nonces {

    export function get(pubkey: blobref): bigintref {
      const found = storage.get(packs.create2(texts.fromString("nonce"), pubkey))

      if (!found)
        return bigints.zero()

      return packs.get<bigintref>(found, 0)
    }

    export function set(pubkey: blobref, value: bigintref): void {
      storage.set(packs.create2(texts.fromString("nonce"), pubkey), value)
    }

  }

}