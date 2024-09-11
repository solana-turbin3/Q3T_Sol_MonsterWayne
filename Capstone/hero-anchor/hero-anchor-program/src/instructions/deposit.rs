use anchor_lang::{prelude::*, system_program::{Transfer,transfer}};
use crate::{state::UserVault, CreatorVault};

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    pub creator: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [b"creator_vault", creator.key().as_ref()],
        bump
    )]
    pub creator_vault: Account<'info, CreatorVault>,

    #[account(
        mut,
        seeds = [b"user_vault", user.key().as_ref(), creator_vault.name.as_ref()],
        bump = user_vault.bump
    )]
    pub user_vault: Account<'info, UserVault>,

    pub system_program: Program<'info, System>,
}

impl<'info> Deposit<'info> {
    pub fn deposit_sol(&mut self, amount: u64) -> Result<()> {

        //Transfer SOL from user to PDA
        let accounts = Transfer {
            from: self.user.to_account_info(),
            to: self.user_vault.to_account_info(),
        };
    
        let cpi_ctx = CpiContext::new(self.system_program.to_account_info(), accounts);
    
        transfer(cpi_ctx, amount)?;
    
    
        self.user_vault.balance += amount;
            Ok(())
        }
}
   
