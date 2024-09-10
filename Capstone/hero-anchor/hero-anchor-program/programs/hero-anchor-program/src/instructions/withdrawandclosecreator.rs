use anchor_lang::{prelude::*, system_program::Transfer};
use crate::state::CreatorVault;

#[derive(Accounts)]
pub struct WithdrawAndCloseCreator<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut,
        close = creator,
        seeds = [b"creator_vault", creator.key().as_ref()],
        bump = creator_vault.bump
    )]
    pub creator_vault: Account<'info, CreatorVault>,
    pub system_program: Program<'info, System>,
}

impl<'info> WithdrawAndCloseCreator<'info> {
   
    pub fn withdrawandclosecreatorvault(&mut self) -> Result<()> {
        let creator_key = self.creator.key();
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"creator_pda",
            creator_key.as_ref(),
            &[self.creator_vault.bump]
        ]];

        let accounts = Transfer {
            from: self.creator_vault.to_account_info(),
            to: self.creator.to_account_info(),
        };

        let cpi_ctx = CpiContext::new_with_signer(
            self.system_program.to_account_info(),
            accounts,
            signer_seeds,
        );

        anchor_lang::system_program::transfer(cpi_ctx, self.creator_vault.balance)?;

        self.creator_vault.close(self.creator.to_account_info().clone())?;

        Ok(())
    }
}
