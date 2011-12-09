importPackage(java.io);

var FileWriter = function(filename) {
    this.writer = new OutputStreamWriter(new FileOutputStream(filename), "UTF-8");
};
FileWriter.prototype.write = function(data) {
    this.writer.write('\n');
    this.writer.write(data);
};
FileWriter.prototype.close = function() {
    this.writer.close();
};

function exists(file) {
    var f = new File(file);
    return f.exists();
}

var mergedFile = this.arguments[0],
    inputPath = this.arguments[1],
    inputFile = this.arguments[2],
    writer = new FileWriter(mergedFile);

print("build " + mergedFile);

function getCssText(filename) {
    var orig = readFile(filename, "utf-8");
    orig = orig.replace(/\/\*[\s\S]*?\*\//g, "");
    orig = orig.replace(/\.\.\/\.\.\/\.\.\/images/g, "../images");
    orig = orig.replace(/@import\s+url\(([\.\/\w_]+)\);?\n?/g, function(full, importFile) {
        return getCssText(filename.replace(/[\w_]+\.css/, importFile));
    });
    return orig;
}

var mergedText = getCssText(inputPath + '/' + inputFile);
writer.write(mergedText);
writer.close();
