use anchor_lang::prelude::*;
use crate::state::AdminVault;

#[derive(Accounts)]
pub struct InitAdmin<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = admin,
        space = 8 + AdminVault::INIT_SPACE,
        seeds = [b"admin_vault", admin.key().as_ref()],
        bump
    )]
    pub admin_vault: Account<'info, AdminVault>,
    pub system_program: Program<'info, System>,
}

impl<'info> InitAdmin<'info> {
    pub fn initadmin(&mut self, bump: &InitAdminBumps) -> Result<()> {

        self.admin_vault.set_inner(AdminVault {
            admin: self.admin.key(),
            balance: 0,
            bump: bump.admin_vault,
        });
      
        Ok(())
    }
}