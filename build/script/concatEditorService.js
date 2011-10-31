load("build/src/io.js");

EDITOR_PROJECT_NAME = "__UNDEFINED__";
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
    }
};

var mergedFile = arguments[0],
    workingDir = arguments[1];

load("workingcopy/js/editor.js");
load("workingcopy/js/editor_common.js");
load("workingcopy/js/import_lib.js");

var isExcludeFile = function(filepath) {
    return (filepath === "" ||
        filepath === "lib/firebug/firebug.js" ||
        filepath === "trex/eval.js");
};

var getWorkDir = function(filepath){
	return workingDir + '/js/' + filepath;
};

var count = 0;
var addGlobalCount = function(){
	count++;
};

var readFileContent = function(filepath){
	var _filename = getWorkDir(filepath);
    if (exists(_filename)) {
        return readFile(_filename, "utf-8");
    }
    return false;
};

// -------------------------------------------------------
// add eval.js
addGlobalCount();
writeFile(mergedFile, readFileContent("trex/eval.js"));

// add editor scope
writeFile(mergedFile, '(function(){');

// add files
for (var i = 0; i < DEVELLIBS.length; i++) {
    if (isExcludeFile(DEVELLIBS[i]) === true) {
        continue;
    }
    var content = readFileContent(DEVELLIBS[i]);
    if(content){
    	addGlobalCount();
    	writeFile(mergedFile, content);
    }
}

// add end scope
writeFile(mergedFile, '})()');

print(count + " js files has been wrote");