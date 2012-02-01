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

var document = {
    write: function() {
    },
    getElementsByTagName: function() {
    	return [];
    }
};
var window = {
    attachEvent: function() {
    }
};

var EditorJSLoader = {
    loadModule: function() {
    },
    getJSBasePath: function() {
        return "";
    },
    getBasePath: function() {
        return "";
    }
};

var i;

var outputFilename = this.arguments[0],
    srcDir = this.arguments[1],
    seedFile = this.arguments[2],
    editor_version = this.arguments[3];

var outputWriter = new FileWriter(outputFilename);

var getSourcePath = function(filename){
    return srcDir + '/' + filename;
};

var seeds = seedFile.split(",");
for (i = 0; i < seeds.length; i++) {
    load(getSourcePath(seeds[i]));
}


EXCLUDE_FILES = (typeof EXCLUDE_FILES == "object") ? EXCLUDE_FILES : [];
EXCLUDE_FILES.push("lib/firebug/firebug.js");
EXCLUDE_FILES.push("trex/eval.js");

var isExcludeFile = function(filepath) {
    for (var i = 0; i < EXCLUDE_FILES.length; i++) {
        if (EXCLUDE_FILES[i] == filepath) {
            return true;
        }
    }
    return false;
};


var count = 0;
var addGlobalCount = function(){
    count++;
};

var readFileContent = function(filepath){
    var _filename = getSourcePath(filepath);
    if (exists(_filename)) {
        return readFile(_filename, "utf-8");
    }
    throw "failed to read file. " + _filename;
};

// -------------------------------------------------------

addGlobalCount();

function _importScript(filename) {
    outputWriter.write(readFileContent(filename));
    addGlobalCount();
}


var DE_PREFIX = "../../../DaumEditor/daumeditor/js/";

// 1. write trex/eval
_importScript(DE_PREFIX + "trex/eval.js");

// 2. open local scope
outputWriter.write('(function(){');

// 3. write header
_importScript(DE_PREFIX + "trex/header.js");

// 4. write trex list
for (i = 0; i < CORE_FILES.length; i++) {
    if (!isExcludeFile(CORE_FILES[i])) {
        _importScript(DE_PREFIX + CORE_FILES[i]);
    }
}

// 5. write EXT_FILES list
if (typeof EXT_FILES === "object") {
    for (i = 0; i < EXT_FILES.length; i++) {
        if (!isExcludeFile(EXT_FILES[i])) {
            _importScript(EXT_FILES[i]);
        }
    }
}

// 6. write service list
if (typeof SERVICE_FILES === "object") {
    for (i = 0; i < SERVICE_FILES.length; i++) {
        if (!isExcludeFile(SERVICE_FILES[i])) {
            _importScript(SERVICE_FILES[i]);
        }
    }
}

outputWriter.write('if (typeof Editor !== "undefined") Editor.version = "' + editor_version + '";');

// 7. write footer
_importScript(DE_PREFIX + "trex/footer.js");

// 8. close local scope
outputWriter.write('})();');
outputWriter.close();
print(count + " js files has been written");