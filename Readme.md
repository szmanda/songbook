# A printable song-booklet
Guitar songbook, perfect for campfires, designed to be simple and flexible for printing in a small booklet form.

## Parameters for printing
Tweaking just a couple of parameters you can make this songbook fit your pockets!

Parameters can be set after opening `index.html` in a browser. You can set the page size, number of sub-pages per single page and their order both on the front and the back sides, as well as a couple more parameters.

## Adding songs to your songbook
Adding your own songs is simple as well, Add a file `songs/YourSong.js`, and then just load it in `index.html`. Song file should follow this format:

```js
globalThis.songs["YourSong"] = {
    "title": "Your Song Title",
    "artist": "Artist's Name",
    "text": `
[Am]Words and [C]chords of [G7]your song
Am        C    G7         C
which can also be written above the text
`,
};
```

You can also use the other notation replacing `Am` with `a`.

To separate the song into parts use separators like:
- `---` (an invisible separator)
- `{Verse}`, `{Chorus}`, `{Pre-chorus}`, `{Bridge}`, etc.


---

> Note: This is just a simple project, done in a single afternoon, after an inspiration struck. Built with no dependencies, using just plain Javascript. Code should be simple enough to easily modify.