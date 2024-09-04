use anchor_lang::prelude::*;
use solana_program::stake::state::Stake;

use crate::UserVault;

#[derive(Accounts)]

pub struct StakeSol<'info> {
    #[account(mut)]
    pub user : Signer<'info>,
    pub creator: SystemAccount<'info>,
    

    #[account(
        mut,
        seeds = [b"user_vault", user.key().as_ref(), creator.key().as_ref()],
        bump = user_vault.bump,
    )]
    pub user_vault: Account<'info, UserVault>,
    #[account(mut)]
   // pub user_data: Account<'info, UserData>,
    /// CHECK: This is the validator's vote account
    pub validator_vote: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub stake_program: Program<'info, Stake>,
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
    pub stake_history: Sysvar<'info, StakeHistory>,
    /// CHECK: This is the stake config account
    pub stake_config: UncheckedAccount<'info>,
    
    
}

impl<'info> StakeSol<'info> {
    pub fn stake_sol(ctx: Context<StakeSol>, amount: u64, validator: Pubkey) -> Result<()> {

           // 1. Create a new stake account
    let (stake_account, _) = Pubkey::find_program_address(
        &[b"stake", ctx.accounts.user_vault.key().as_ref()],
        ctx.program_id,
    );

    // 2. Transfer SOL from user vault to the new stake account
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.user_vault.to_account_info(),
            to: stake_account.to_account_info(),
        },
    );
    system_program::transfer(cpi_context, amount)?;

    // 3. Initialize the stake account
    let cpi_context = CpiContext::new(
        ctx.accounts.stake_program.to_account_info(),
        stake_program::Initialize {
            stake: stake_account.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        },
    );
    stake_program::initialize(cpi_context, &stake::state::Authorized {
        staker: ctx.accounts.user_vault.key(),
        withdrawer: ctx.accounts.user_vault.key(),
    }, &stake::state::Lockup::default())?;

    // 4. Delegate the stake to the chosen validator
    let cpi_context = CpiContext::new(
        ctx.accounts.stake_program.to_account_info(),
        stake_program::Delegate {
            stake: stake_account.to_account_info(),
            vote: ctx.accounts.validator_vote.to_account_info(),
            clock: ctx.accounts.clock.to_account_info(),
            stake_history: ctx.accounts.stake_history.to_account_info(),
            config: ctx.accounts.stake_config.to_account_info(),
        },
    );
    stake_program::delegate(cpi_context)?;

    // 5. Update user data
    ctx.accounts.user_vault.staked_amount = ctx.accounts.user_vault.staked_amount.checked_add(amount).unwrap();
    ctx.accounts.user_vault.stake_account = stake_account;

    Ok(())

    }
}