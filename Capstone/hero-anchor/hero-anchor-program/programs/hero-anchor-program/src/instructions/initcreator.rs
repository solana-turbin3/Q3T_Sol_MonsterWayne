use anchor_lang::{prelude::*, system_program::{Transfer,transfer}};
use crate::state::CreatorVault;

#[derive(Accounts)]
pub struct InitCreator<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        init,
        payer = creator,
        space = 8 + CreatorVault::INIT_SPACE,
        seeds = [b"creator_vault", creator.key().as_ref()],
        bump
    )]
    pub creator_vault: Account<'info, CreatorVault>,

    pub system_program: Program<'info, System>,
}

impl<'info> InitCreator<'info> {
    pub fn init_user_vault(&mut self, bumps: &InitCreatorBumps) -> Result<()> {

        self.creator_vault.set_inner(CreatorVault {
            creator: self.creator.key(),
            vote_account: Pubkey::default(),
            total_subscribers: 0,
            subscribers: Vec::new(),
            balance: 0,
            bump: bumps.creator_vault,
        });

        Ok(())
    }


}