## Configuration

The configuration object is just plain old javascript object to customize your editor instance. You can set the values on your own before initializing a editor, and then pass it to the editor constructor.

### Configuration Object

The configuration object is just plain old javascript object to customize your editor instance. You can set the values on your own before initializing a editor, and then pass it to the editor constructor.

Usage:

    var config = {
       // set the values in javascript object literal
    };

    EditorJSLoader.ready(function(Editor) {
        var editor = new Editor(config);
    });



#### Configuration Builder

_TODO introduce `EditorConfigBuilder`_

---

### Sidebar

#### Attachbox

* Key: `config.sidebar.attachbox.show`
* Type: `boolean`
* Defaults: `false`

Set the Attachbox's Visibility :

    {
        sidebar: {
            attachbox: {
                show: true
            }
        }
    }


### Misc.

#### txIconPath

* Key: `config.txIconPath`
* Type: `string`
* Defaults: `none`

Base path of the editor image (e.g. toolbar icon) directory.
URL for the `daumeditor/images/icon/` directory


#### txDecoPath

* Key: `config.txDecoPath`
* Type: `string`
* Defaults: `none`

Base path of the editor contents image (e.g. emoticon) directory.
URL for the `daumeditor/images/deco/` directory

    {
        txIconPath: "http://yourcdnserver/daumeditor/images/icon/editor/",
        txDecoPath: "http://yourcdnserver/daumeditor/images/deco/contents/"
    }
