use anchor_lang::prelude::*;
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
    pub fn init_creator(&mut self, name: String, bumps: &InitCreatorBumps) -> Result<()> {

        self.creator_vault.set_inner(CreatorVault {
            creator: self.creator.key(),
            name: name,
            //vote_account: Pubkey::default(),
            //total_subscribers: 0,
            //subscribers: Vec::new(),
            total_subcribers: 0,
            balance: 0,
           // fee_percentage: 0,
          //  name : name,
            bump: bumps.creator_vault,
        });

        Ok(())
    }


}