// File: hero-anchor-program/programs/hero-anchor-program/src/error.rs

use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("No rewards available to withdraw.")]
    NoRewardsAvailable,
    #[msg("Calculation error.")]
    CalculationError,
    #[msg("Instruction error.")]
    InstructionError,
    #[msg("Invalid stake state.")]
    InvalidStakeState,
    #[msg("Stake account not deactivated.")]
    StakeAccountNotDeactivated,
    #[msg("Unclaimed rewards.")]
    UnclaimedRewards,
    #[msg("No funds to withdraw.")]
    NoFundsToWithdraw,
    #[msg("Stake account not initialized.")]
    StakeAccountNotInitialized,
    #[msg("Stake account activating.")]
    StakeAccountActivating,
    // Add other error codes as needed
}