export type hero = {
    version: "0.1.0";
    name: "hero_anchor_program";
    instructions: [
      {
        name: "deposit";
        accounts: [
          {
            name: "user";
            isMut: true;
            isSigner: true;
          },
          {
            name: "creator";
            isMut: false;
            isSigner: false;
          },
          {
            name: "userVault";
            isMut: true;
            isSigner: false;
            pda: {
              seeds: [
                {
                  kind: "const";
                  type: "string";
                  value: "user_vault";
                },
                {
                  kind: "account";
                  type: "publicKey";
                  path: "user";
                },
                {
                  kind: "account";
                  type: "publicKey";
                  path: "creator";
                }
              ];
            };
          },
          {
            name: "systemProgram";
            isMut: false;
            isSigner: false;
          }
        ];
        args: [
          {
            name: "amount";
            type: "u64";
          }
        ];
      },
      {
        name: "initcreator";
        accounts: [
          {
            name: "creator";
            isMut: true;
            isSigner: true;
          },
          {
            name: "creatorVault";
            isMut: true;
            isSigner: false;
            pda: {
              seeds: [
                {
                  kind: "const";
                  type: "string";
                  value: "creator_vault";
                },
                {
                  kind: "account";
                  type: "publicKey";
                  path: "creator";
                }
              ];
            };
          },
          {
            name: "systemProgram";
            isMut: false;
            isSigner: false;
          }
        ];
        args: [];
      },
      {
        name: "inituser";
        accounts: [
          {
            name: "user";
            isMut: true;
            isSigner: true;
          },
          {
            name: "creator";
            isMut: false;
            isSigner: false;
          },
          {
            name: "userVault";
            isMut: true;
            isSigner: false;
            pda: {
              seeds: [
                {
                  kind: "const";
                  type: "string";
                  value: "user_vault";
                },
                {
                  kind: "account";
                  type: "publicKey";
                  path: "user";
                },
                {
                  kind: "account";
                  type: "publicKey";
                  path: "creator";
                }
              ];
            };
          },
          {
            name: "systemProgram";
            isMut: false;
            isSigner: false;
          }
        ];
        args: [
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "creator";
            type: "publicKey";
          }
        ];
      }
    ];
    accounts: [
      {
        name: "CreatorVault";
        type: {
          kind: "struct";
          fields: [
            {
              name: "creator";
              type: "publicKey";
            },
            {
              name: "balance";
              type: "u64";
            },
            {
              name: "bump";
              type: "u8";
            }
          ];
        };
      },
      {
        name: "UserVault";
        type: {
          kind: "struct";
          fields: [
            {
              name: "pda_owner";
              type: "publicKey";
            },
            {
              name: "creator";
              type: "publicKey";
            },
            {
              name: "balance";
              type: "u64";
            },
            {
              name: "staked_amount";
              type: "u64";
            },
            {
              name: "stake_account";
              type: "publicKey";
            },
            {
              name: "bump";
              type: "u8";
            }
          ];
        };
      }
    ];
    metadata: {
      address: "J3JVzqh9AVv1qcsquuUYmJggKEkKgifVxG48qiScC6jR";
    };
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
            isSigner: true
          },
          {
            name: "creator",
            isMut: false,
            isSigner: false
          },
          {
            name: "userVault",
            isMut: true,
            isSigner: false,
            pda: {
              seeds: [
                {
                  kind: "const",
                  type: "string",
                  value: "user_vault"
                },
                {
                  kind: "account",
                  type: "publicKey",
                  path: "user"
                },
                {
                  kind: "account",
                  type: "publicKey",
                  path: "creator"
                }
              ]
            }
          },
          {
            name: "systemProgram",
            isMut: false,
            isSigner: false
          }
        ],
        args: [
          {
            name: "amount",
            type: "u64"
          }
        ]
      },
      {
        name: "initcreator",
        accounts: [
          {
            name: "creator",
            isMut: true,
            isSigner: true
          },
          {
            name: "creatorVault",
            isMut: true,
            isSigner: false,
            pda: {
              seeds: [
                {
                  kind: "const",
                  type: "string",
                  value: "creator_vault"
                },
                {
                  kind: "account",
                  type: "publicKey",
                  path: "creator"
                }
              ]
            }
          },
          {
            name: "systemProgram",
            isMut: false,
            isSigner: false
          }
        ],
        args: []
      },
      {
        name: "inituser",
        accounts: [
          {
            name: "user",
            isMut: true,
            isSigner: true
          },
          {
            name: "creator",
            isMut: false,
            isSigner: false
          },
          {
            name: "userVault",
            isMut: true,
            isSigner: false,
            pda: {
              seeds: [
                {
                  kind: "const",
                  type: "string",
                  value: "user_vault"
                },
                {
                  kind: "account",
                  type: "publicKey",
                  path: "user"
                },
                {
                  kind: "account",
                  type: "publicKey",
                  path: "creator"
                }
              ]
            }
          },
          {
            name: "systemProgram",
            isMut: false,
            isSigner: false
          }
        ],
        args: [
          {
            name: "amount",
            type: "u64"
          },
          {
            name: "creator",
            type: "publicKey"
          }
        ]
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
              type: "publicKey"
            },
            {
              name: "balance",
              type: "u64"
            },
            {
              name: "bump",
              type: "u8"
            }
          ]
        }
      },
      {
        name: "UserVault",
        type: {
          kind: "struct",
          fields: [
            {
              name: "pda_owner",
              type: "publicKey"
            },
            {
              name: "creator",
              type: "publicKey"
            },
            {
              name: "balance",
              type: "u64"
            },
            {
              name: "staked_amount",
              type: "u64"
            },
            {
              name: "stake_account",
              type: "publicKey"
            },
            {
              name: "bump",
              type: "u8"
            }
          ]
        }
      }
    ],
    metadata: {
      address: "J3JVzqh9AVv1qcsquuUYmJggKEkKgifVxG48qiScC6jR"
    }
  };
  