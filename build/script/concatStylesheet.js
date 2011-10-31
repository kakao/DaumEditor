load("build/script/io.js");

var mergedFile = arguments[0],
    inputPath = arguments[1],
    inputFile = arguments[2];

print("build " + mergedFile);

function getCssText(filename) {
//    print(filename);
    var orig = readFile(filename, "utf-8");
    orig = orig.replace(/\/\*[\s\S]*?\*\//g, "");
    orig = orig.replace(/@import\s+url\(([\.\/\w_]+)\);?\n?/g, function(full, importFile) {
        return getCssText(filename.replace(/[\w_]+\.css/, importFile));
    });
    return orig;
}

var mergedText = getCssText(inputPath + inputFile);
writeFile(mergedFile, mergedText);
