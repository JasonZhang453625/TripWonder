# Ma Shan Zheng result titles

`ma-shan-zheng-result.woff2` is a locally hosted WOFF2 subset of **Ma Shan Zheng Regular**, designed by Ma ShanZheng. It is used for the handwritten destination greeting on the TripWonder result page.

- Official font: https://fonts.google.com/specimen/Ma+Shan+Zheng
- Upstream project: https://github.com/googlefonts/mashanzheng
- Source font: https://raw.githubusercontent.com/google/fonts/main/ofl/mashanzheng/MaShanZheng-Regular.ttf
- Official metadata: https://raw.githubusercontent.com/google/fonts/main/ofl/mashanzheng/METADATA.pb
- License: SIL Open Font License 1.1; see `MaShanZheng-OFL.txt` in this directory.

The subset retains `你好，深圳。大同苏州桂林香港北京上海张家界！、` and printable ASCII (U+0020–U+007E), covering the greetings for all eight current destinations.

`ma-shan-zheng-full.woff2` retains the full upstream font (7,015 Unicode mappings), including the UGC place names `沙坡尾避风坞`, `十八梯` and `东郊记忆`. It is the second font in the result greeting's font-family list. Browsers load it only when a greeting contains characters missing from the small subset; the existing official city greetings continue using the 19 KB subset alone. English greetings keep their separate serif styling.

New UGC names do not require rebuilding a place-name-specific subset. Characters outside the upstream font's coverage still use the CSS fallback. Other Chinese interface text keeps the normal interface font.

Generated with fontTools 4.66.0 from the official Google Fonts TTF. Copyright and license metadata are retained in the WOFF2. No runtime request to an external font service is needed.

The full font was converted on 2026-10-17 using fontTools 4.67.0, without removing glyphs. The upstream license matches the bundled `MaShanZheng-OFL.txt` byte for byte. To reproduce the full font from the source TTF:

```python
from fontTools.ttLib import TTFont
font = TTFont('MaShanZheng-Regular.ttf', recalcTimestamp=False)
font.flavor = 'woff2'
font.save('ma-shan-zheng-full.woff2')
```

Requires fontTools with WOFF support (`fonttools[woff]`). Bump the font URL and `result-reveal.css` URL whenever replacing a font.

- Source TTF SHA-256: `6d2546bb189c732a8ca29af9e22457b152387d158aa459e4ac2ce1e51788b7fb`
- Full WOFF2 SHA-256: `31563e1b1d107037b3ba46890fd4af7d0bb06d12dc87ab87a53c9757f7cb024a`
- Full WOFF2 size: 3,250,464 bytes.
