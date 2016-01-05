## FS20 address mapping

According to the mauals of ELV, direct entering of FS20 addresses is done using only numbers 1 to 4 which results in a numeral system with 4 symbold (base 4).
Normally such a system would use numbers 0..3 but ELV decided to use 1..4 instead.

The culfw will report received addresses in hexadecimal values, but programming with the remote control requires entering the base4 addresses.

1x quad | 2x quad | 3x quad | 4x quad
------- | ------- | ------- | -------
11 = 0x0 | 12 = 0x1 | 13 = 0x2 | 14 = 0x3
21 = 0x4 | 22 = 0x5 | 23 = 0x6 | 24 = 0x7
31 = 0x8 | 32 = 0x9 | 33 = 0xA | 34 = 0xB
41 = 0xC | 42 = 0xD | 43 = 0xE | 44 = 0xF

E.g.
hex | ELV
--- | ---
F51D | 4422 1242
B0 | 3411
00 | 1111
11 | 1212

## examples from the source code of module 'cul'
```javascript
cul.cmd('FS20', '2341 2131', '1112', 'on'); // house code in ELV-Notation, address in ELV-Notation, command as text
cul.cmd('FS20', '6C48', '01', '11');        // house code as hex string, address as hex string, command as hex string