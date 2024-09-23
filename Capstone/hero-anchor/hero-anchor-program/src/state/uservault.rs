use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct UserVault {
    pub user: Pubkey,
    pub creator: Pubkey,
    pub balance: u64,
    pub staked_amount: u64,
    pub stake_account: Pubkey,
    pub stake_account_count: u64,
    pub reward_stake_account: Pubkey,
    pub stake_at: i64, //to record when the user started staking.
   // pub reward_amount: u64,
    pub accumulated_rewards: u64,
    //pub last_epoch_time: i64,
    //pub seed: u64,
    pub bump: u8,
   // pub is_stake_active: bool,
    //pub last_reward_claim_time: i64,
}

// impl UserVault {
//     pub fn has_staked_for_one_month(&self, current_timestamp: i64) -> bool {
//         // 30 days * 24 hours * 60 minutes * 60 seconds
//         let one_month_seconds = 30 * 24 * 60 * 60;
//         current_timestamp - self.stake_at >= one_month_seconds
//     }
// }