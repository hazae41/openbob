import { bigintref, bigints, blobref, blobs, ed25519, env, modules, packref, packs, refs, textref, texts } from "@hazae41/stdbob"
import { storages } from "./libs/storages/mod"

const sessions = new Set<usize>()

export function verify(session: packref): bool {
  return sessions.has(refs.numerize(session))
}

export function nonce(pubkey: blobref): bigintref {
  return storages.nonces.get(pubkey)
}

export function call(module: textref, method: textref, params: packref, pubkey: blobref, signature: blobref): packref {
  const nonce = storages.nonces.get(pubkey)

  const message = blobs.encode(packs.create5(env.uuid(), module, method, params, nonce))

  if (!ed25519.verify(pubkey, signature, message) && env.mode === 1)
    return env.panic<packref>(texts.fromString("Invalid signature"))

  storages.nonces.set(pubkey, bigints.add(nonce, bigints.one()))

  const session = packs.create2(modules.self(), pubkey)

  sessions.add(refs.numerize(session))

  return modules.call(module, method, packs.concat(packs.create1(session), params))
}