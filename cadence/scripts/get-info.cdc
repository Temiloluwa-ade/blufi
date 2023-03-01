// import Blufi from 0xBlufi
import Blufi from 0xcf886bcd0e6dcd1f;

pub fun main(acc: Address): Blufi.Info {

    let project = getAccount(acc)
        .getCapability<&{Blufi.Public}>(Blufi.publicPath)
        .borrow()
        ?? panic("User not registered")

    return project.getInfo()
}
