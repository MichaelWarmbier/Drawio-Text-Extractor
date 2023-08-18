/*//// External ////*/

const fs = require('fs');
const { promisify } = require('util');
const xmlr = require('xml-js');
const xlsx = require('node-xlsx').default;

/*//// Internal ////*/

const type = { 
    CSV: 'csv',
    TXT: 'txt', 
    XLSX: 'xlsx',
    TSV: 'tsv', 
    CLI: 'cli',
};

const clr = {
    ERROR: "\x1b[31m",
    SUCCESS: "\x1b[32m",
    WARNING:"\x1b[33m",
    INFO: "\x1b[36m",
    END: "\x1b[37m"
}

const args = process.argv;
const tempLabel = '[FILE LABEL]: ';
let totalFiltered = 0;
let filterArgument = new RegExp(/(?:)/);
let returnType = type.TXT;
let exFolders = [];
let fileName = [];

/*//// Functions ////*/

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
function printErr(str) { console.log(`${clr.RED}ERROR:${clr.END} ${str}`); process.exit(); }

async function openFile(dir) {
    try { 
        let data = await readFileAsync(dir);
        return data.toString();
    }
    catch (e) { printErr("Unable to open file (01)."); }
}

function loadArguments() {
    if (args[2] == null) printErr("Please enter a file (02).");
    if (args.includes('-txt')) returnType = type.TXT;
    else if (args.includes('-csv')) returnType = type.CSV;
    else if (args.includes('-tsv')) returnType = type.TSV;
    else if (args.includes('-cli')) returnType = type.CLI;
    else if (args.includes('-xlsx') || args.includes('-excel')) returnType = type.XLSX;

    if (args.includes('-ex')) {
        if (!args.includes('-deepscan'))
            console.log(`${clr.WARNING}WARNING:${clr.END} Not using deepscan. Folder exclusion ignored.`)
        exFolders = args.slice(args.indexOf('-ex') + 1);
    }

    if (args.includes('-scan')) fileName = scanDir(args[2]);
    else if (args.includes('-deepscan')) fileName = scanDir(args[2], 1);
    else { fileName.push(`${args[2].replace('.drawio', '')}.drawio`); }

    if (args.includes('-f')) {
        let regex = args[args.indexOf('-f') + 1];
        try { new RegExp(regex); } catch (e) { printErr('Invalid RegEx (05).')}
        filterArgument = regex.replace(/^"(.*)"$/, '$1');
        filterArgument = new RegExp(filterArgument);
    }
    if (args.includes('-o')) { filterArgument = new RegExp(/(?!\d{4})\D+/g); }
}

function scanDir(folder, deep=false, first=true) {
    let resultList = [];
    let localFiles;
    try { localFiles = fs.readdirSync(folder) } catch (e) { 
        if (first) printErr("Folder does not exist (03).");
    }
    try {
        if (deep) for (let file of localFiles) if (!file.includes('.') && exFolders.indexOf(file) == -1)
            resultList = resultList.concat(scanDir(`${folder}/${file}`, 1, 0));

        for (let file of localFiles)
            if (file.includes('.drawio') && !file.includes('bkp') && !file.includes('dtmp')) 
                resultList.push(`${folder}/${file}`);

    } catch (e) { }

    return resultList;
}

function findKey(obj, target) {
    result = [];

    function search(obj) {
        for (const key in obj) {
            if (key === target) { result.push(obj[key]); } 
            else if (typeof obj[key] === 'object' && obj[key] !== null) { search(obj[key]); }
        }
    }

    search(obj);
    return result;
}

function cleanText(textList, i) {
    let cleanedList = [];

    if (args.includes('-l')) cleanedList.push(`${tempLabel}${fileName[i]}`);
    for (const textElem of textList) {
        let newElem = textElem.replace(/<[^>]*>/g, '');
        let tempCompare = newElem;
        newElem = newElem.replace(/&nbsp;/g, '');
        newElem = newElem.replace(filterArgument, '');
        if (tempCompare != newElem) totalFiltered++;
        if (newElem) cleanedList.push(newElem);
    }
    if (args.includes('-rd'))
        cleanedList = cleanedList.filter((item, index) => cleanedList.indexOf(item) === index);
    if (args.includes('-fd')) {
        cleanedList = cleanedList.filter((item, index) => cleanedList.indexOf(item) !== index);
        cleanedList = cleanedList.filter((item, index) => cleanedList.indexOf(item) === index);
    }
    return cleanedList;
}

function formatExcelArray(arr) {
    let returnArr = [];

    if (args.includes('-l')) { 
        let index = -1;
        for (let item of arr) {
            if (item.includes(tempLabel)) { 
                returnArr.push([item.replace(tempLabel, '')]);
                index++; 
            }
            else returnArr[index].push(item);
        }
    } else for (let item of arr) returnArr.push([item]);
    if (returnType == type.CLI) { console.log(returnArr); }
    return returnArr;
}

async function convertToReturnType(allText) {
    let output= '';

    switch (returnType) {
        case type.CLI: formatExcelArray(allText); break;
        case type.TXT: for (let item of allText) output += `${item}\n`; break;
        case type.CSV: for (let item of allText) output += `${item},`; break;
        case type.TSV: for (let item of allText) output += `${item}\t`; break;
        case type.XLSX:
            try {
                output = xlsx.build([
                    {name: 'Result', data: formatExcelArray(allText)}
                ]); 
                await writeFileAsync('Result.xlsx', output, err => { });
            } catch (e) { printErr('Unable to save Result.xlsx (04).'); }
        break;
    }

    if (args.includes('-f') || args.includes('-o')) 
        console.log(`${clr.INFO}Total filtered items: ${clr.END}${totalFiltered}`);

    if (returnType == type.CLI) return;
    if (returnType != type.XLSX) 
        await writeFileAsync(`Result.${returnType}`, output, function (err) {
            if (err) { printErr(`Unable to save Result.${returnType} file.`); }
        });
    console.log(`${clr.SUCCESS}File saved to directory as ${clr.WARNING}Result.${returnType}${clr.END}`)
}

/*//// Code ////*/

async function main() {
    loadArguments();
    let cleanTextElements = [];
    for (let fileIndex = 0; fileIndex < fileName.length; fileIndex++) {
        let fileContent = await openFile(fileName[fileIndex]);
        fileContent = JSON.parse(xmlr.xml2json(fileContent));
        let dirtyTextElements = findKey(fileContent, 'value');
        for (elem of cleanText(dirtyTextElements, fileIndex)) cleanTextElements.push(elem);
    }
    await convertToReturnType(cleanTextElements);
} main();