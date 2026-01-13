import * as XLSX from 'xlsx';

/**
 * Reads an Excel file and returns a JSON array of objects.
 * @param {File} file - The file object from the input element.
 * @returns {Promise<Array>} - Resolves with the data as an array of objects.
 */
export const readExcel = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);
                resolve(json);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};

/**
 * Maps Excel keys to internal data structure keys.
 * @param {Array} data - Array of objects from Excel.
 * @param {Object} mapping - Object mapping Excel headers to data keys.
 * @returns {Array} - Mapped data.
 */
export const mapImportedData = (data, mapping) => {
    return data.map(item => {
        const mappedItem = {};
        Object.keys(mapping).forEach(excelKey => {
            const internalKey = mapping[excelKey];
            mappedItem[internalKey] = item[excelKey] || '';
        });
        return mappedItem;
    });
};
