import bs58 from 'bs58';
import promptSync from 'prompt-sync';

const prompt = promptSync();

function base58ToWallet() {
    const base58Key = prompt('Enter your base58 private key: ');
    try {
        const wallet = bs58.decode(base58Key);
        console.log('Wallet byte array:', Array.from(wallet));
    } catch (error) {
        console.error('Invalid base58 input:', error);
    }
}

function walletToBase58() {
    const walletInput = prompt('Enter your wallet byte array (comma-separated): ');
    try {
        const walletArray = walletInput.split(',').map(Number);
        const walletUint8Array = new Uint8Array(walletArray);
        const base58Key = bs58.encode(walletUint8Array);
        console.log('Base58 encoded key:', base58Key);
    } catch (error) {
        console.error('Invalid wallet byte array input:', error);
    }
}

console.log('Choose an option:');
console.log('1. Convert base58 to wallet byte array');
console.log('2. Convert wallet byte array to base58');
const choice = prompt('Enter your choice (1 or 2): ');

if (choice === '1') {
    base58ToWallet();
} else if (choice === '2') {
    walletToBase58();
} else {
    console.log('Invalid choice');
}
