# Drawio-Text-Extractor V1.2

A simple JavaScript package to extract text elements from a .drawio file. Support for both **Windows** and **Linux**.


## About

[Drawio](https://github.com/jgraph/drawio) is a web application and desktop [Electron](https://www.electronjs.org/) based application that allows users to create diagrams and similar visual items.

This application is a small utility tool that allows users to easily extract text from their project files in various formats for efficient data management.


## Installation

You can install this utility directly by download the [latest release](https://github.com/MichaelWarmbier/Drawio-Text-Extractor/releases/tag/Release). It is not meant to be installed as a package, and is meant to be used directly.

In order for everything to run, you need to have [node.js](https://nodejs.org/en) installed.

### Linux

This application has been tested and verified to work on **Ubuntu 22.04.2 LTS**. It is expected to function on all flavors of Linux that support `nodejs`.

## How To Use

Open a **command line** or **terminal** to the directory that you've installed the app. You can run the app using the following commands:

### Extract From a Specific File

```sh
node app.js "path/to/project" 
```
##### **Note**: You do not have to include .drawio in the argument.

### Labeling Results By File

Doing this will organize all the results by file that they belong to. 

```sh
node app.js "path/to/project" -l
```

### Filtering Results With RegEx

```sh
node app.js "path/to/project" -f "regexString" 
```
##### **Note**: You do not have to include the `/` characters in the RegEx string.

### Extract From a Folder

To extract from a specific folder:
```sh
node app.js <folder> -scan
```

To extract from the current folder:
```sh
node app.js . -scan
```

### Extract From an Filesystem
```sh
node app.js <folder> -deepscan
```
##### **Note**: Depending on the size of your system this may take some time.

You can also exclude specific folders by using the following option at the end:

```sh
node app.js <folder> -deepscan -ex <folder1> <folder2> ..
```

### Handling Duplicates

You can remove all duplicates by using the `-rd` option. This will only retrieve one copy of each.

You can retrieve _only_ the duplicates by using the `-fd` option.

### Determining the Output

Currently, this project supports the following forms of output:

- Text (default). Use the argument `-txt`
- Command-Line Interface Output. Use the argument `-cli`
- Comma Separated Values. Use the argument `-csv`
- Tab Separated Values. Use the argument `-tsv`
- Excel Spreadsheets. Use either the argument `-excel` or `xlsx`

### Example Usage:

```sh
node app.js "./MyProject/Diagram" -deepscan -excel
```

## Credit

Thank you to the entire `drawio` and `drawio-desktop` team for your amazing utility! Thank you also to [MendelPro](https://github.com/MendelPro/) for assisting in the reverse engineering of the `.drawio` file.
