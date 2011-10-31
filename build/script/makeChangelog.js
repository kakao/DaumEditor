load("./src/io.js");

var editorVersion = arguments[0],
	previousChangelogFilename = arguments[1],
	newChangelogFilename = arguments[2],
	updatedChangelogFilename = arguments[3];

var previousChangelog = readFile(previousChangelogFilename, "utf-8"),
	newChangelog = readFile(newChangelogFilename, "utf-8"),
	updatedChangelog = "";

function makeTwoDigits(number) {
	if (number < 10) {
		number = "0" + number;
	}
	return number;
}

function decorate(source) {
	// STEP1
	// confluence-cli 에서 getPageSource 한 걸 파일로 저장하는 게 2가지 방법이 있는데,
	// 첫번째는 명령어에 --file 옵션을 써서 저장을 하거나,
	// 두번째는 ant java task 에 output 옵션을 써서 파일로 저장을 할 수가 있다.
	// 첫번째 방법으로 했을 때는 한글이 깨져서 저장되는 문제가 있다. (--encoding 옵션이 1.5.0 버전에는 없)
	// 두번째 방법으로 하면 한글은 잘 저장이 되는데 맨 마지막에 Page source 라는 문자열이
	// 덤으로 더 붙는다. 그래서 그 Page source 라는 문자열을 지워줘야 한다. 
	var lastIndex = source.lastIndexOf("Page source");
	if (lastIndex > 0) {
		source = source.substring(0, lastIndex);
	}
	
	
	// STEP2
	// svn 에서 log 를 뺐을 때 기본적으로 -------(줄임)-------- 로 revision log 가
	// 분리되어 있다. 이를 confluence wiki 에서 <hr/> 로 잘 작동하게 하려면 ---- 로 바꿔야 한다.
	var revisions = source.split("------------------------------------------------------------------------");
	revisions = revisions.filter(function (item) { return item; });	// 우선 텅빈 것 제거
	source = revisions.join("\n----\n");
	
	// STEP3
	// confluence 특성상 [] 는 링크로 {} 는 매크로로 인식하기 때문에 [ 와 { 앞에 \ 를
	// 붙여줘야 confluence 에서 제대로 표시가 된다.
	source = source.replace(/\[/g, "\\[");
	source = source.replace(/{/g, "\\{");
	
	// STEP4
	// 앞에 제목을 붙이고, 끝에 \n 를 붙인다
	var date = new Date();
	var today = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + " " + makeTwoDigits(date.getHours()) + ":" + makeTwoDigits(date.getMinutes());
	// today = "2011/6/30 13:54";
	source = "h2. " + editorVersion + " 배포 @ " + today + "\n{panel}" + source + "{panel}\n";
	
	return source;
}

function removeUnnecessaryFirstLine(source) {
	var linefeedIdx = source.indexOf("\n");
	var firstLine = source.substring(0, linefeedIdx);
	if (firstLine.indexOf("Page source") >= 0) {
		source = source.substring(linefeedIdx + 1);
	}
	
	return source;
}

newChangelog = decorate(newChangelog);
previousChangelog = removeUnnecessaryFirstLine(previousChangelog);	// Page source 라는 문자열이 자동으로 앞에 붙기 때문에 지워줘야 한다. (confluence-cli 에서 저 문자열을 붙여준다)

updatedChangelog = newChangelog + previousChangelog;
writeFile(updatedChangelogFilename, updatedChangelog);