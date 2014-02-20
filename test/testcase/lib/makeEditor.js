/**
 * Created by sungwon on 14. 2. 6.
 */
EditorJSLoader.ready(function() {
    var editorConfig = {
        txHost: '', /*#* 수정 불필요 *#*/
        txPath: '/daumeditor/', /*#* 수정 불필요 *#*/
        txVersion: '', /*#* 수정 불필요 *#*/
        txService: '', /*#* 수정 불필요 *#*/
        txProject: '', /*#* 수정 불필요 *#*/
        txIP: '', /*#* 로컬검색 정렬 기준 파라메터 *#*/
        wrapper: "tx_trex_container", /*#* 에디터를 둘러싸고 있는 레이어 이름(에디터 컨테이너) *#*/
        form: 'tx_editor_form', /*#* 등록하기 위한 Form 이름 *#*/
        canvas: {
            showGuideArea: false
        },

        events: {
            preventUnload: false
        },
        size: {
            contentWidth: 700 /*#* 지정된 본문영역의 넓이가 있을 경우에 설정 *#*/
        }

    };
    EditorJSLoader.ready(function(Editor) {
        new Editor(editorConfig);

        Editor.getCanvas().observeJob(Trex.Ev.__IFRAME_LOAD_COMPLETE, function(panelDoc) {
            window.ax = {};
            installHyperscript(ax, panelDoc);
        });
    });

});