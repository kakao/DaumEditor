load("build/script/io.js");

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
    }
};

var i;

var mergedFile = arguments[0],
    srcDir = arguments[1],
    seedFile = arguments[2];

var getSourcePath = function(filename){
	return srcDir + '/' + filename;
};

var seeds = seedFile.split(",");
for (i = 0; i < seeds.length; i++) {
    load(getSourcePath(seeds[i]));
}

var isExcludeFile = function(filepath) {
    return (filepath === "" ||
        filepath === "lib/firebug/firebug.js" ||
        filepath === "trex/eval.js");
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
    return false;
};

// -------------------------------------------------------
// add eval.js
addGlobalCount();
writeFile(mergedFile, readFileContent("trex/eval.js"));

// add editor scope
writeFile(mergedFile, '(function(){');

// add files
for (i = 0; i < DEVELLIBS.length; i++) {
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