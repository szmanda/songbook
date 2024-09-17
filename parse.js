// Function to parse song content into <p> with appropriate classes
function parseSong(outputSelector, song, linesPerPage = 37, append = true) {
    console.log(song);
    const title = song.title;
    const artist = song.artist;
    const lines = song.text.split('\n');
    const maxEmptyLinesAtPageBreak = 9;
    const chordPattern = /^(\s|([A-H]|[a-h])(is)?[#b]?[0-9]*[mM]?(maj|min|dim|aug|sus)?[0-9]*\/?\+?)+$/; // Regex for chord patterns
    const separatorPattern = /\{(zwrotka|verse|refren|chorus|mostek|bridge|przedrefren|pre-chorus|zakończenie|outro|coda|wstęp|intro|solówka|solo|instrumental|interludium|interlude|przejście|transition|break|koda|finale|powtórzenie|refrain|solo|---)/i;
    const integratedChordsPattern = /(\[(([A-H]|[a-h])(is)?[#b]?[0-9]*[mM]?(maj|min|dim|aug|sus)?[0-9]*\/?\+?)+\])/g;

    const commentPattern = /^(\{)/;
    let parsedHTML = '<section class="content-page"><article>';
    count = 2; // lines per page
    const lastPage = document
        .getElementById(outputSelector)
        .querySelector('section:last-child');
    if (append && lastPage) {
        count = lastPage.querySelectorAll('p').length + 3;
        if (count + maxEmptyLinesAtPageBreak > linesPerPage) {
            return parseSong(outputSelector, song, linesPerPage, false);
        }
        parsedHTML = lastPage.outerHTML.replace('</article></section>', '') + "<br>";
        lastPage.remove();
        lines.splice(0, 0, '---');
    }
    parsedHTML += `<h1>${title} <span class="artist">${artist ?? ''}</span></h1>`;
    i = -1;
    lines.forEach(line => {
        i++;
        line = line.trimEnd();
        if (line === '' ) return;
        type = chordPattern.test(line) ? 'chords'
            : separatorPattern.test(line) ? 'separator'
            : commentPattern.test(line) ? 'comment'
            : integratedChordsPattern.test(line) ? 'integrated-chords'
            : 'text';
        
        let linesToNextSeparator = 0;
        if (type === 'separator') {    
            while (linesToNextSeparator + i < lines.length
                && !separatorPattern.test(lines[i + 1 + linesToNextSeparator])
            ) {
                linesToNextSeparator++;
                if (integratedChordsPattern.test(lines[i + 1 + linesToNextSeparator])) {
                    linesToNextSeparator++;
                }
            }
            // console.log('linesToNextSeparator', linesToNextSeparator);
            space = linesPerPage - count;
            if ((space < maxEmptyLinesAtPageBreak)
                && (space < linesToNextSeparator)) {
                count = 1000; // pagebreak
            }
        }
        
        if (count > linesPerPage - 1 * (type === 'chords')) {
            // console.log('pagebreak');
            parsedHTML += '</article></section><section class="content-page"><article>';
            count = 0;
        }
        if (line === '---') return;
        if (type === 'integrated-chords') {
            let chordsLine = '';
            line.match(integratedChordsPattern).forEach(chord => {
                idx = line.search('\\'+chord);
                // console.log(line, chord, idx, line.search(chord));
                line = line.replace(chord, '');
                for (let i = chordsLine.length; i < idx; i++) chordsLine += ' ';
                chordsLine += chord.replace(/\[|\]/g, '')
            });
            textLine = line.replace(integratedChordsPattern, '');
            textLine = textLine.replace(/\s/g, '&nbsp;');
            console.log('|'+chordsLine+"|", "|"+textLine+"|");
            parsedHTML += `<p class="chords">${chordsLine}</p>`;
            parsedHTML += `<p class="text">${textLine}</p>`;
            count += 2;
            return;
        }
        parsedHTML += `<p class="${type}">${line}</p>`;
        count++;
        
    });
    parsedHTML += '</article></section>';
    document.getElementById(outputSelector).innerHTML += parsedHTML;
}