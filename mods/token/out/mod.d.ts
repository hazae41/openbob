declare module "libs/address/mod" {
    import { packref, textref } from "@hazae41/stdbob";
    export namespace addresses {
        function verify(session: packref): textref;
    }
}
declare module "libs/storage/mod" {
    import { bigintref, textref } from "@hazae41/stdbob";
    export namespace storages {
        namespace init {
            function get(): bool;
            function set(): void;
        }
        namespace owner {
            function get(): textref;
            function set(address: textref): void;
        }
        namespace supply {
            function get(): bigintref;
            function set(value: bigintref): void;
        }
        namespace balances {
            function get(address: textref): bigintref;
            function set(address: textref, value: bigintref): void;
        }
    }
}
declare module "mod" {
    import { bigintref, packref, textref } from "@hazae41/stdbob";
    /**
     * Get the current owner of the token
     * @returns
     */
    export function owner(): textref;
    /**
     * Use owner session to transfer the ownership to a specific address
     * @param session
     * @param target
     * @returns
     */
    export function dispose(session: packref, target: textref): void;
    /**
     * Get the name of the token
     * @returns
     */
    export function name(): textref;
    /**
     * Get the symbol of the token
     * @returns
     */
    export function symbol(): textref;
    /**
     * Get the number of decimals of the token
     * @returns
     */
    export function decimals(): i32;
    /**
     * Get the balance of a specific address
     * @param target
     * @returns i64
     */
    export function balance(target: textref): bigintref;
    /**
     * Get the total supply of the token
     * @returns
     */
    export function supply(): bigintref;
    /**
     * Use the owner session to mint tokens to a specific address
     * @param session
     * @param target
     * @param amount
     */
    export function mint(session: packref, target: textref, amount: bigintref): void;
    /**
     * Use some session to burn tokens from the caller address
     * @param session
     * @param amount
     * @returns
     */
    export function burn(session: packref, amount: bigintref): void;
    /**
     * Use some session to transfer tokens to a specific address
     * @param session
     * @param target
     * @param amount
     */
    export function transfer(session: packref, target: textref, amount: bigintref): void;
}
