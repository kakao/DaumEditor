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


