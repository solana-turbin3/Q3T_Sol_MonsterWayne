use anchor_lang::prelude::*;

//declare_id!("J3JVzqh9AVv1qcsquuUYmJggKEkKgifVxG48qiScC6jR");
//declare_id!("9jm6oUjvfYaHpikCj1qb4SXKoqinvLhkKHBapW6oqu4n");
//declare_id!("8SBjeeeyoCgekYKGBLd6p9nS7BwY62h1Smsc4riTbjAc");
//declare_id!("5s6dWjXhUnv7EjVfAput2x8WAxB5vBsSQpKZbnDM4ZVC");
//declare_id!("FyNFEUPNAmVfvjXdTriorh71vsC1jdMi2HxkHujnWWUM");
//declare_id!("DEXA1SPRbDf4tugo6TeePTqUnN9QNSiz1XRRdaMosWPa");

declare_id!("7JDguW1LTudWAhND2YWrrxjrjS3cSBNjrtdCx7nmk1jE");




mod instructions;
mod state;
pub mod error;



use instructions::*;
use state::*;

#[program]
pub mod hero_anchor_program {
    

    use super::*;

     pub fn initcreator(ctx: Context<InitCreator>, name: String) -> Result<()> {
        ctx.accounts.initcreator(name, &ctx.bumps)
    }

    pub fn inituser(ctx: Context<InitUser>, creator: Pubkey) -> Result<()> {
        ctx.accounts.inituser( creator, &ctx.bumps)

    }

   
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        ctx.accounts.deposit(amount)
      
    }

    // pub fn update_user_vault_stake_account(ctx: Context<UpdateUserStakeAccount>, stake_account: Pubkey) -> Result<()> {
    //     let user_vault = &mut ctx.accounts.user_vault;
    //     user_vault.stake_account = stake_account;
    //     Ok(())
    // }

    // pub fn withdrawandcloseuservault(ctx: Context<WithdrawAndCloseUser>) -> Result<()> {
    //     ctx.accounts.withdrawandcloseuservault()
    // }


    // pub fn withdrawandclosecreatorvault(ctx: Context<WithdrawAndCloseCreator>) -> Result<()> {
    //     ctx.accounts.withdrawandclosecreatorvault()
    // }

    // pub fn update_stake_account(ctx: Context<UpdateUserStakeAccount>, stake_account: Pubkey, amount: u64) -> Result<()> {
    //     ctx.accounts.update_stake_account(stake_account, amount)
    // }

    pub fn stakesol(ctx: Context<StakeSol>, amount: u64) -> Result<()> {
        ctx.accounts.stakesol(amount)
    }

    pub fn calculateandsplitrewards(ctx: Context<CalculateAndSplitRewards>) -> Result<()> {
        ctx.accounts.calculateandsplitrewards()
    }

    pub fn withdrawrewards(ctx: Context<WithdrawRewards>) -> Result<()> {
        ctx.accounts.withdrawrewards()
    }

    // pub fn delegatestake(ctx: Context<DelegateStake>) -> Result<()> {
    //     ctx.accounts.delegatestake()
    // }

    // pub fn deactivatestake(ctx: Context<DeactivateStake>) -> Result<()> {
    //     ctx.accounts.deactivatestake()
    // }

//    pub fn create_stake_delegate(ctx: Context<CreateStakeDelegate>, amount: u64) -> Result<()> {
//         ctx.accounts.create_stake_delegate(amount)
//     }

    // pub fn unstakesol(ctx: Context<UnstakeSol>) -> Result<()> {
    //     ctx.accounts.unstakesol()
    // }

    // pub fn withdraw_unstaked_sol(ctx: Context<WithdrawUnstakedSol>) -> Result<()> {
    //     ctx.accounts.withdraw_unstaked_sol()
    // }

    // pub fn stakesolwow(ctx: Context<StakeSolWow>, amount: u64) -> Result<()> {
    //     ctx.accounts.stakesolwow(amount)
    // }
        
}




// #[derive(Accounts)]
// pub struct Initialize {}



