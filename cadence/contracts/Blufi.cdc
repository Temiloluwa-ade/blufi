import FungibleToken from "./core/FungibleToken.cdc"

pub contract Blufi {

    pub let publicPath: PublicPath
    pub let storagePath: StoragePath
    pub let privatePath: PrivatePath
    access(self) let handleMap: {String: Address};
    access(self) let reverseHandleMap: {Address: String};
    access(self) let fee: UFix64
    access(self) let feeAddress: Address

    pub event Registration(handle: String, name: String, address: Address)

    pub event Donation(
        from: Address,
        to: Address,
        amount: UFix64,
        message: String,
        recurring: Bool
    )

    pub struct Info {
        pub var name: String
        pub var description: String
        pub var websiteUrl: String

        init(name: String, websiteUrl: String, description: String) {
          self.name = name
          self.websiteUrl = websiteUrl
          self.description = description
        }
    }

    pub resource interface Public {
        pub fun getInfo(): Info
        pub fun donate(
            from: &FungibleToken.Vault,
            amount: UFix64,
            fromAddress: Address, // TODO: do we need to provide a fromAddress as arg?
            message: String,
            recurring: Bool
        )
    }

    pub resource interface Private {
        pub fun setInfo(info: Info)
    }

    pub resource Project: Public, Private {
        access(self) var name: String
        access(self) var address: Address
        access(self) var websiteUrl: String
        access(self) var description: String

        init(name: String, websiteUrl: String, description: String, address: Address) {
            self.name = name
            self.address = address
            self.websiteUrl = websiteUrl
            self.description = description
        }

        pub fun donate(
            from: &FungibleToken.Vault,
            amount: UFix64,
            fromAddress: Address, // TODO: do we need to provide a fromAddress as arg?
            message: String,
            recurring: Bool
        ) {
            let toAddress = self.owner?.address!;
            // calculate fee amount - predefined percentage of the total amount
            let feeAmount = amount * Blufi.fee
            // withdraw tokens to temporary vaults
            let donationVault <- from.withdraw(amount: amount)
            let feeVault <- from.withdraw(amount: feeAmount)

            // Get a reference to the donation recipient
            let receiverRef = getAccount(toAddress)
                .getCapability(/public/flowTokenReceiver)
                .borrow<&{FungibleToken.Receiver}>()
                ?? panic("Could not borrow receiver reference to the recipient's Vault")

            // Get a reference to the fee receiver
            let feeReceiverRef = getAccount(Blufi.feeAddress)
                .getCapability(/public/flowTokenReceiver)
                .borrow<&{FungibleToken.Receiver}>()
                ?? panic("Could not borrow receiver reference to the recipient's Vault")

            // deposit donation in the recipient wallet
            receiverRef.deposit(from: <-donationVault)
            // deposit fee to the service owner wallet
            feeReceiverRef.deposit(from: <-feeVault)

            emit Donation(
                from: fromAddress,
                to: toAddress,
                amount: amount,
                message: message,
                recurring: recurring
            )
        }

        pub fun getInfo(): Info {
            return Info(name: self.name, websiteUrl: self.websiteUrl, description: self.description)
        }

        pub fun setInfo(info: Info) {
            // TODO: emit event and add indexing to the backend
            pre {
                info.name.length <= 64: "Name must be 64 or less characters"
                info.websiteUrl.length <= 64: "Website URL must be 64 or less characters"
                info.description.length <= 500: "Description must be 500 or less characters"
            }
            self.name = info.name
            self.websiteUrl = info.websiteUrl
            self.description = info.description
        }

    }

    pub fun lookupAddress(handle: String): Address? {
        assert(self.handleMap.containsKey(handle), message: "Handle not found")
        return self.handleMap[handle]
    }

    pub fun lookupHandle(address: Address): String? {
        assert(self.reverseHandleMap.containsKey(address), message: "Address not found")
        return self.reverseHandleMap[address]
    }

    pub fun createProject(handle: String, name: String, websiteUrl: String, description: String, address: Address) : @Blufi.Project {
    	pre {
            handle.length <= 32: "Handle must be 32 or less characters"
            websiteUrl.length <= 64: "Website URL must be 64 or less characters"
    		name.length <= 64: "Name must be 64 or less characters"
    	}
        // project names must be unique
        assert(!self.handleMap.containsKey(handle), message: "Handle is already taken")
        self.handleMap.insert(key: handle, address)
        self.reverseHandleMap.insert(key: address, handle)

    	emit Registration(handle: handle, name: name, address: address)
    	return <- create Blufi.Project(name: name, websiteUrl: websiteUrl, description: description, address: address)
    }

    init(feeAddress: Address, fee: UFix64) {
		self.publicPath = /public/blufi
		self.storagePath = /storage/blufi
		self.privatePath = /private/blufi
        self.handleMap = {}
        self.reverseHandleMap = {}
        self.fee = fee
        self.feeAddress = feeAddress
	}
}
