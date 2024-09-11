use anchor_lang::prelude::*;
use anchor_lang::solana_program::stake::state::{Authorized, Lockup};
use anchor_lang::system_program;

declare_id!("YOUR_PROGRAM_ID");

#[program]
pub mod solana_staking_manager {
    use super::*;

    pub fn initialize_user_account(ctx: Context<InitializeUserAccount>) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        user_account.owner = ctx.accounts.user.key();
        user_account.balance = 0;
        user_account.bump = *ctx.bumps.get("user_account").unwrap();
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        let user = &ctx.accounts.user;

        // Transfer SOL from user to PDA
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: user.to_account_info(),
                    to: user_account.to_account_info(),
                },
            ),
            amount,
        )?;

        user_account.balance += amount;
        Ok(())
    }

    pub fn create_stake_account(ctx: Context<CreateStakeAccount>, amount: u64) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        let stake_account = &mut ctx.accounts.stake_account;

        // Create stake account
        let rent = Rent::get()?;
        let stake_account_size = std::mem::size_of::<StakeState>();
        let lamports = rent.minimum_balance(stake_account_size) + amount;

        system_program::create_account(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::CreateAccount {
                    from: user_account.to_account_info(),
                    to: stake_account.to_account_info(),
                },
            ),
            lamports,
            stake_account_size as u64,
            &ctx.accounts.stake_program.key(),
        )?;

        // Initialize stake account
        stake_program::initialize(
            CpiContext::new(
                ctx.accounts.stake_program.to_account_info(),
                stake_program::Initialize {
                    stake: stake_account.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
            ),
            Authorized {
                staker: user_account.key(),
                withdrawer: user_account.key(),
            },
            &Lockup::default(),
        )?;

        // Delegate stake
        stake_program::delegate_stake(
            CpiContext::new(
                ctx.accounts.stake_program.to_account_info(),
                stake_program::DelegateStake {
                    stake: stake_account.to_account_info(),
                    vote: ctx.accounts.vote_account.to_account_info(),
                    clock: ctx.accounts.clock.to_account_info(),
                    stake_history: ctx.accounts.stake_history.to_account_info(),
                    config: ctx.accounts.stake_config.to_account_info(),
                    authority: user_account.to_account_info(),
                },
            ),
        )?;

        user_account.balance -= amount;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeUserAccount<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 8 + 1,
        seeds = [b"user-account", user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [b"user-account", user.key().as_ref()],
        bump = user_account.bump
    )]
    pub user_account: Account<'info, UserAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateStakeAccount<'info> {
    #[account(
        mut,
        seeds = [b"user-account", user.key().as_ref()],
        bump = user_account.bump
    )]
    pub user_account: Account<'info, UserAccount>,
    #[account(mut)]
    pub stake_account: Signer<'info>,
    pub vote_account: AccountInfo<'info>,
    pub stake_program: Program<'info, Stake>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
    pub stake_history: Sysvar<'info, StakeHistory>,
    pub stake_config: AccountInfo<'info>,
}

#[account]
pub struct UserAccount {
    pub owner: Pubkey,
    pub balance: u64,
    pub bump: u8,
}