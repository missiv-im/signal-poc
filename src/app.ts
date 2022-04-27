import {
	DeviceType,
	KeyHelper,
	PreKeyType,
	SessionBuilder,
	SessionCipher,
	SignalProtocolAddress,
	SignedPublicPreKeyType
} from "@privacyresearch/libsignal-protocol-typescript";
import { TextDecoder, TextEncoder } from "util";
import { SignalProtocolStore } from "./signal/signal-store";

// to be called on client installation/registration
const createID = async (name: string, store: SignalProtocolStore) => {
	const registrationId = KeyHelper.generateRegistrationId();
	// store somewhere durable and safe "registrationId" => registrationId
	store.put("registrationId", registrationId);

	const identityKeyPair = await KeyHelper.generateIdentityKeyPair();
	// store somewhere "identityKey" => identityKeyPair
	store.put("identityKey", identityKeyPair);

	const signedPreKeyId = Math.floor(10000 * Math.random());
	const signedPreKey = await KeyHelper.generateSignedPreKey(identityKeyPair, signedPreKeyId);
	store.storeSignedPreKey(signedPreKeyId, signedPreKey.keyPair);

	const publicSignedPreKey: SignedPublicPreKeyType = {
		keyId: signedPreKeyId,
		publicKey: signedPreKey.keyPair.pubKey,
		signature: signedPreKey.signature
	};

	// generating one time use prekey and signed prekey
	const baseKeyId = Math.floor(10000 * Math.random());
	const preKey = await KeyHelper.generatePreKey(baseKeyId);
	store.storePreKey(baseKeyId, preKey.keyPair);

	const publicPreKey: PreKeyType = {
		keyId: preKey.keyId,
		publicKey: preKey.keyPair.pubKey
	};

	// Now we register this with the server so all users can see them
	// this is the object sent to the server
	return {
		registrationId,
		signedPreKey: publicSignedPreKey,
		preKey: publicPreKey,
		identityKey: identityKeyPair.pubKey
	} as DeviceType;
};

const testSignal = async () => {
	let addressStore = new Map<string, SignalProtocolAddress>();
	let aliceStore = new SignalProtocolStore();
	let bobStore = new SignalProtocolStore();

	/* ----------------------------------- */

	// Creating IDs
	console.log("[+] Creating IDs");
	const aliceAddress = new SignalProtocolAddress("alice", 1);
	addressStore.set("alice", aliceAddress);
	const aliceKeyBundle = await createID("alice", aliceStore);

	const bobAddress = new SignalProtocolAddress("bob", 1);
	addressStore.set("bob", bobAddress);
	const bobKeyBundle = await createID("bob", bobStore);

	/* ----------------------------------- */

	// creating a session : Alice -> Bob
	console.log("[+] Creating a session Alice --> Bob");
	const aliceSessionBuilder = new SessionBuilder(aliceStore, bobAddress);
	// Process a prekey fetched from the server. Returns a promise that resolves
	// once a session is created and saved in the store, or rejects if the
	// identityKey differs from a previously seen identity for this address.
	console.log("[+] Processing bob's key bundle");
	await aliceSessionBuilder.processPreKey(bobKeyBundle!);

	console.log("[+] Creating session cipher");
	const aliceSessionCipher = new SessionCipher(aliceStore, bobAddress);
	const cipherText = await aliceSessionCipher.encrypt(new TextEncoder().encode("Hello bob!").buffer);

	console.log("=> Encrypted message: ", cipherText);

	/* ----------------------------------- */

	console.log("[+] Creating a session Bob --> Alice");
	const bobSessionBuilder = new SessionBuilder(bobStore, aliceAddress);
	console.log("[+] Processing alice's key bundle");
	await bobSessionBuilder.processPreKey(aliceKeyBundle);

	console.log("[+] Creating session cipher");
	const bobSessionCipher = new SessionCipher(bobStore, aliceAddress);
	const plainTextBuffer = await bobSessionCipher.decryptPreKeyWhisperMessage(cipherText.body!);
	const plainText = new TextDecoder().decode(plainTextBuffer);

	console.log("=> Decrypted message: ", plainText);
};

testSignal();
