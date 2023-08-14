/*//// External ////*/

const fs = require('fs');
const { promisify } = require('util');
const xmlr = require('xml-js');

/*//// Functions ////*/

const readFileAsync = promisify(fs.readFile);

async function openFile(dir) {
    try { 
        let data = await readFileAsync(dir);
        return data.toString();
     }
    catch (e) { console.log("Unable to read file."); }
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
    for (const textElem of textList)
        cleanedList.push(textElem.replace(/<[^>]*>/g, ''));
    
    return cleanedList;
}

/*//// Code ////*/

async function main() {
    let fileContent = await openFile('test.drawio');
    fileContent = JSON.parse(xmlr.xml2json(fileContent));
    dirtyTextElements = findKey(fileContent, 'value');
    cleanText(dirtyTextElements);
} main();