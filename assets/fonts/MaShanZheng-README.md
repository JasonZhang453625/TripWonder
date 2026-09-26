# Ma Shan Zheng result title subset

`ma-shan-zheng-result.woff2` is a locally hosted WOFF2 subset of **Ma Shan Zheng Regular**, designed by Ma ShanZheng. It is used for the handwritten destination greeting on the TripWonder result page.

- Official font: https://fonts.google.com/specimen/Ma+Shan+Zheng
- Upstream project: https://github.com/googlefonts/mashanzheng
- Source font: https://raw.githubusercontent.com/google/fonts/main/ofl/mashanzheng/MaShanZheng-Regular.ttf
- Official metadata: https://raw.githubusercontent.com/google/fonts/main/ofl/mashanzheng/METADATA.pb
- License: SIL Open Font License 1.1; see `MaShanZheng-OFL.txt` in this directory.

The subset retains `你好，深圳。大同苏州桂林香港北京上海张家界！、` and printable ASCII (U+0020–U+007E), covering the greetings for all eight current destinations. Other Chinese text should use the normal interface font.

When adding a destination, regenerate the subset from the source TTF with every city name in `catalog.js`, retaining the existing characters. Check the output font's Unicode cmap for all title characters, then bump the font URL and stylesheet versions so browsers reload it. Setting the CSS font family alone does not prevent a missing character from falling back to the system font.

Generated with fontTools 4.66.0 from the official Google Fonts TTF. Copyright and license metadata are retained in the WOFF2. No runtime request to an external font service is needed.
