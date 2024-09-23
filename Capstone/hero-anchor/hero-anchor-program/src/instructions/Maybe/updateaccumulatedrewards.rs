use anchor_lang::prelude::*;
use anchor_lang::solana_program::stake::state::{Authorized, Lockup};
use anchor_lang::solana_program::stake::instruction as stake_instruction;
use anchor_lang::solana_program::{stake, system_instruction, sysvar};
use crate::{CreatorVault, UserVault};


#[derive(Accounts)]
pub struct UpdateAccumulatedRewards<'info> {
    #[account(mut)]
    pub user_vault: Account<'info, UserVault>,
    pub user: Signer<'info>,
}

impl<'info> UpdateAccumulatedRewards<'info> {
    pub fn updateaccumulatedrewards(&mut self, rewards: u64) -> Result<()> {
        let user_vault = &self.user_vault;
        user_vault.accumulated_rewards += rewards;
    }
}