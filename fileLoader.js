let gk_isXlsx = false;
let gk_xlsxFileLookup = {};
let gk_fileData = {};

function filledCell(cell) {
    return cell !== '' && cell != null;
}

function loadFileData(filename) {
    if (gk_isXlsx && gk_xlsxFileLookup[filename]) {
        try {
            const workbook = XLSX.read(gk_fileData[filename], { type: 'base64' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Convert sheet to JSON to filter blank rows
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false, defval: '' });
            // Filter out blank rows
            const filteredData = jsonData.filter(row => row.some(filledCell));

            // Find header row
            let headerRowIndex = filteredData.findIndex((row, index) =>
                row.filter(filledCell).length >= filteredData[index + 1]?.filter(filledCell).length
            );
            if (headerRowIndex === -1 || headerRowIndex > 25) {
                headerRowIndex = 0;
            }

            // Convert back to CSV
            const csv = XLSX.utils.aoa_to_sheet(filteredData.slice(headerRowIndex));
            return XLSX.utils.sheet_to_csv(csv, { header: true });
        } catch (e) {
            console.error('Error loading file:', e);
            document.getElementById('errorMessage').style.display = 'block';
            return '';
        }
    }
    return gk_fileData[filename] || '';
}
