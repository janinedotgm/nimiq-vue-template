import { reactive } from 'vue'
import initClient, { Client, ClientConfiguration, KeyPair } from '@nimiq/core/web'

// Reactive object for storing the client, the current consensus state, and the latest head of the nimiq blockchain
export const nimiqNetwork = reactive({
  client: null as Client | null,
  consensus: 'CONNECTING' as string, // current consensus state, default is connecting
  address: '' as string,
  balance: 0 as number,
  readyToReceive: true as boolean, // true if faucet is available
  loading: true as boolean, // true if loading
  faucetResponse: '' as string, // response from the faucet
})

// Function to establish a connection to the nimiq network
export async function setupNimiqNetwork() {
  try {
    nimiqNetwork.loading = true // activate spinner

    await initClient()

    // configure client
    const config = new ClientConfiguration()
    config.logLevel('debug')
    config.network('TestAlbatross')
    nimiqNetwork.client = await Client.create(config.build())

    // listen for consensus state changes
    nimiqNetwork.client?.addConsensusChangedListener(async (state) => {
      nimiqNetwork.consensus = state

      if (state == 'established') {
        // check if we already created an address and if so, set it
        const savedAddress = localStorage.getItem('walletAddress')
        if (savedAddress) {
          nimiqNetwork.address = savedAddress
          await getBalance()
        }

        nimiqNetwork.loading = false // deactivate spinner
      }
    })
  } catch (error) {
    console.error('Error setting up Nimiq network:', error)
    nimiqNetwork.loading = false
  }
}

// Function to create a new wallet, thus an address
export async function createWallet() {
  const keyPair = KeyPair.generate() // generate a new keypair
  const address = keyPair.toAddress() // convert the keypair to an address
  nimiqNetwork.address = address.toUserFriendlyAddress() // update the address
  localStorage.setItem('walletAddress', nimiqNetwork.address) // Save address to local storage
}

type FaucetResponse = {
  success: false
  msg: string
  error?: string
}

// Function to receive funds from the faucet
export async function receiveFunds() {
  nimiqNetwork.loading = true // activate spinner

  if (!nimiqNetwork.readyToReceive) return // if faucet not available, stop

  // listen for transactions e.g. receiving NIM from faucet
  nimiqNetwork.client?.addTransactionListener(
    (transaction) => {
      getBalance() // update balance
      nimiqNetwork.loading = false // deactivate spinner
    },
    [nimiqNetwork.address] // address to listen for transactions
  )

  // receive funds
  fetch(`https://faucet.pos.nimiq-testnet.com/tapit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      address: nimiqNetwork.address,
    }),
  })
    .then((res) => res.json() as Promise<FaucetResponse>)
    .then((result) => {
      nimiqNetwork.faucetResponse = result.msg

      nimiqNetwork.loading = false // deactivate spinner
    })
    .catch((error: Error) => {
      console.error('Requesting funds unsuccessful: ', error)
      nimiqNetwork.loading = false // deactivate spinner
    })
}

// Function to fetch the balance of the wallet
export async function getBalance() {
  try {
    // check if consensus is established
    if (!(await nimiqNetwork.client?.isConsensusEstablished())) {
      throw new Error('Client not initialized')
    }

    // get the account for the given address
    const account = await nimiqNetwork.client?.getAccount(nimiqNetwork.address)

    // if account found, update balance
    if (account) {
      nimiqNetwork.balance = account.balance / 100000 // convert Luna to NIM
    } else {
      throw new Error('Account not found')
    }
  } catch (error) {
    console.error('Error fetching balance:', error)
  }
}

type FaucetInfoResponse = {
  network: 'test' | 'main'
  address: string
  balance: number
  dispenseAmount: number // NIM
  dispensesRemaining: number
  availableInRegion: boolean
}

// Function for checking if faucet is available
export function faucetAvailable() {
  return fetch('https://faucet.pos.nimiq-testnet.com/info')
    .then((response) => response.json() as Promise<FaucetInfoResponse>)
    .then((faucet) => {
      if (
        faucet.network === 'test' &&
        faucet.dispensesRemaining >= 1 && // check if there are any dispenses remaining
        faucet.availableInRegion && // check if the faucet is available in the region
        nimiqNetwork.consensus === 'established'
      ) {
        nimiqNetwork.readyToReceive = true
      } else {
        nimiqNetwork.readyToReceive = false
      }
    })
    .catch((error) => console.error('Faucet Error: ', error))
}
