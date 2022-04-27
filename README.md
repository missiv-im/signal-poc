# signal-poc

Proof of concept of communication encrypted with the signal protocol

## Usage

```bash
yarn
yarn start
```

Example output:

```js
[+] Creating IDs
[+] Creating a session Alice --> Bob
[+] Processing bob's key bundle
[+] Creating session cipher
=> Encrypted message:  {
  type: 3,
  body: '3(ÓY\b\x92\x040¡\x04\x12!\x05<³R¦$\x96nØª©¡W\x18Zõ\x11\x89F\x05èc¦V¯\x86.L£Ü\x06út\x1A!\x05\x05Å\t(T§µ\x0BGü;²\x95%.\x04;hw\x93þQ)-y\x8Câ\x8D\x8C§\x8C|"B3\n' +
    '!\x05*eç\x96ÈÞ\x8Dd/\x02þ­ÄF\x06¸Ä\x88t%\x85=ýÜaâ\x83Îäxëd\x10\x00\x18\x00"\x10î X\x01ý\x1A|õ£\tC\x11ØÃ\x07UÃû¬Åñy\x8B\x1B',
  registrationId: 8295
}
[+] Creating a session Bob --> Alice
[+] Processing alice's key bundle
[+] Creating session cipher
=> Decrypted message:  Hello bob!
```
