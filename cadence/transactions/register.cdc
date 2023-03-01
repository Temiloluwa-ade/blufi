// import Blufi from 0xBlufi
import Blufi from 0xcf886bcd0e6dcd1f;

transaction (handle: String, name: String, websiteUrl: String, description: String) {

    prepare(signer: AuthAccount) {
        let existing = signer.getCapability<&{Blufi.Public}>(Blufi.publicPath)
        if existing.check() {
            panic("Account is already registered")
        } else {
            let profile <-Blufi.createProject(
                handle: handle,
                name: name,
                websiteUrl: websiteUrl,
                description: description,
                address: signer.address
            )
            signer.save(<-profile, to: Blufi.storagePath)
            signer.link<&Blufi.Project{Blufi.Public}>(
                Blufi.publicPath,
                target: Blufi.storagePath
            )
            signer.link<&Blufi.Project{Blufi.Private}>(
                Blufi.privatePath,
                target: Blufi.storagePath
            )
        }
    }

}
 