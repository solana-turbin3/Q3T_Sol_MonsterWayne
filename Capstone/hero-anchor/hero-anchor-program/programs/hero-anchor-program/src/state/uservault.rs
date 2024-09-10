use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct UserVault {
    pub pda_owner: Pubkey,
    pub creator: Pubkey,
    pub balance: u64,
    pub staked_amount: u64,
    pub stake_account: Pubkey,
    pub reward_amount: u64,
    pub last_epoch_time: i64,
    //pub seed: u64,
    pub bump: u8,
}