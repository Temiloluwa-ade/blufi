import FungibleToken from 0xFungibleToken
// import Blufi from 0xBlufi
import Blufi from 0xcf886bcd0e6dcd1f;

transaction(message: String, amount: UFix64, recurring: Bool, to: Address) {

    let fromAddress: Address
    let fromVault: &FungibleToken.Vault
    let toProject: &AnyResource{Blufi.Public}

    prepare(signer: AuthAccount) {

        // Get a reference to the signer's stored vault
        self.fromVault = signer.borrow<&FungibleToken.Vault>(from: /storage/flowTokenVault)
           ?? panic("Could not borrow reference to the owner's Vault!")

        self.toProject = getAccount(to)
            .getCapability(Blufi.publicPath)
            .borrow<&AnyResource{Blufi.Public}>()
            ?? panic("Could not borrow receiver reference to the recipient's Blufi Project")

        self.fromAddress = signer.address
    }

    execute {
        self.toProject.donate(
            from: self.fromVault,
            amount: amount,
            fromAddress: self.fromAddress,
            message: message,
            recurring: recurring
        )
    }
}
