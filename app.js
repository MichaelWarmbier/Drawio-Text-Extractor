/*//// External ////*/

const fs = require('fs');
const { promisify } = require('util');
const xmlr = require('xml-js');
const xlsx = require('node-xlsx').default;

/*//// Internal ////*/

const args = process.argv;
const type = { 
    CSV: 'csv',
    TXT: 'txt', 
    XLSX: 'xlsx',
    TSV: 'tsv'
};

let returnType = type.TXT;
let fileName = [];

/*//// Functions ////*/

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
function printErr(str) { console.log(`\x1b[31mERROR:\x1b[37m ${str}`); process.exit(); }

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
    else if (args.includes('-xlsx') || args.includes('-excel')) returnType = type.XLSX;

    

    if (args.includes('-scan')) fileName = scanDir(args[2]);
    else if (args.includes('-deepscan')) fileName = scanDir(args[2], 1);
    else { fileName.push(`${args[2].replace('.drawio', '')}.drawio`); }
}

function scanDir(folder, deep=false, first=true) {
    let resultList = [];
    let localFiles;
    try { localFiles = fs.readdirSync(folder) } catch (e) { 
        if (first) printErr("Folder does not exist (03).");
    }
    try {
        if (deep) for (let file of localFiles) if (!file.includes('.'))
            resultList = resultList.concat(scanDir(`${folder}/${file}`, 1, 0));

        for (let file of localFiles)
            if (file.includes('.drawio') && !file.includes('bkp')) 
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

function cleanText(textList) {
    let cleanedList = [];
    for (const textElem of textList) {
        let newElem = textElem.replace(/<[^>]*>/g, '');
        if (newElem) cleanedList.push(newElem);
    }
    
    return cleanedList;
}

function rotateArray(arr) {
    let returnArr = [[]];
    for (let item of arr) returnArr.push([item]);
    return returnArr;
}

async function convertToReturnType(allText) {
    let output= '';

    switch (returnType) {
        case type.TXT: for (let item of allText) output += `${item}\n`; break;
        case type.CSV: for (let item of allText) output += `${item},`; break;
        case type.TSV: for (let item of allText) output += `${item}\t`; break;
        case type.XLSX:
            try {
                output = xlsx.build([{name: 'Result', data: rotateArray(allText) }]); 
                await writeFileAsync('Result.xlsx', output, err => { });
            } catch (e) { printErr('Unable to save Result.xlsx (04).'); }
        break;
    }
    if (returnType != type.XLSX) 
        await writeFileAsync(`Result.${returnType}`, output, function (err) {
            if (err) { printErr(`Unable to save Result.${returnType} file.`); }
        });
    console.log(`File saved to directory as \x1b[33mResult.${returnType}\x1b[37m`)
}

/*//// Code ////*/

async function main() {
    loadArguments();
    let cleanTextElements = [];
    for (let fileIndex = 0; fileIndex < fileName.length; fileIndex++) {
        let fileContent = await openFile(fileName[fileIndex]);
        fileContent = JSON.parse(xmlr.xml2json(fileContent));
        let dirtyTextElements = findKey(fileContent, 'value');
        for (elem of cleanText(dirtyTextElements)) cleanTextElements.push(elem);
    }
    await convertToReturnType(cleanTextElements);
} main();