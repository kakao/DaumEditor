importPackage(java.io);

function writeFile(file, stream) {
    var append = false;
    if (arguments.length == 2) {
        append = true;
    } else {
        append = arguments[2];
    }

    var fw = new OutputStreamWriter(new FileOutputStream(file, append), "UTF-8");
    fw.write(stream);
    fw.close();
}

function exists(file) {
    var f = new File(file);
    return f.exists();
}



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

var mergedText = getCssText(inputPath + '/' + inputFile);
writeFile(mergedFile, mergedText, false);
