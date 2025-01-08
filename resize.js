function setSectionGrid(sheetSelector, sectionsPerRow, sectionsPerColumn, width = 210, height = 297, pagePadding = 5) {
    const sheets = document.querySelectorAll(sheetSelector).forEach(sheet => {
        sheet.style.gridTemplateColumns = `repeat(${sectionsPerRow}, 1fr)`;
        sheet.style.gridTemplateRows = `repeat(${sectionsPerColumn}, 1fr)`;
        sheet.style.width = `${width}mm`;
        sheet.style.height = `${height}mm`;
        sheet.style.padding = `${pagePadding}mm`;
        sheet.querySelectorAll('section').forEach(section => {
            section.style.maxHeight = `${height/sectionsPerColumn}mm`;
        });
    });
}