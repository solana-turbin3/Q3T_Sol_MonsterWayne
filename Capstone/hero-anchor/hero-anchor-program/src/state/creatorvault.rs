use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct CreatorVault {
    pub creator: Pubkey,
    pub validator: Pubkey,
    #[max_len(10)]
    pub name: String,
   // #[max_len(5)]
   // pub name: String,
    //pub vote_account: Pubkey,
  //  pub total_subscribers: u64,
    //#[max_len(10)]
   // pub subscribers: Vec<Pubkey>,
    pub total_subcribers: u64,
    pub balance: u64,
   //pub fee_percentage: u8,
    pub bump: u8,
}