use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct AdminVault {
    pub admin: Pubkey,
    pub balance: u64,
    pub bump: u8,
}


