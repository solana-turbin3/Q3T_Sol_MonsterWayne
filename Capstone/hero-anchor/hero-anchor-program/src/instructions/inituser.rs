use anchor_lang::prelude::*;
use crate::{state::UserVault, CreatorVault};

#[derive(Accounts)]
//#[instruction(seed: u64)]
pub struct InitUser<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    pub creator: SystemAccount<'info>,

    #[account(
        
        seeds = [b"creator_vault", creator.key().as_ref()],
        bump = creator_vault.bump
    )]
    pub creator_vault: Account<'info, CreatorVault>,

    #[account(
        init,
        payer = user,
        space = 8 + UserVault::INIT_SPACE,
        seeds = [b"user_vault", user.key().as_ref(), creator_vault.name.as_ref()],
        bump
    )]
    pub user_vault: Account<'info, UserVault>,

    pub system_program: Program<'info, System>,
}

impl<'info> InitUser<'info> {
    pub fn inituser(&mut self, creator: Pubkey, bumps: &InitUserBumps) -> Result<()> {

        self.user_vault.set_inner(UserVault {
            user: self.user.key(),
            creator: creator.key(),
            balance: 0,
            staked_amount: 0,
            stake_account: Pubkey::default(),
            stake_at: 0,
            reward_stake_account: Pubkey::default(),
            accumulated_rewards: 0,
            bump: bumps.user_vault,
            stake_account_count: 0,
        });

        Ok(())
    }


}

