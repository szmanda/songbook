const chordPattern = /^(\s|([A-H]|[a-h])(is)?[#b]?[0-9]*[mM]?(maj|min|dim|aug|sus)?[0-9]*\/?\+?)+$/; // Regex for chord patterns
const singleChordPattern = /([A-H]|[a-h])(is)?[#b]?[0-9]*[mM]?(maj|min|dim|aug|sus)?[0-9]*\/?\+?/g;
const separatorPattern = /\{(zwrotka|verse|refren|chorus|mostek|bridge|przedrefren|pre-chorus|zakończenie|outro|coda|wstęp|intro|solówka|solo|instrumental|interludium|interlude|przejście|transition|break|koda|finale|powtórzenie|refrain|solo|---)/i;
const integratedChordsPattern = /(\[(([A-H]|[a-h])(is)?[#b]?[0-9]*[mM]?(maj|min|dim|aug|sus)?[0-9]*\/?\+?)+\])/g;
const commentPattern = /^(\{)/;

function getLineType(line) {
    return chordPattern.test(line) ? 'chords'
        : separatorPattern.test(line) ? 'separator'
        : commentPattern.test(line) ? 'comment'
        : integratedChordsPattern.test(line) ? 'integrated-chords'
        : 'text';
}

// Function to parse song content into <p> with appropriate classes
function parseSong(outputSelector, song, linesPerPage = 37, charsPerLine = 20, append = true) {
    console.log(song);
    const title = song.title;
    const artist = song.artist;
    let lines = song.text.split('\n');
    const maxEmptyLinesAtPageBreak = 9;
    
    let parsedHTML = '<section class="content-page"><article>';
    count = 2; // lines per page
    const lastPage = document
        .getElementById(outputSelector)
        .querySelector('section:last-child');
    if (append && lastPage) {
        count = lastPage.querySelectorAll('p').length + 3;
        if (count + maxEmptyLinesAtPageBreak > linesPerPage) {
            return parseSong(outputSelector, song, linesPerPage, charsPerLine, false);
        }
        parsedHTML = lastPage.outerHTML.replace('</article></section>', '') + "<br>";
        lastPage.remove();
        lines.splice(0, 0, '---');
    }
    parsedHTML += `<h1>${title} <span class="artist">${artist ?? ''}</span></h1>`;
    i = -1;

    // convert to integrated chords
    prevType = '';
    linesIntegrated = [];
    for (let i = 0; i < lines.length; i++) {
        type = getLineType(lines[i]);
        if (type == 'text' && prevType == 'chords') {
            linesIntegrated.pop();
            chords = lines[i - 1];
            textSplit = [];
            chordsSplit = [];
            prevSplit = 0;
            while ((match = singleChordPattern.exec(chords)) !== null) {
                textSplit.push(lines[i].slice(prevSplit, match.index));
                chordsSplit.push(match[0]);
                prevSplit = match.index;
            }
            textSplit.push(lines[i].slice(prevSplit));
            integratedLine = textSplit[0];
            for (let j = 0; j < chordsSplit.length; j++) {
                integratedLine += `[${chordsSplit[j]}]${textSplit[j + 1]}`;
            }
            linesIntegrated.push(integratedLine);
        } else {
            linesIntegrated.push(lines[i])
        }
        prevType = type;
    }
    lines = linesIntegrated;

    lines.forEach(line => {
        i++;
        line = line.trimEnd();
        if (line === '' ) return;
        type = getLineType(line);
        
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
            // textLine = textLine.replace(/\s/g, '&nbsp;');
            let spaceIndexes = textLine.split('').flatMap((c, idx) => c.match(/\s/) ? [idx] : []); // That's some stupid code if I've ever seen one
            let i = 0;
            while (i < textLine.length) {
                cln = chordsLine.substr(i, charsPerLine);
                ln = textLine.substr(i, charsPerLine);
                if (textLine.length > i + charsPerLine && textLine[0] == 'S') console.log(`${textLine.length} > ${i} + ${charsPerLine} : ${textLine}`)
                if (textLine.length > i + charsPerLine) {
                    divideAt = spaceIndexes.findLast(idx => idx <= i + charsPerLine);
                    cln = chordsLine.substr(i, divideAt - i);
                    ln = textLine.substr(i, divideAt - i);
                }
                parsedHTML += `<p class="chords">${cln}</p>`;
                parsedHTML += `<p class="text">${ln}</p>`;

                i += ln.length + 1;
                count += 2;
            }
            return;
        }
        else for (let i = 0; i < line.length; i += charsPerLine) {
            ln = line.substr(i, charsPerLine);
            parsedHTML += `<p class="${type}">${ln}</p>`;
            count++;
        }
        
    });
    parsedHTML += '</article></section>';
    document.getElementById(outputSelector).innerHTML += parsedHTML;
}