// Function to reformat sheets into the desired order
function reformatToPages(selector, subpageCount, orderFront, orderBack) {
    const source = document.getElementById('source-content');
    const sheetOuter = document.getElementById('sheet-outer');
    const allPages = source.querySelectorAll(selector);
    const availablePages = Array.from(allPages).map((page, index) => index);
    let emptyPages = allPages.length % (subpageCount * 2);
    emptyPages = (emptyPages === 0) ? 0 : (subpageCount * 2) - emptyPages;
    console.log(`There are ${allPages.length} pages, ${emptyPages} empty pages needed`);
    for (let i = 0; i < emptyPages; i++) {
        availablePages.push(100000); // Add empty pages to fill the last sheet
    }

    // Helper to resolve negative indices (-1 means the last sheet, etc.)
    const resolveIndex = (index) => {
        const length = availablePages.length;
        if (index > length) {
            return 10000}; // return an out-of-bounds index
        if (index < 0) return availablePages[length + index]; // Convert to positive index
        return availablePages[index - 1]; // Convert to 0-based index
    };

    const createEmptyPage = () => {
        const emptyPage = document.createElement('section');
        emptyPage.className = 'page';
        emptyPage.innerHTML = '<article></article>';
        return emptyPage;
    };

    const loadPagesInOrder = (order) => {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < order.length; i++) {
            console.log('resolving', order[i], 'to index', resolveIndex(order[i]));
            const idx = resolveIndex(order[i]);
            if (idx >= 0 && idx < allPages.length) {
                const pageClone = allPages[idx].cloneNode(true);
                appendPageNumber(pageClone, idx + 1);
                fragment.appendChild(pageClone);
            } else {
                // Append empty page if the index is out of bounds
                fragment.appendChild(createEmptyPage());
            }
        }
        return fragment;
    };

    const appendPageNumber = (page, number) => {
        const pageNumber = document.createElement('div');
        pageNumber.className = 'page-number';
        pageNumber.innerHTML = number;
        page.appendChild(pageNumber);
    }

    // Clear the current page display
    sheetOuter.innerHTML = '';

    // Process pages per sheet, apply front and back order
    const numberOfPages = allPages.length + 0;
    const pagesNeeded = Math.ceil(numberOfPages / subpageCount);
    const sheetNode = document.createElement('div'); sheetNode.className = 'sheet';

    for (let page = 0; page < pagesNeeded; page += 2) {
        const frontSubpages = loadPagesInOrder(orderFront);
        sheetOuter.appendChild(sheetNode.cloneNode(true)).appendChild(frontSubpages);
        console.log('available', availablePages);
        // Stupid JS, can't do min(array) directly
        console.warn(orderBack.map(i => resolveIndex(i)), availablePages);
        if (!(orderBack.map(i => resolveIndex(i)).sort((a, b) => a - b)[0] in availablePages)) {
            console.log('did break');
            break;
        } else {
            console.log('did not break');
        }
        const backSubpages = loadPagesInOrder(orderBack);
        sheetOuter.appendChild(sheetNode.cloneNode(true)).appendChild(backSubpages);

        const renderedSubpages = orderFront.concat(orderBack).map(i => resolveIndex(i));
        renderedSubpages.sort((a, b) => b - a);
        console.log('remove', renderedSubpages);
        for (let i = 0; i < renderedSubpages.length; i++) {
            availablePages.find((element, index) => {
                if (element === renderedSubpages[i]) {
                    availablePages.splice(index, 1);
                    return true;
                }
            });
        }
    }
}