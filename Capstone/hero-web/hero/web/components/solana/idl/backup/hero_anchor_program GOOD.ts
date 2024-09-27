export type hero ={
  "address": "DtCXMdVV52L1JJ2hu4RBaCqTudZf9jVxXgnt59bsjuTp",
  "metadata": {
    "name": "hero_anchor_program",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "calculateandsplitrewards",
      "discriminator": [
        92,
        7,
        100,
        45,
        86,
        201,
        26,
        83
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator"
        },
        {
          "name": "stake_account",
          "writable": true
        },
        {
          "name": "reward_stake_account",
          "writable": true
        },
        {
          "name": "user_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "docs": [
            "System and Stake Programs"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "stake_program"
        },
        {
          "name": "clock",
          "docs": [
            "Sysvars"
          ],
          "address": "SysvarC1ock11111111111111111111111111111111"
        },
        {
          "name": "stake_history",
          "address": "SysvarStakeHistory1111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "deposit",
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator"
        },
        {
          "name": "creator_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
      "name": "initadmin",
      "discriminator": [
        251,
        82,
        116,
        8,
        83,
        24,
        9,
        82
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "admin_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "admin"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initcreator",
      "discriminator": [
        99,
        182,
        247,
        43,
        35,
        90,
        13,
        159
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "validator",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "inituser",
      "discriminator": [
        174,
        160,
        28,
        28,
        126,
        89,
        81,
        236
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator"
        },
        {
          "name": "creator_vault",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "creator",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "stakesol",
      "discriminator": [
        182,
        45,
        21,
        254,
        188,
        82,
        158,
        209
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator"
        },
        {
          "name": "user_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "validator_vote"
        },
        {
          "name": "stake_account",
          "writable": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "stake_program",
          "address": "Stake11111111111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        },
        {
          "name": "stake_history",
          "address": "SysvarStakeHistory1111111111111111111111111"
        },
        {
          "name": "stake_config"
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
      "name": "unstakesol",
      "discriminator": [
        243,
        130,
        75,
        243,
        231,
        120,
        95,
        54
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true,
          "relations": [
            "user_vault"
          ]
        },
        {
          "name": "creator"
        },
        {
          "name": "user_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "stake_account",
          "writable": true
        },
        {
          "name": "stake_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "name": "clock",
          "docs": [
            "System Program"
          ],
          "address": "SysvarC1ock11111111111111111111111111111111"
        },
        {
          "name": "stake_history",
          "address": "SysvarStakeHistory1111111111111111111111111"
        },
        {
          "name": "stake_program",
          "address": "Stake11111111111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "updatevalidator",
      "discriminator": [
        137,
        117,
        39,
        141,
        137,
        176,
        195,
        168
      ],
      "accounts": [
        {
          "name": "creator_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "creator",
          "signer": true,
          "relations": [
            "creator_vault"
          ]
        }
      ],
      "args": [
        {
          "name": "new_validator",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "withdrawrewards",
      "discriminator": [
        51,
        154,
        39,
        43,
        155,
        96,
        250,
        147
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator"
        },
        {
          "name": "user_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "writable": true
        },
        {
          "name": "stake_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "docs": [
            "System Program"
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "withdrawunstakedsol",
      "discriminator": [
        136,
        191,
        107,
        244,
        140,
        190,
        124,
        112
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true,
          "relations": [
            "user_vault"
          ]
        },
        {
          "name": "creator"
        },
        {
          "name": "user_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "stake_account",
          "writable": true
        },
        {
          "name": "stake_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "docs": [
            "System Program"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "stake_program",
          "address": "Stake11111111111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "AdminVault",
      "discriminator": [
        77,
        57,
        76,
        180,
        43,
        202,
        140,
        228
      ]
    },
    {
      "name": "CreatorVault",
      "discriminator": [
        200,
        135,
        38,
        98,
        35,
        236,
        238,
        12
      ]
    },
    {
      "name": "UserVault",
      "discriminator": [
        23,
        76,
        96,
        159,
        210,
        10,
        5,
        22
      ]
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
    },
    {
      "code": 6005,
      "name": "UnclaimedRewards",
      "msg": "Unclaimed rewards."
    },
    {
      "code": 6006,
      "name": "NoFundsToWithdraw",
      "msg": "No funds to withdraw."
    },
    {
      "code": 6007,
      "name": "StakeAccountNotInitialized",
      "msg": "Stake account not initialized."
    },
    {
      "code": 6008,
      "name": "StakeAccountActivating",
      "msg": "Stake account activating."
    }
  ],
  "types": [
    {
      "name": "AdminVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
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
      "name": "CreatorVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "validator",
            "type": "pubkey"
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
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
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
            "type": "pubkey"
          },
          {
            "name": "stake_account_count",
            "type": "u64"
          },
          {
            "name": "reward_stake_account",
            "type": "pubkey"
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
          },
          {
            "name": "unstake_request_epoch",
            "type": "u64"
          }
        ]
      }
    }
  ]
}





export const IDL: hero = {
  "address": "DtCXMdVV52L1JJ2hu4RBaCqTudZf9jVxXgnt59bsjuTp",
  "metadata": {
    "name": "hero_anchor_program",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "calculateandsplitrewards",
      "discriminator": [
        92,
        7,
        100,
        45,
        86,
        201,
        26,
        83
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator"
        },
        {
          "name": "stake_account",
          "writable": true
        },
        {
          "name": "reward_stake_account",
          "writable": true
        },
        {
          "name": "user_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "docs": [
            "System and Stake Programs"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "stake_program"
        },
        {
          "name": "clock",
          "docs": [
            "Sysvars"
          ],
          "address": "SysvarC1ock11111111111111111111111111111111"
        },
        {
          "name": "stake_history",
          "address": "SysvarStakeHistory1111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "deposit",
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator"
        },
        {
          "name": "creator_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
      "name": "initadmin",
      "discriminator": [
        251,
        82,
        116,
        8,
        83,
        24,
        9,
        82
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "admin_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "admin"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initcreator",
      "discriminator": [
        99,
        182,
        247,
        43,
        35,
        90,
        13,
        159
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "validator",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "inituser",
      "discriminator": [
        174,
        160,
        28,
        28,
        126,
        89,
        81,
        236
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator"
        },
        {
          "name": "creator_vault",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "creator",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "stakesol",
      "discriminator": [
        182,
        45,
        21,
        254,
        188,
        82,
        158,
        209
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator"
        },
        {
          "name": "user_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "validator_vote"
        },
        {
          "name": "stake_account",
          "writable": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "stake_program",
          "address": "Stake11111111111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        },
        {
          "name": "stake_history",
          "address": "SysvarStakeHistory1111111111111111111111111"
        },
        {
          "name": "stake_config"
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
      "name": "unstakesol",
      "discriminator": [
        243,
        130,
        75,
        243,
        231,
        120,
        95,
        54
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true,
          "relations": [
            "user_vault"
          ]
        },
        {
          "name": "creator"
        },
        {
          "name": "user_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "stake_account",
          "writable": true
        },
        {
          "name": "stake_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "name": "clock",
          "docs": [
            "System Program"
          ],
          "address": "SysvarC1ock11111111111111111111111111111111"
        },
        {
          "name": "stake_history",
          "address": "SysvarStakeHistory1111111111111111111111111"
        },
        {
          "name": "stake_program",
          "address": "Stake11111111111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "updatevalidator",
      "discriminator": [
        137,
        117,
        39,
        141,
        137,
        176,
        195,
        168
      ],
      "accounts": [
        {
          "name": "creator_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "creator",
          "signer": true,
          "relations": [
            "creator_vault"
          ]
        }
      ],
      "args": [
        {
          "name": "new_validator",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "withdrawrewards",
      "discriminator": [
        51,
        154,
        39,
        43,
        155,
        96,
        250,
        147
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator"
        },
        {
          "name": "user_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "writable": true
        },
        {
          "name": "stake_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "docs": [
            "System Program"
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "withdrawunstakedsol",
      "discriminator": [
        136,
        191,
        107,
        244,
        140,
        190,
        124,
        112
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true,
          "relations": [
            "user_vault"
          ]
        },
        {
          "name": "creator"
        },
        {
          "name": "user_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "stake_account",
          "writable": true
        },
        {
          "name": "stake_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
          "docs": [
            "System Program"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "stake_program",
          "address": "Stake11111111111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "AdminVault",
      "discriminator": [
        77,
        57,
        76,
        180,
        43,
        202,
        140,
        228
      ]
    },
    {
      "name": "CreatorVault",
      "discriminator": [
        200,
        135,
        38,
        98,
        35,
        236,
        238,
        12
      ]
    },
    {
      "name": "UserVault",
      "discriminator": [
        23,
        76,
        96,
        159,
        210,
        10,
        5,
        22
      ]
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
    },
    {
      "code": 6005,
      "name": "UnclaimedRewards",
      "msg": "Unclaimed rewards."
    },
    {
      "code": 6006,
      "name": "NoFundsToWithdraw",
      "msg": "No funds to withdraw."
    },
    {
      "code": 6007,
      "name": "StakeAccountNotInitialized",
      "msg": "Stake account not initialized."
    },
    {
      "code": 6008,
      "name": "StakeAccountActivating",
      "msg": "Stake account activating."
    }
  ],
  "types": [
    {
      "name": "AdminVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
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
      "name": "CreatorVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "validator",
            "type": "pubkey"
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
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
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
            "type": "pubkey"
          },
          {
            "name": "stake_account_count",
            "type": "u64"
          },
          {
            "name": "reward_stake_account",
            "type": "pubkey"
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
          },
          {
            "name": "unstake_request_epoch",
            "type": "u64"
          }
        ]
      }
    }
  ]
}