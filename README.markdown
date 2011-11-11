Daum Editor - The Daum Open Source WYSIWYG Web Editor
======================================================


Setting up a development environment
------------------------------------
1. Install any kind of web server on your desktop
2. mapping project root directory

e.g. `httpd.conf`

`Alias /DaumEditor /Users/daumeditor/workspace/DaumEditor`

3. Open Test Page

Test Case

e.g. `http://yourhostname/DaumEditor/test/testrunner.html`

Sample

e.g. `http://yourhostname/DaumEditor/daumeditor/pages/editor.html`


Accessing with local url(file://) is also supported. but not recommended.


Build & Packaging
-----------------------------------------
1. Pre-requisite

* JRE
* Apache Ant

2. move to DaumEditor directory
`$ cd DaumEditor`

3. run ant task

e.g.
`DaumEditor$ ant`

4. test
`open 'build/dist/pages/editor.html' in your browser`

Install
------------------------------------------
TODO Wiki에 installation guide 를 정리하고 link를 걸자


TODO /daumeditor -> /src
TODO packaging to build/dist directly, not build/dist/daumeditor