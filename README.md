# hexo-prism-plus

[![npm version](https://badge.fury.io/js/hexo-prism-plus.svg)](https://badge.fury.io/js/hexo-prism-plus)
[![npm dependencies](https://david-dm.org/Aetf/hexo-prism-plus.svg)](https://david-dm.org/Aetf/hexo-prism-plus)

[![NPM](https://nodei.co/npm/hexo-prism-plus.png)](https://npmjs.org/package/hexo-prism-plus)

Better code block highlighting with [Prism](http://prismjs.com/index.html) for [Hexo](https://hexo.io), which exposes the full power of Prism with an elegent interface
in markdown.

This is done by providing a custom `before_post_render` that replaces the original backtick code block. This package also includes a tag plugin that is similar to the original `include_code` tag, but works with Prism.

## Demo
All code blocks in [my blog](https://unlimitedcodeworks.xyz) are generated by this plugin. Please go and take a look.
The source code is available on [Github](https://github.com/Aetf/Aetf.github.io).

## Installation

`npm i -S hexo-prism-plus`

The default highlight is automatically disabled, so no more change is needed.

## Usage
Just write code using fenced code block syntax as usual. Additional options for Prism can be specified either inline or using a preset defined inside the site config file `_config.yml`.

    ```python preset=mypreset lineno=True line=1-4,7
    # some code
    ```

### Inline Options
Inline options are specified directly right after the opening fence, in the same line.

It has the format `[language] (key=value)*`. 
The first `language` option is mandatory, as Prism doesn't auto detect language.
If missing, a default value from site configuration file is used,
see [Other Config Options](#other-config-options) for detail.
You can find a list of [supported languages](http://prismjs.com/index.html#languages-list) on Prism official site.

Inline options take precedence over options set in preset. So you can load a preset and override some specific ones.

Note that for the simplicity of parsing, no space is allowed in both keys and values as it's used to seprate key-value pairs.
While it is hardly needed, if in rare cases when you do want it, you can still specify value containing spaces and other special characters using presets.

#### Available inline options
| Option | Default value | Meaning |
|:---:|:---:|:---|
| `preset` | None | Load a preset. |
| `lineno` | `true` | Whether enable line number. |
| `classes` | Empty | Additional classes applied to the `pre` tag, splited by `,`. |
| `styles` | Empty | Additional styles applied to the `pre` tag, splited by `;`. |
| other | None | Directly passed as a data attribute of the `pre` tag. For example, `line=1-4,7` will be `<pre data-line="1-4,7">`. This way, you can pass arbitrary options to Prism. |

### Presets
Preset allows you to group related options and apply them easily to multiple code blocks.
They are specified in the site config file `_config.yml` as a dictionary, under `prism_plus.presets`.

```yaml
prism_plus:
    presets:
        mypreset:
            lineno: true
            classes: [ command-line ]
            user: username
            host: localhost
            output: 2
        another:
            lineno: false
            start: -5
            classes: [mycodeblock, otherclass]
            styles:
                max-height: 30em
```

Then you can use these predefined presets in your post:

    ```bash preset=mypreset
    echo "Cool!"
    Cool!
    ```

And it will be translated to
```html
<pre class="line-numbers command-line" data-user="username" data-host="localhost" data-output="2">
<code class="language-bash">
echo "Cool!"
Cool!
</code>
</pre>
```

### Tag Plugin
To insert code snippets from file with Prism highlight, use
```
{% includecode /path/to/file [inline options] %}
```

`/path/to/file` is relative to `code_dir` in `_config.yml`.
And inline options have the same format as those used in backtick code blocks.

Pro tip: Prism has a [toolbar plugin](https://dev.misterphilip.com/prism/plugins/toolbar/)
that can add view source and copy to clipboard links to the highlighted code block.
Please refer to the next section about how to add plugins to Prism.

### Customizing Prism
`hexo-prism-plus` automatically injects Prism js and css to rendered html files. So no theme
support is needed.

Since there are too many languages and plugins to include them all, 
by default only a base version of Prism from CDN is injected, which includes a small set of languages. Other languages can be imported by including additional components.

The base version includes support for javascript, css, 'markup' (HTML, XML and other XML-based languages) and 'c-like'. Languages that you haven't imported support for will be left unstyled.

This injection can be customized by config options. For example, following is the default set of files injected by `hexo-prism-plus`:
```yaml
prism_plus:
    vendors:
        base_url: https://cdnjs.cloudflare.com/ajax/libs/prism/1.8.4/
        prism:
            - prism.min.js
            - plugins/line-numbers/prism-line-numbers.min.js
        prism_css:
            - themes/prism.min.css
            - plugins/line-numbers/prism-line-numbers.min.css
```

Files in `vendors.prism` and `vendors.prism_css` are injected to rendered html page.
Note the value of `vendors.prism` and `vendors.prism_css` can be either a string or an array. If it is an array, files will be injected in order.

To save a few types, `vendors.base_url` can be used to set a common prefix for paths. It is unconditionally prepend to all elements under `vendors.prism` and `vendors.prism_css`.

It is also possible to use the configuration tool from
[Prism download page](http://prismjs.com/download.html) to create your customized build.
Then simply use relative urls for `vendors.prism` and `vendors.prism_css`.

### Other config options
The following is the default config with all available options. Config options not mentioned
above is explained in comments.

```yaml
prism_plus:
    # Set to false to disable the plugin
    enable: true
    # Custom Prism path
    vendors:
        base_url: https://cdnjs.cloudflare.com/ajax/libs/prism/1.8.4/
        prism:
            - prism.min.js
            - plugins/line-numbers/prism-line-numbers.min.js
        prism_css:
            - themes/prism.min.css
            - plugins/line-numbers/prism-line-numbers.min.css
    # Default language if not specified inline in code blocks
    default_lang: clike
    # Default preset if no preset is specified inline
    default_preset:
        lineno: true
        classes:
        styles:
    # All available presets
    presets:
```