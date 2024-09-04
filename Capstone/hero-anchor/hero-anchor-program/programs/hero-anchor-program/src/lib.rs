use anchor_lang::prelude::*;

declare_id!("J3JVzqh9AVv1qcsquuUYmJggKEkKgifVxG48qiScC6jR");

mod instructions;
mod state;


use instructions::*;
use state::*;

#[program]
pub mod hero_anchor_program {
    use super::*;

     pub fn initcreator(ctx: Context<InitCreator>) -> Result<()> {
        ctx.accounts.init_creator(&ctx.bumps)
    }

    pub fn inituser(ctx: Context<InitUser>, amount: u64, creator: Pubkey) -> Result<()> {
        ctx.accounts.init_user_vault(amount, creator, &ctx.bumps)

    }

   
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        ctx.accounts.deposit_sol(amount)
      
    }

    pub fn update_stake_account(ctx: Context<UpdateStakeAccount>, stake_account: Pubkey) -> Result<()> {
        ctx.accounts.user_vault.stake_account = stake_account;
        Ok(())
        
    }


}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct UpdateStakeAccount<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_vault: Account<'info, UserVault>,
}
