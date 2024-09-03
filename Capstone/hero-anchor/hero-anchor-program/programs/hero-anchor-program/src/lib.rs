use anchor_lang::prelude::*;

declare_id!("J3JVzqh9AVv1qcsquuUYmJggKEkKgifVxG48qiScC6jR");

mod instructions;
mod state;


use instructions::*;
use state::*;

#[program]
pub mod hero_anchor_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
