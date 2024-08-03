pub mod programs;


#[cfg(test)]

//use solana_sdk::{signature::{Keypair, Signer, read_keypair_file}, pubkey::Pubkey};
use solana_sdk::{message::Message, signature::{Keypair, Signer, read_keypair_file},transaction::Transaction};
use solana_program::{
    pubkey::Pubkey,
    system_instruction::transfer,system_program,
};
use std::str::FromStr;
use std::io::{self, BufRead};
use solana_sdk::bs58;
use solana_client::rpc_client::RpcClient;

use crate::programs::wba_prereq::{WbaPrereqProgram, CompleteArgs, UpdateArgs};

const RPC_URL: &str = "https://api.devnet.solana.com";


mod tests {
    use super::*; 
    
    #[test]
     fn keygen() {
        let kp = Keypair::new(); // Create a new keypair
        println!("You've generated a new Solana wallet: {}", kp.pubkey().to_string());
        println!("");
        println!("To save your wallet, copy and paste the following into a JSON file:");
        println!("{:?}", kp.to_bytes());
    }
    
    #[test]
     fn base58_to_wallet() {
        println!("Input your private key as base58:");
        let stdin = io::stdin();
        let base58 = stdin.lock().lines().next().unwrap().unwrap(); println!("Your wallet file is:");
        let wallet = bs58::decode(base58).into_vec().unwrap(); println!("{:?}", wallet);
    }
    
    #[test]
     fn wallet_to_base58() {
        println!("Input your private key as a wallet file byte array:"); let stdin = io::stdin();
        let wallet =
        stdin.lock().lines().next().unwrap().unwrap().trim_start_matches('[').trim_end_matches(']').split(',') .map(|s| s.trim().parse::<u8>().unwrap()).collect::<Vec<u8>>();
        println!("Your private key is:");
        let base58 = bs58::encode(wallet).into_string(); println!("{:?}", base58);
    }
    
    #[test]
    fn transfer_sol() {
        let keypair = read_keypair_file("dev-wallet.json").expect("Couldn't find wallet file");
        let to_pubkey = Pubkey::from_str("tVZyEqNfxXvFz5TZaRvggfxAnqjHksZdCp9BRQnXs35").unwrap();
        let rpc_client = RpcClient::new(RPC_URL);
        let recent_blockhash = rpc_client.get_latest_blockhash().expect("Failed to get recent blockhash");
        //Create a new transaction
        let transaction = Transaction::new_signed_with_payer(
            &[transfer(
            &keypair.pubkey(),
            &to_pubkey,
            1_000_000
            )],
            Some(&keypair.pubkey()),
            &vec![&keypair],
            recent_blockhash
            );
        //Send the transaction
        let signature = rpc_client
            .send_and_confirm_transaction(&transaction)
            .expect("Failed to send transaction");

        
        // Print our transaction out
        println!("Success! Check out your TX here:https://explorer.solana.com/tx/{}/?cluster=devnet",signature
      );

    }

    #[test]
    fn empty_dev_wallet(){
        let keypair = read_keypair_file("dev-wallet.json").expect("Couldn't find wallet file");
        let to_pubkey = Pubkey::from_str("tVZyEqNfxXvFz5TZaRvggfxAnqjHksZdCp9BRQnXs35").unwrap();
        let rpc_client = RpcClient::new(RPC_URL);
        let recent_blockhash = rpc_client.get_latest_blockhash().expect("Failed to get recent blockhash");

        // Get balance of dev wallet
        let balance = rpc_client.get_balance(&keypair.pubkey()).expect("Failed to get balance");

        // Create a test transaction to calculate fees
        let message = Message::new_with_blockhash(
            &[transfer(
            &keypair.pubkey(),
            &to_pubkey,
            balance,
        )],Some(&keypair.pubkey()),&recent_blockhash
        );

        // Calculate exact fee rate to transfer entire SOL amount out of account minus fees
        let fee = rpc_client.get_fee_for_message(&message).expect("Failed to get fee calculator");

        // Deduct fee from lamports amount and create a TX with correct balance
        let transaction = Transaction::new_signed_with_payer(
            &[transfer(
            &keypair.pubkey(),
            &to_pubkey,
            balance - fee,
        )],Some(&keypair.pubkey()),&vec![&keypair],recent_blockhash
    );  

        let signature = rpc_client
        .send_and_confirm_transaction(&transaction)
        .expect("Failed to send transaction");

         println!("Success! Check out your TX here:https://explorer.solana.com/tx/{}/?cluster=devnet",signature
        )
    }

    #[test]
    fn airdrop() {
        //import our keypair
        let keypair = read_keypair_file("dev-wallet.json").expect("Couldn't find wallet file");

        // Print the public key of the keypair
        println!("Public key of the dev-wallet.json keypair: {}", keypair.pubkey());

        //Connected to Solana Devnet RPC Client
        let rpc_client = RpcClient::new(RPC_URL.to_string());

        //we're going to claim 2 devnet SOL tokens ( 2 billion lamports)
        match rpc_client.request_airdrop(&keypair.pubkey(), 2_000_000_000) {
            Ok(s) => { //if the airdrop is successful
                // s is the signature of the transaction
                println!("Airdrop successful. Signature:");
                println!("https://explorer.solana.com/tx/{}?cluster=devnet", s.to_string());
            }
            Err(e) => {//if the airdrop fails
                println!("Airdrop failed: {:?}", e);
            }
        }
    }

    #[test]
    fn enroll() {
        let rpc_client = RpcClient::new(RPC_URL);
        let recent_blockhash = rpc_client.get_latest_blockhash().expect("Failed to get recent blockhash");
        let signer = read_keypair_file("jagoe-wallet.json").expect("Couldn't find wallet file");
        let prereq = WbaPrereqProgram::derive_program_address(&[b"prereq",signer.pubkey().to_bytes().as_ref()]);
        // Define our instruction data
        let args = CompleteArgs {github: b"monsterwayne".to_vec()}; 

        // Now we can invoke the "complete" function
        let transaction = WbaPrereqProgram::complete(
                &[&signer.pubkey(), &prereq, &system_program::id()],
                &args,
                Some(&signer.pubkey()),
                &[&signer],
                recent_blockhash
        );

        // Send the transaction

        let signature = rpc_client
            .send_and_confirm_transaction(&transaction)
            .expect("Failed to send transaction");
            // Print our transaction out
            println!("Success! Check out your TX here: https://explorer.solana.com/tx/{}/?cluster=devnet",signature);
    }

   
    

}

