use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct CreatorVault {
    pub creator: Pubkey,
    pub vote_account: Pubkey,
    pub total_subscribers: u64,
    #[max_len(100)]
    pub subscribers: Vec<Pubkey>,
    pub balance: u64,
    pub bump: u8,
}