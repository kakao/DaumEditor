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

### Canvas

Configure WYSIWYG area

#### showGuideArea

* Key: `config.canvas.showGuideArea`
* Type: `boolean`
* Defaults: `true`

Show or hide content width guide on canvas

#### readonly

* Key: `config.canvas.readonly`
* Type: `boolean`
* Defaults: `false`

Disable editing canvas

#### styles

* Key: `config.canvas.styles`
* Type: `object`
* Properties:
    * `color`: Font color
    * `fontFamily`
    * `fontSize`
    * `backgroundColor`
    * `lineHeight`
    * `padding`
* Defaults: [See trex/canvas.js](https://github.com/daumeditor/DaumEditor/blob/development/daumeditor/js/trex/canvas.js#L17)

Set styles of canvas area


    {
        canvas: {
            styles: {
                color: "#123456",
                fontFamily: "Verdana",
                fontSize: "10pt",
                backgroundColor: "#fff",
                lineHeight: "1.5",
                padding: "8px"
            },
            showGuideArea: false
        }
    }


- - -

### Sidebar

#### Attachbox

##### show

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

- - -

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
