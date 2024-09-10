use anchor_lang::{ prelude::*, system_program::Transfer};
use crate::{state::UserVault, CreatorVault};

#[derive(Accounts)]
pub struct WithdrawAndCloseUser<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub creator: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [b"creator_vault", creator.key().as_ref()],
        bump = creator_vault.bump
    )]
    pub creator_vault: Account<'info, CreatorVault>,

    #[account(
        mut,
        //close = user,
        seeds = [b"user_vault", user.key().as_ref(), creator_vault.name.as_ref()],
        bump = user_vault.bump
    )]
    pub user_vault: Account<'info, UserVault>,

    // #[account(
    //     mut,
    //     seeds = [b"creator_pda", creator.key().as_ref()],
    //     bump = creator_pda.bump
    // )]
    // pub creator_pda: Account<'info, CreatorVault>,

    pub system_program: Program<'info, System>,
}

impl<'info> WithdrawAndCloseUser<'info> {
    pub fn withdrawandcloseuservault(&mut self) -> Result<()> {
        //let user_key = self.user.key();
        //let creator_key = self.creator.key();
        //let bump = self.user_vault.bump;
        
        // let signer_seeds: [&[&[u8]]; 1] = [&[
        //     b"user_vault",
        //     self.user.to_account_info().key.as_ref(),
        //     &self.creator_vault.name.as_ref(),
        //     &[self.user_vault.bump],
        // ]]; 

        let signer_seeds: [&[&[u8]]; 1] = [&[
            b"user_vault",
            self.user.to_account_info().key.as_ref(),
            &self.creator_vault.name.as_ref(),
            &[self.user_vault.bump],
        ]]; 
        
        let accounts = Transfer {
            from: self.user_vault.to_account_info(),
            to: self.user.to_account_info(),
        };

        let cpi_ctx = CpiContext::new_with_signer(
            self.system_program.to_account_info(),
            accounts,
            &signer_seeds,
        );

        anchor_lang::system_program::transfer(cpi_ctx, self.user_vault.balance)?;

        // self.creator_pda.balance = self.creator_pda.balance.checked_sub(self.user_vault.balance)
        //     .ok_or(ProgramError::ArithmeticOverflow)?;

       // self.user_vault.close(self.user.to_account_info().clone())?;

        Ok(())
    }
}
