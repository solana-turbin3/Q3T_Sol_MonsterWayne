export const hero = {
  version: "0.1.0",
  name: "hero_anchor_program",
  instructions: [
    {
      name: "deposit",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "creator",
          isMut: false,
          isSigner: false,
        },
        {
          name: "creatorVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        }
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "initcreator",
      accounts: [
        {
          name: "creator",
          isMut: true,
          isSigner: true,
        },
        {
          name: "creatorVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        }
      ],
      args: [
        {
          name: "name",
          type: "string",
        },
      ],
    },
    {
      name: "inituser",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "creator",
          isMut: false,
          isSigner: false,
        },
        {
          name: "creatorVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        }
      ],
      args: [
        {
          name: "creator",
          type: "publicKey",
        },
      ],
    },
    {
      name: "stakesol",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "creator",
          isMut: false,
          isSigner: false,
        },
        {
          name: "userVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "creatorVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "validatorVote",
          isMut: false,
          isSigner: false,
        },
        {
          name: "stakeAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "stakeProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
        {
          name: "stakeHistory",
          isMut: false,
          isSigner: false,
        },
        {
          name: "stakeConfig",
          isMut: false,
          isSigner: false,
        }
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "unstakesol",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "creator",
          isMut: false,
          isSigner: false,
        },
        {
          name: "userVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "creatorVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "stakeAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "stakeProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        }
      ],
      args: [],
    },
    {
      name: "withdrawUnstakedSol",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "creator",
          isMut: false,
          isSigner: false,
        },
        {
          name: "userVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "creatorVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "stakeAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "stakeProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        }
      ],
      args: [],
    },
    {
      name: "withdrawAndCloseCreatorVault",
      accounts: [
        {
          name: "creator",
          isMut: true,
          isSigner: true,
        },
        {
          name: "creatorVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        }
      ],
      args: [],
    },
    {
      name: "withdrawAndCloseUserVault",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "creator",
          isMut: true,
          isSigner: false,
        },
        {
          name: "creatorVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        }
      ],
      args: [],
    }
  ],
  accounts: [
    {
      name: "CreatorVault",
      type: {
        kind: "struct",
        fields: [
          {
            name: "creator",
            type: "publicKey",
          },
          {
            name: "name",
            type: "string",
          },
          {
            name: "totalSubscribers",
            type: "u64",
          },
          {
            name: "balance",
            type: "u64",
          },
          {
            name: "bump",
            type: "u8",
          }
        ],
      },
    },
    {
      name: "UserVault",
      type: {
        kind: "struct",
        fields: [
          {
            name: "pdaOwner",
            type: "publicKey",
          },
          {
            name: "creator",
            type: "publicKey",
          },
          {
            name: "balance",
            type: "u64",
          },
          {
            name: "stakedAmount",
            type: "u64",
          },
          {
            name: "stakeAccount",
            type: "publicKey",
          },
          {
            name: "rewardAmount",
            type: "u64",
          },
          {
            name: "lastEpochTime",
            type: "i64",
          },
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "isStakeActive",
            type: "bool",
          },
          {
            name: "lastRewardClaimTime",
            type: "i64",
          }
        ],
      },
    }
  ],
  metadata: {
    address: "6DpKqeB8ehecwyhZxoUKqizxpWcM1fBvWCr8y6dkhnWL",
  }
};

export const idl = {
  version: "0.1.0",
  name: "hero_anchor_program",
  instructions: [
    {
      name: "deposit",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "creator",
          isMut: false,
          isSigner: false,
        },
        {
          name: "creatorVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        }
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "initcreator",
      accounts: [
        {
          name: "creator",
          isMut: true,
          isSigner: true,
        },
        {
          name: "creatorVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        }
      ],
      args: [
        {
          name: "name",
          type: "string",
        },
      ],
    },
    {
      name: "inituser",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "creator",
          isMut: false,
          isSigner: false,
        },
        {
          name: "creatorVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        }
      ],
      args: [
        {
          name: "creator",
          type: "publicKey",
        },
      ],
    },
    {
      name: "stakesol",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "creator",
          isMut: false,
          isSigner: false,
        },
        {
          name: "userVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "creatorVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "validatorVote",
          isMut: false,
          isSigner: false,
        },
        {
          name: "stakeAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "stakeProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
        {
          name: "stakeHistory",
          isMut: false,
          isSigner: false,
        },
        {
          name: "stakeConfig",
          isMut: false,
          isSigner: false,
        }
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "unstakesol",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "creator",
          isMut: false,
          isSigner: false,
        },
        {
          name: "userVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "creatorVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "stakeAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "stakeProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        }
      ],
      args: [],
    },
    {
      name: "withdrawUnstakedSol",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "creator",
          isMut: false,
          isSigner: false,
        },
        {
          name: "userVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "creatorVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "stakeAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "stakeProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        }
      ],
      args: [],
    },
    {
      name: "withdrawAndCloseCreatorVault",
      accounts: [
        {
          name: "creator",
          isMut: true,
          isSigner: true,
        },
        {
          name: "creatorVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        }
      ],
      args: [],
    },
    {
      name: "withdrawAndCloseUserVault",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "creator",
          isMut: true,
          isSigner: false,
        },
        {
          name: "creatorVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        }
      ],
      args: [],
    }
  ],
  accounts: [
    {
      name: "CreatorVault",
      type: {
        kind: "struct",
        fields: [
          {
            name: "creator",
            type: "publicKey",
          },
          {
            name: "name",
            type: "string",
          },
          {
            name: "totalSubscribers",
            type: "u64",
          },
          {
            name: "balance",
            type: "u64",
          },
          {
            name: "bump",
            type: "u8",
          }
        ],
      },
    },
    {
      name: "UserVault",
      type: {
        kind: "struct",
        fields: [
          {
            name: "pdaOwner",
            type: "publicKey",
          },
          {
            name: "creator",
            type: "publicKey",
          },
          {
            name: "balance",
            type: "u64",
          },
          {
            name: "stakedAmount",
            type: "u64",
          },
          {
            name: "stakeAccount",
            type: "publicKey",
          },
          {
            name: "rewardAmount",
            type: "u64",
          },
          {
            name: "lastEpochTime",
            type: "i64",
          },
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "isStakeActive",
            type: "bool",
          },
          {
            name: "lastRewardClaimTime",
            type: "i64",
          }
        ],
      },
    }
  ],
  metadata: {
    address: "6DpKqeB8ehecwyhZxoUKqizxpWcM1fBvWCr8y6dkhnWL",
  }
};





