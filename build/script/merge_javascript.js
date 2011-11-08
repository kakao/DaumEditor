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


function readVersion() {
    importPackage(java.util);
    var pro = new Properties();
    pro.load(new FileInputStream('build/version.properties'));
    var versions = [
        pro.getProperty('version.major.number'),
        pro.getProperty('version.minor.number'),
        pro.getProperty('version.patch.number')
    ];
    return versions.join(".");
}


var EDITOR_PROJECT_NAME = "__UNDEFINED__";
var document = {
    write: function() {
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
    }
};

var i;

var mergedFile = this.arguments[0],
    srcDir = this.arguments[1],
    seedFile = this.arguments[2];

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
// add eval.js
addGlobalCount();
//writeFile(mergedFile, readFileContent("trex/eval.js"), false);
//
//// add editor scope
//writeFile(mergedFile, '(function(){');
//
//// add files
//for (i = 0; i < CORE_FILES.length; i++) {
//    if (isExcludeFile(CORE_FILES[i]) === true) {
//        continue;
//    }
//    var content = readFileContent(CORE_FILES[i]);
//    if(content){
//    	addGlobalCount();
//    	writeFile(mergedFile, content);
//    }
//}
//
//// add end scope
//writeFile(mergedFile, '})()');

function _importScript(filename, overwrite) {
    writeFile(mergedFile, readFileContent(filename), !overwrite);
    addGlobalCount();
}


var DE_PREFIX = "../../../DaumEditor/daumeditor/js/"

// 1. write trex/eval
_importScript(DE_PREFIX + "trex/eval.js", true);

// 2. open local scope
writeFile(mergedFile, '\r\n(function(){\r\n');

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

writeFile(mergedFile, 'Editor.version = "' + readVersion() + '";\r\n');

// 7. write footer
_importScript(DE_PREFIX + "trex/footer.js");

// 8. close local scope
writeFile(mergedFile, '\r\n})();');

print(count + " js files has been wrote");