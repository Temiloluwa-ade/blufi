// import Blufi from 0xBlufi
import Blufi from 0xcf886bcd0e6dcd1f;

pub fun main(address: Address): String? {
    return Blufi.lookupHandle(address: address)
}
