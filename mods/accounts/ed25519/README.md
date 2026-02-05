# Ed25519

Use accounts with Ed25519 signatures and incrementing nonce

```tsx
ebd3b654bb89fe0b5dca2e7b6e345388748bd3fcf6ba10cdba270d0016e1a18a
```

## Demo

Compile and deploy the module (it will display the module address)

```bash
npm run prepack && npm run produce
```

Generate a keypair (it will display your sigkey, pubkey, and address)

```bash
npm run generate
```

Execute a signed call to some submodule accepting a session

```bash
npm run execute <module> <sigkey> <pubkey> <submodule> <submethod> ...<subparams>
```

## Usage

### Server-side module

Ensure your target module function accepts a session (packref) as its first parameter, subsequent parameters can be anything you want

```tsx
import { blobs, modules, packref, packs, sha256, textref, texts } from "@hazae41/stdbob"

namespace addresses {

  export function verify(session: packref): textref {
    const module = packs.get<textref>(session, 0)

    if (!packs.get<bool>(modules.call(module, texts.fromString("verify"), packs.create1(session)), 0))
      throw new Error("Invalid session")

    if (packs.length(session) === 1)
      return module

    return blobs.toBase16(sha256.digest(blobs.encode(session)))
  }

}

export function test(session: packref): bool {
  const caller = addresses.verify(session)

  console.log(caller)

  return true
}
```

### Client-side pseudocode

Generate an Ed25519 keypair

```tsx
const sigkey = generate()
```

Export your public key as SPKI (aka DER aka ASN.1)

```tsx
const pubkey = export("spki", sigpkey)
```

Pack the Ed25519 module address (unprefixed hex text) with your SPKI public key (blob)

```tsx
const encoded = encode([ed25519.toHex(), pubkey])
```

Compute your account address by computing the SHA-256 of the pack

```tsx
const account = sha256(encoded).toHex()
```

Get your nonce (bigint) by executing the `get_nonce(account)` function on the Ed25519 module

```tsx
const nonce = await call<bigint>(ed25519, "get_nonce", [account])
```

Create the payload to your target module and only consider params after the session

```tsx
const message = encode([chainuuid, module, method, params, nonce])
```

In our case params is empty because in our example there is no param after the session

```tsx
const message = encode([chainuuid, module, "test", [], nonce])
```

Sign the payload with your Ed25519 private key

```tsx
const signature = sign(sigkey, message)
```

Execute the `call(module, method, params, pubkey, signature)` function on the Ed25519 module

```tsx
const result = await call(ed25519, "call", [module, method, parse(params), pubkey, signature]))
```

Verify your nonce has been incremented

```tsx
const nonce = await call<bigint>(ed25519, "get_nonce", [account])
```

Done!