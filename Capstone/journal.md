
Context :

-Create a Vault (PDA): Each creator has a Program Derived Address (PDA) that acts as their vault to hold the deposited SOL.

-Deposit Process: The user transfers SOL from their wallet to the creator's vault (PDA). 
This process involves sending a transaction where the SOL is moved from the user's wallet to the vault's PDA.

-The user’s subscription details (amount deposited, timestamp, etc.) are recorded in the platform’s state.


Scenario 1 - Staking the SOL from the Vault
///////////////////////

=====Staking Process:======

1.Stake Account Creation: A staking account is created for the creator's vault. 
This is necessary because each staked account on Solana must have its own separate stake account.

2.Delegate SOL to a Validator: The SOL in the vault is then delegated to a specific validator node. 
This can be done by invoking Solana’s native staking program

3.Staking Activation: The SOL must go through a brief activation period before it starts earning rewards. 
This means the SOL is not immediately earning staking rewards


Technical Considerations:

PDA Authority: The PDA must have the authority to create and manage staking accounts.

Transaction Fees: There are fees associated with creating staking accounts and delegating SOL. 
These need to be accounted for in your platform's design.

Program Logic: Your smart contract must include logic to handle multiple user deposits, each adding to 
the total amount of SOL staked on behalf of the creator.

======Distributing 100% Staking Rewards to the Creator======

Reward Collection and Distribution:
Accumulating Rewards: The staking rewards accrue in the creator's staking account automatically as SOL.
Claiming Rewards: Periodically, the platform’s smart contract can claim these rewards. 
This can be done by calling the withdraw_rewards instruction of Solana's staking program, which moves the earned SOL rewards from the staking account to the creator's vault (PDA).
Transfer to Creator: Once rewards are claimed, the smart contract transfers the SOL to the creator's treausry or a separate PDA owned by the creator.


Technical Considerations:
Automation: You might want to automate the claiming and transfer of rewards periodically (e.g., daily, weekly). 
This requires setting up a cron job or using a scheduled service.

Fees for Reward Distribution: Claiming rewards and transferring them to the creator will incur transaction fees. 
Your platform needs to cover these costs or deduct them from the rewards.

===========User Withdrawals (Unsubscribing)================

Unstake Process:

Withdrawal Request: The user initiates a withdrawal request, specifying the amount of SOL they wish to withdraw.

Unstaking SOL: The platform must first deactivate the equivalent amount of SOL from the staking account. 
This starts the unstaking process, which takes some time (usually an epoch or two on Solana).

Withdrawal Period: During this period, the SOL is in a "deactivating" state and does not earn rewards. The platform must track the deactivation status.

Completing Withdrawal: Once the unstaking period is over, the SOL is transferred back from the staking account to the creator's vault (PDA), and then it can be withdrawn to the user’s wallet.




