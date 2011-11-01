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
//for (i = 0; i < DEVELLIBS.length; i++) {
//    if (isExcludeFile(DEVELLIBS[i]) === true) {
//        continue;
//    }
//    var content = readFileContent(DEVELLIBS[i]);
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
}

var DE_PREFIX = "../../../DaumEditor/daumeditor/js/"
// 1. import header
_importScript(DE_PREFIX + "trex/header.js", true);
addGlobalCount();

// 2. import trex
for (i = 0; i < DEVELLIBS.length; i++) {
    _importScript(DE_PREFIX + DEVELLIBS[i]);
    addGlobalCount();
}

// 3. import daumx
if (typeof daumx === "object") {
    for (i = 0; i < daumx.length; i++) {
        _importScript(daumx[i]);
        addGlobalCount();
    }
}

// 4. import projectlib
if (typeof PROJECTLIBS === "object") {
    for (i = 0; i < PROJECTLIBS.length; i++) {
        _importScript(PROJECTLIBS[i]);
        addGlobalCount();
    }
}

// 5. import footer
_importScript(DE_PREFIX + "trex/footer.js");
addGlobalCount();

print(count + " js files has been wrote");