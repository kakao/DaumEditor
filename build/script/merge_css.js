importPackage(java.io);

var FileWriter = function (filename) {
    this.writer = new OutputStreamWriter(new FileOutputStream(filename), "UTF-8");
};
FileWriter.prototype.write = function (data) {
    this.writer.write('\n');
    this.writer.write(data);
};
FileWriter.prototype.close = function () {
    this.writer.close();
};

var mergedFile = this.arguments[0],
    inputPath = this.arguments[1],
    inputFile = this.arguments[2],
    imageUrl = this.arguments[3],
    writer = new FileWriter(mergedFile);

print("build " + mergedFile);

function getCssText(filename) {
    var orig = readFile(filename, "utf-8");
    orig = orig.replace(/\/\*[\s\S]*?\*\//g, "");
    orig = orig.replace(/\.\.\/\.\.\/\.\.\/images/g, imageUrl);
    orig = orig.replace(/@import\s+url\(([\.\/\w_]+)\);?\n?/g, function (full, importFile) {
        return getCssText(filename.replace(/[\w_]+\.css/, importFile));
    });
    return orig;
}

var mergedText = getCssText(inputPath + '/' + inputFile);
writer.write(mergedText);
writer.close();