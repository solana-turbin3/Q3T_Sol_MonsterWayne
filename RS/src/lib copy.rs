use solana_sdk::{signature::{Keypair, Signer}, pubkey::Pubkey};
use std::io::{self, BufRead};
use solana_sdk::bs58;
use solana_client::rpc_client::RpcClient;

// Create a new keypair
pub fn keygen() {
    let kp = Keypair::new(); // Create a new keypair
    println!("You've generated a new Solana wallet: {}", kp.pubkey().to_string());
    println!("");
    println!("To save your wallet, copy and paste the following into a JSON file:");
    println!("{:?}", kp.to_bytes());
}

pub fn base58_to_wallet() {
    println!("Input your private key as base58:");
    let stdin = io::stdin();
    let base58 = stdin.lock().lines().next().unwrap().unwrap(); println!("Your wallet file is:");
    let wallet = bs58::decode(base58).into_vec().unwrap(); println!("{:?}", wallet);
}


pub fn wallet_to_base58() {
    println!("Input your private key as a wallet file byte array:"); let stdin = io::stdin();
    let wallet =
    stdin.lock().lines().next().unwrap().unwrap().trim_start_matches('[').trim_end_matches(']').split(',') .map(|s| s.trim().parse::<u8>().unwrap()).collect::<Vec<u8>>();
    println!("Your private key is:");
    let base58 = bs58::encode(wallet).into_string(); println!("{:?}", base58);
}

#[cfg(test)]
mod tests {
    use super::*; 
    
    #[test]
    fn test_keygen() {
        keygen();
    }
    
    #[test]
    fn test_airdrop() {
        // Placeholder for airdrop function test
        assert!(true); // Just a dummy assertion
    }
    
    #[test]
    fn test_transfer_sol() {
        // Placeholder for transfer_sol function test
        assert!(true); // Just a dummy assertion
    }

    #[test]
    fn test_base58_to_wallet() {
        base58_to_wallet();
    }

    #[test]
    fn test_wallet_to_base58() {
        wallet_to_base58();
    }
    

}

//B6WC9Df7GX49oJreAWdWDXdgUk7twakoWedsNzVs8oFw
//[77, 74, 20, 222, 18, 252, 116, 108, 1, 254, 42, 128, 180, 5, 56, 185, 174, 92, 218, 86, 69, 119, 141, 147, 157, 85, 148, 25, 238, 200, 102, 28, 149, 253, 199, 234, 87, 133, 139, 193, 17, 139, 217, 90, 20, 246, 218, 246, 71, 12, 221, 0, 69, 85, 180, 126, 73, 82, 10, 78, 9, 233, 56, 82]