## Configuration

### Configuration Object

The configuration object is just plain old javascript object to customize your editor instance.
You can set the values on your own before initializing a editor, and then pass it to the editor constructor.

Usage:

    var config = {
       // set the values in javascript object literal
       txHost: "http://your.domain.com",
       txPath: "/editor/path",
       wrapper: "wrapper_element_id",
       form: "form_name",
       .......
    };

    EditorJSLoader.ready(function(Editor) {
        var editor = new Editor(config);
    });



#### Configuration Builder

_TODO introduce `EditorConfigBuilder`_

- - -

### Required Fields

#### txHost

* __Required__
* Key: `config.txHost`
* Type: `string`



#### txPath

* __Required__
* Key: `config.txPath`
* Type: `string`



#### wrapper

* __Required__
* Key: `config.wrapper`
* Type: `string`

The id of an element which contains DaumEditor.

#### form

* __Required__
* Key: `config.form`
* Type: `string`

The name of a form which is to be sumbitted. Editor.save() will submit this form.

- - -

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
* Defaults: [See trex/canvas.js](https://github.com/daumcorp/DaumEditor/blob/development/daumeditor/js/trex/canvas.js#L17)

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

### Size

#### contentWidth

* Key: `config.size.contentWidth`
* Type: `integer`
* Default: auto-computed value



- - -

### Resizer

#### minHeight

* Key: `config.resizer.minHeight`
* Type: `integer`
* Default: `200`



- - -

### Events

#### preventUnload

* Key: `config.events.preventUnload`
* Type: `booloean`
* Default: `true`



- - -

### Sidebar

#### Attachbox

##### show

* Key: `config.sidebar.attachbox.show`
* Type: `boolean`
* Defaults: `false`

Set the Attachbox's Visibility

    {
        sidebar: {
            attachbox: {
                show: true
            }
        }
    }

#### Capacity

##### maximum

* Key: `config.sidebar.capacity.maximum`
* Type: `Number`
* Defaults: `3145728` (3 MB)

Set total maximum bytes of all attachments

    {
        sidebar: {
            capacity: {
                maximum: 10 * 1024 * 1024 // 10 MB
            }
        }
    }




- - -

### Misc.

#### initializedId

* Key: `config.initializedId`
* Type: `string`
* Defaults: empty string



#### txIconPath

* Key: `config.txIconPath`
* Type: `string`
* Defaults: `#txHost#txPath/images/icon/editor/`

Base path of the editor image (e.g. toolbar icon) directory.
URL for the `daumeditor/images/icon/` directory


#### txDecoPath

* Key: `config.txDecoPath`
* Type: `string`
* Defaults: `#txHost#txPath/images/deco/contents/`

Base path of the editor contents image (e.g. emoticon) directory.
URL for the `daumeditor/images/deco/` directory

    {
        txIconPath: "http://yourcdnserver/daumeditor/images/icon/editor/",
        txDecoPath: "http://yourcdnserver/daumeditor/images/deco/contents/"
    }
