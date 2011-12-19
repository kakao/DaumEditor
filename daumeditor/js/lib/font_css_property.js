function extend(dest, org) {
    for (var key in org) {
        dest[key] = org[key];
    }
    return dest;
}
var FontCssProperty = function() {
    this.empty = true;
    this.shorthand = false;
    this.properties = {};
};

FontCssProperty.TAGS_FOR_PRESENTATION = {
    U: { textDecoration: "underline" },
    B: { fontWeight: "bold" },
    STRONG: { fontWeight: "bold" },
    I: { fontStyle: "italic" },
    EM: { fontStyle: "italic" },
//    SUB: { fontSize: "smaller", verticalAlign: "sub"},
//    SUP: { fontSize: "smaller", verticalAlign: "super"},
//    BIG: { fontSize: "larger" },
//    SMALL: { fontSize: "smaller" },
    S: { textDecoration: "line-through" },
    STRIKE: { textDecoration: "line-through" },
    INS: { textDecoration: "underline" },
    DEL: { textDecoration: "line-through" },
    FONT: function(attributes) {
        var result = {};
        if (attributes.face) {
            result.fontFamily = attributes.face;
        }
        if (attributes.color) {
            result.color = attributes.color;
        }

        var fontSizeMap = ["", "x-small", "small", "medium", "large", "x-large", "xx-large"];
        if (attributes.size) {
            var fontSize = attributes.size;
            result.fontSize = isNaN(fontSize) ?
                fontSize : fontSizeMap[Math.min(Math.max(1, fontSize), 6)];
        }
        return result;
    }
};

FontCssProperty.FONT_RELATED_CSS_PROPERTIES = {
    "font": "font",
    "font-style": "fontStyle",
    "font-weight": "fontWeight",
    "font-size": "fontSize",
    "font-family": "fontFamily",
    "text-decoration": "textDecoration",
    "color": "color",
    "background-color": "backgroundColor"
};

FontCssProperty.create = function(nodeName, attributes) {
    var fontCssProperty = new FontCssProperty();
    var elemStyle = FontCssProperty.TAGS_FOR_PRESENTATION[nodeName];
    if (elemStyle) {
        var fontTagStyle = (typeof elemStyle == "function") ? elemStyle(attributes) : elemStyle;
        for (var name in fontTagStyle) {
            fontCssProperty.setProperty(name, fontTagStyle[name]);
        }
    }
    var cssText = attributes.style;
    if (cssText) {
        cssText = cssText.replace(/[\w-]+:\s?;/g, "");
        var properties = cssText.split(/; ?|: ?/);
        for (var i = 0; i < properties.length - 1; i += 2) {
            var styleName = FontCssProperty.FONT_RELATED_CSS_PROPERTIES[properties[i].toLowerCase()];
            if (styleName) {
                // block에 지정된 backgroundColor style은 가져오지 않는다.
                // TODO font related tags
                if (styleName != "backgroundColor" || (FontCssProperty.TAGS_FOR_PRESENTATION[nodeName] || nodeName == "SPAN")) {
                    fontCssProperty.setProperty(styleName, properties[i + 1]);
                }
            }
        }
    }
    return fontCssProperty.getComputedStyles();
};

FontCssProperty.FONT_CSS_REGEXP = /(.*?)(\w+)(\/\w+)?\s+(['"]?[\w\uac00-\ud7a3]+['"]?)$/;
FontCssProperty.NORMAL_VALUE = "normal";

FontCssProperty.prototype.isEmpty = function() {
    return this.empty;
};

FontCssProperty.prototype.setProperty = function(name, value) {
    if (/^font$/i.test(name)) {
        // because of opera
        var parsedProperties = this.fromShorthand(value);
        if (parsedProperties) {
            this.shorthand = true;
            extend(this.properties, this.fromShorthand(value));
        }
    } else {
        this.properties[name] = value;
    }
    this.empty = false;
};

FontCssProperty.prototype.getComputedStyles = function() {
    if (this.shorthand) {
        return this.toShorthand();
    } else {
        return extend({}, this.properties);
    }
};

FontCssProperty.prototype.fromShorthand = function(fontCssText) {
    // parse extra font-families
    var indexOfComma = fontCssText.indexOf(","), extraFontFamilies = "";
    if (indexOfComma > 0) {
        extraFontFamilies = fontCssText.substring(indexOfComma);
        fontCssText = fontCssText.substring(0, indexOfComma);
    }
    var splittedProperties = fontCssText.match(FontCssProperty.FONT_CSS_REGEXP);
    if (splittedProperties === _NULL) {  // invalid font css property value
        return _NULL;
    }
    var NORMAL = FontCssProperty.NORMAL_VALUE;
    // parse main properties
    var properties = {
        fontSize: splittedProperties[2],
        lineHeight: (splittedProperties[3] || NORMAL).replace("/", ""),
        fontFamily: splittedProperties[4] + extraFontFamilies,
        fontWeight: NORMAL,
        fontStyle: NORMAL,
        fontVariant: NORMAL
    };
    // parse optional properties
    var optionalProperties = splittedProperties[1];
    if (/bold|700/i.test(optionalProperties)) {
        properties.fontWeight = "bold";
    }
    if (/italic/i.test(optionalProperties)) {
        properties.fontStyle = "italic";
    }
    if (/small-caps/i.test(optionalProperties)) {
        properties.fontVarient = "small-caps";
    }
    return properties;
};

FontCssProperty.prototype.toShorthand = function() {
    var propertiesClone = extend({}, this.properties);
    var NORMAL = FontCssProperty.NORMAL_VALUE;
    var validFontProperties = [];
    ["fontWeight", "fontStyle", "fontVarient"].each(function(name) {
        if (propertiesClone[name] != NORMAL) {
            validFontProperties.push(propertiesClone[name]);
        }
    });
    if (propertiesClone.lineHeight != NORMAL) {
        validFontProperties.push(propertiesClone.fontSize + "/" + propertiesClone.lineHeight);
    } else {
        validFontProperties.push(propertiesClone.fontSize);
    }
    validFontProperties.push(propertiesClone.fontFamily);
    ["fontWeight", "fontStyle", "fontVarient", "fontSize", "lineHeight", "fontFamily"].each(function(name) {
        delete propertiesClone[name];
    });
    var result = { font: validFontProperties.join(" ") };
    result = extend(result, propertiesClone);
    return result;
};