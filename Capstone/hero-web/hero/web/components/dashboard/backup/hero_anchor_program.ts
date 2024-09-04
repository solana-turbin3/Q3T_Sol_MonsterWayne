export type hero ={
    version: "0.1.0",
  name: "hero_anchor_program",
  instructions: [
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
    }
  ],
  metadata: {
    address: "J3JVzqh9AVv1qcsquuUYmJggKEkKgifVxG48qiScC6jR"
  }
}

export const idl = {
  version: "0.1.0",
  name: "hero_anchor_program",
  instructions: [
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
    }
  ],
  metadata: {
    address: "J3JVzqh9AVv1qcsquuUYmJggKEkKgifVxG48qiScC6jR"
  }
};