const fse = require('fs-extra');
const fs = require('fs');
var JavaScriptObfuscator = require('javascript-obfuscator');

fs.rmdirSync('build', {recursive:true});
fs.mkdirSync('build')
fse.copySync('files', 'build', { overwrite: true });
fs.rmdirSync('build/js', {recursive:true});

const jsFiles = fs.readdirSync('files/js');

fs.mkdirSync('build/js')

jsFiles.forEach(async x => {
    var content = fs.readFileSync(`files/js/${x}`, 'utf-8');

    var obfuscationResult = JavaScriptObfuscator.obfuscate(
        content,
        {
            compact: false,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 1,
            numbersToExpressions: true,
            simplify: true,
            stringArrayShuffle: true,
            splitStrings: true,
            stringArrayThreshold: 1,
            deadCodeInjection: true,
            domainLock: ['beatbot.neonite.net', 'beatbot-static.pages.dev'],
            selfDefending: true
        }
    );

    fs.writeFileSync(`build/js/${x}`, obfuscationResult.getObfuscatedCode());
})


