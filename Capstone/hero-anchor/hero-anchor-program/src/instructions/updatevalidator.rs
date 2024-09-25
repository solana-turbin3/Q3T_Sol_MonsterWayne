use anchor_lang::prelude::*;

use crate::CreatorVault;

#[derive(Accounts)]
pub struct UpdateValidator<'info> {
   

    #[account(
        mut,
        has_one = creator,
        seeds = [b"creator_vault", creator.key().as_ref()],
        bump = creator_vault.bump
    )]
    pub creator_vault: Account<'info, CreatorVault>,
    pub creator: Signer<'info>,
}

impl<'info> UpdateValidator<'info> {
    pub fn updatevalidator(&mut self, new_validator: Pubkey) -> Result<()> {
        let creator_vault = &mut self.creator_vault;
        creator_vault.validator = new_validator;
        Ok(())
    }
}