load("build/src/io.js");

EDITOR_PROJECT_NAME = "__UNDEFINED__";
var document = {
    write: function() {
    }
};
var location = {
    host: "myeditor.daum.net"
};

var mergedFile = arguments[0],
	workingDir = arguments[1],
    seedFile = arguments[2];

load(workingDir + "/js/"+ seedFile);

var isExcludeFile = function(filepath){
	if( filepath === "" || 
		filepath === "lib/firebug/firebug.js" ||
		filepath === "trex/eval.js" ){
		return true;
	} else {
		return false;
	}
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

//-------------------------------------------------------
//add eval.js
writeFile(mergedFile, readFileContent("trex/eval.js"));

//add editor scope
writeFile(mergedFile, '(function(){');

//add files
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

//add end scope
writeFile(mergedFile, '})()');

print(count + " js files has been wrote");