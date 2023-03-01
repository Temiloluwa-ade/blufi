// import Blufi from 0xBlufi
import Blufi from 0xcf886bcd0e6dcd1f;


transaction (name: String, websiteUrl: String, description: String) {

    prepare(signer: AuthAccount) {
        let profile = signer.getCapability<&{Blufi.Private}>(Blufi.privatePath)
            .borrow()
            ?? panic("Could not borrow Blufi Project")

        profile.setInfo(info: Blufi.Info(name: name, websiteUrl: websiteUrl, description: description))
    }

}
