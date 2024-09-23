export const hero = {
  "version": "0.1.0",
  "name": "hero_anchor_program",
  "address": "7JDguW1LTudWAhND2YWrrxjrjS3cSBNjrtdCx7nmk1jE",
  "metadata": {
    "name": "hero_anchor_program",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "calculateandsplitrewards",
      "discriminator": [92, 7, 100, 45, 86, 201, 26, 83],
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "creator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stake_account",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reward_stake_account",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user_vault",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [117, 115, 101, 114, 95, 118, 97, 117, 108, 116]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "creator_vault.name",
                "account": "CreatorVault"
              }
            ]
          }
        },
        {
          "name": "creator_vault",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [99, 114, 101, 97, 116, 111, 114, 95, 118, 97, 117, 108, 116]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "stake_authority",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [117, 115, 101, 114, 95, 118, 97, 117, 108, 116]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "creator_vault.name",
                "account": "CreatorVault"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false,
          "docs": ["System and Stake Programs"],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "stake_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false,
          "docs": ["Sysvars"],
          "address": "SysvarC1ock11111111111111111111111111111111"
        },
        {
          "name": "stake_history",
          "isMut": false,
          "isSigner": false,
          "address": "SysvarStakeHistory1111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "deposit",
      "discriminator": [242, 35, 198, 137, 82, 225, 242, 182],
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "creator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "creator_vault",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [99, 114, 101, 97, 116, 111, 114, 95, 118, 97, 117, 108, 116]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "user_vault",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [117, 115, 101, 114, 95, 118, 97, 117, 108, 116]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "creator_vault.name",
                "account": "CreatorVault"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false,
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initcreator",
      "discriminator": [99, 182, 247, 43, 35, 90, 13, 159],
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "creator_vault",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [99, 114, 101, 97, 116, 111, 114, 95, 118, 97, 117, 108, 116]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false,
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "inituser",
      "discriminator": [174, 160, 28, 28, 126, 89, 81, 236],
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "creator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "creator_vault",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [99, 114, 101, 97, 116, 111, 114, 95, 118, 97, 117, 108, 116]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "user_vault",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [117, 115, 101, 114, 95, 118, 97, 117, 108, 116]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "creator_vault.name",
                "account": "CreatorVault"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false,
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "creator",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "stakesol",
      "discriminator": [182, 45, 21, 254, 188, 82, 158, 209],
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "creator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user_vault",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [117, 115, 101, 114, 95, 118, 97, 117, 108, 116]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "creator_vault.name",
                "account": "CreatorVault"
              }
            ]
          }
        },
        {
          "name": "creator_vault",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [99, 114, 101, 97, 116, 111, 114, 95, 118, 97, 117, 108, 116]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "validator_vote",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stake_account",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false,
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "stake_program",
          "isMut": false,
          "isSigner": false,
          "address": "Stake11111111111111111111111111111111111111"
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false,
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false,
          "address": "SysvarC1ock11111111111111111111111111111111"
        },
        {
          "name": "stake_history",
          "isMut": false,
          "isSigner": false,
          "address": "SysvarStakeHistory1111111111111111111111111"
        },
        {
          "name": "stake_config",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawrewards",
      "discriminator": [51, 154, 39, 43, 155, 96, 250, 147],
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "creator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user_vault",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [117, 115, 101, 114, 95, 118, 97, 117, 108, 116]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "creator_vault.name",
                "account": "CreatorVault"
              }
            ]
          }
        },
        {
          "name": "creator_vault",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [99, 114, 101, 97, 116, 111, 114, 95, 118, 97, 117, 108, 116]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "reward_stake_account",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destination_account",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stake_authority",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [117, 115, 101, 114, 95, 118, 97, 117, 108, 116]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "creator_vault.name",
                "account": "CreatorVault"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false,
          "docs": ["System Program"],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "CreatorVault",
      "discriminator": [200, 135, 38, 98, 35, 236, 238, 12],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "total_subcribers",
            "type": "u64"
          },
          {
            "name": "balance",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "UserVault",
      "discriminator": [23, 76, 96, 159, 210, 10, 5, 22],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "balance",
            "type": "u64"
          },
          {
            "name": "staked_amount",
            "type": "u64"
          },
          {
            "name": "stake_account",
            "type": "publicKey"
          },
          {
            "name": "stake_account_count",
            "type": "u64"
          },
          {
            "name": "reward_stake_account",
            "type": "publicKey"
          },
          {
            "name": "stake_at",
            "type": "i64"
          },
          {
            "name": "accumulated_rewards",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NoRewardsAvailable",
      "msg": "No rewards available to withdraw."
    },
    {
      "code": 6001,
      "name": "CalculationError",
      "msg": "Calculation error."
    },
    {
      "code": 6002,
      "name": "InstructionError",
      "msg": "Instruction error."
    },
    {
      "code": 6003,
      "name": "InvalidStakeState",
      "msg": "Invalid stake state."
    },
    {
      "code": 6004,
      "name": "StakeAccountNotDeactivated",
      "msg": "Stake account not deactivated."
    }
  ]
};

export const idl = hero;