'use strict';
const opts = require('./src/consts').DEFAULT_OPTIONS;
const fs = require('fs');
const { prismRender } = require('./src/highlighter');

let rendered = prismRender({
    ...opts,
    plugins: [
        'line-numbers',
        'normalize-whitespace',
        'line-highlight',
    ]
}, 'line=1,2', 'int main() {\n    return 0;\n}\n');

fs.writeFileSync('/dev/shm/aetf/workspace/index.html',
`<!DOCTYPE html>
<html>
<head>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism.css" rel="stylesheet" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/plugins/line-numbers/prism-line-numbers.css" rel="stylesheet" />
</head>
<body>
${rendered}
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/prism.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/plugins/line-numbers/prism-line-numbers.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/plugins/line-numbers/prism-line-highlight.js"></script>
<script src="/prism-plus.js"></script>
</body>
</html>`
);
