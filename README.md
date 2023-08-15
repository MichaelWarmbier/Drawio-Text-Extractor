# Drawio-Text-Extractor V1.0

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

```
node app.js <path_to_file>
```
##### **Note**: You do not have to include .drawio in the argument.

### Extract From an Entire Folder

To extract from a specific folder:
```
node app.js <folder> -scan
```

To extract from the current folder:
```
node app.js . -scan
```

### Extract From an Filesystem
```
node app.js <folder> -deepscan
```
##### **Note**: Depending on the size of your system this may take some time.

### Determining the Output

Currently, this project supports the following forms of output:

- Text (default). Use the argument `-txt`
- Comma Separated Values. Use the argument `-csv`
- Tab Separated Values. Use the argument `-tsv`
- Excel Spreadsheets. Use either the argument `-excel` or `xlsx`

### Example Usage:

```
node app.js "./MyProject/Diagram" -deepscan -excel
```

## Credit

Thank you to the entire `drawio` and `drawio-desktop` team for your amazing utility! Thank you also to [MendelPro](https://github.com/MendelPro/) for assisting in the reverse engineering of the `.drawio` file.
