/*
 *  Daum Editor Based on Trex ver 1.5.
 *  Developed by: The Editors @ RIA Tech Team, FT Center 
 *  Powered by: Daum Communication Corp
 *  
 *  Open Source References :
 *  + prototype v1.5.1.1 - http://www.prototypejs.org/
 *  + hyperscript - http://elzr.com/posts/hyperscript
 *  + SWFObject v2.2 - http://blog.deconcept.com/swfobject/
 */

/**
 * Editor의 Global 속성들을 정의
 *  
 * @property
 */
_WIN.__TX_GLOBAL = {
		domain: "daum.net",
		session_id: _NULL
};

if (_DOC && __TX_GLOBAL.domain && !_WIN.Jaxer && (new RegExp(__TX_GLOBAL.domain + "$")).test(_DOC.domain)) {
	_DOC.domain = __TX_GLOBAL.domain;
}
