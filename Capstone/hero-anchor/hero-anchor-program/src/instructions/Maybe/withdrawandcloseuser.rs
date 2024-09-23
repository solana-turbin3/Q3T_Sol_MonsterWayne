use std::io::Write;

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
        close = user,
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
        let user_balance = self.user_vault.balance;

        // Transfer funds
        let signer_seeds: &[&[&[u8]]] = &[&[
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
            signer_seeds,
        );

        anchor_lang::system_program::transfer(cpi_ctx, user_balance)?;

        // Close the account
        let binding = self.user_vault.to_account_info();
        let mut data = binding.try_borrow_mut_data()?;
        for byte in data.iter_mut() {
            *byte = 0;
        }
        
        let dst: &mut [u8] = &mut data;
        let mut cursor = std::io::Cursor::new(dst);
        cursor.write_all(&[0; 8])?; // Write discriminator for closed account

        // Transfer remaining lamports to the user
        **self.user.to_account_info().lamports.borrow_mut() = self.user.lamports()
            .checked_add(self.user_vault.to_account_info().lamports())
            .unwrap();
        **self.user_vault.to_account_info().lamports.borrow_mut() = 0;

        Ok(())
    }
}
