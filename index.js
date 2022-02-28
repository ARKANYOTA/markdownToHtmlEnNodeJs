const process = require('process');
const fs = require('fs');
const katex = require('katex');
const AsciiMathParser = require('asciimath2tex');
const asciiMath = new AsciiMathParser();
// const SuperExpressive = require('super-expressive');

var hljs = require('highlight.js') // https://highlightjs.org/
var MarkdownIt = require('markdown-it');
const op = require("katex");
var md = new MarkdownIt('commonmark', {
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return '<pre class="hljs"><code>' +
                    hljs.highlight(str, {language: lang}).value +
                    '</code></pre>';
            } catch (__) {
            }
        }

        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    }
});

// --dark, --jump, --choosetheme, --setinfolder [wharfolder], //TODO --hilight
// faire un truc pour mettre les css et js dans un dossier
// faire un spearator pour load que une partie


function main() {
    let input = process.argv[2];
    let output = process.argv[3];
    let setInFolder;
    let whatfolder;
    let imports = "";
    if (process.argv.includes('--help')) {
        console.log('Usage: node index.js inputfile [outputfile|0] [--help] [--version]');
        return;
    } else if (process.argv.includes('--version')) {
        console.log('1.0.1');
        return;
    } else if (process.argv.includes('--setinfolder')) {
        setInFolder = true;
        whatfolder = process.argv[process.argv.indexOf('--setinfolder') + 1];
    }
    if (!input) {
        console.log('Usage: node index.js inputfile [outputfile|0] [--help] [--version]');
        return;
    }
    if (!output) {
        console.log('Usage: node index.js inputfile outputfile [--help] [--version]');
        return;
    }
    fs.readFile(input, 'utf8', (err, data) => {
        if (err) throw err;
        let pagedata = data;
        let pagehasmath = false;
        pagedata = pagedata.replace(/&([^$&\r\n]*)&/g, (match, p1) => {
            pagehasmath = true;
            return katex.renderToString(asciiMath.parse(p1), {
                throwOnError: false
            });
        });
        pagedata = pagedata.replace(/\$\$([^$&]*)\$\$/g, (match, p1) => {
            pagehasmath = true;
            return katex.renderToString(p1, {
                throwOnError: false
            });
        });
        pagedata = pagedata.replace(/\$([^$&\n\r]*)\$/g, (match, p1) => {
            pagehasmath = true;
            return katex.renderToString(p1, {
                throwOnError: false
            });
        });
        pagedata = md.render(pagedata);

        if (process.argv.includes('--jump')) {
            pagedata = pagedata.replace(/\n/g, '<br>');
        }

        //<!--<link href="https://unpkg.com/@primer/css@^16.0.0/dist/primer.css" rel="stylesheet" />-->
        //<!--<link rel="stylesheet" href="https://unpkg.com/@highlightjs/cdn-assets@11.4.0/styles/default.min.css">-->
        if (pagehasmath) {
            if (setInFolder) {
                imports = `
                    <link rel="stylesheet" href="${whatfolder+"/css/katex.min.css"}" integrity="sha384-MlJdn/WNKDGXveldHDdyRP1R4CTHr3FeuDNfhsLPYrq2t0UBkUdK2jyTnXPEK1NQ" crossorigin="anonymous">
                    <script defer src="${whatfolder+"/js/katex.min.js"}" integrity="sha384-VQ8d8WVFw0yHhCk5E8I86oOhv48xLpnDZx5T9GogA/Y84DcCKWXDmSDfn13bzFZY" crossorigin="anonymous"></script>
                    <script defer src="${whatfolder+"/js/auto-render.min.js"}" integrity="sha384-+XBljXPPiv+OzfbB3cVmLHf4hdUFHlWNZN5spNQ7rmHTXpd7WvJum6fIACpNNfIR" crossorigin="anonymous" onload="renderMathInElement(document.body);"/>
                    <script defer src="${whatfolder+"/js/asciimath2tex.umd.js"}"</script>
                `
            } else {
                imports = `
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.15.2/dist/katex.min.css" integrity="sha384-MlJdn/WNKDGXveldHDdyRP1R4CTHr3FeuDNfhsLPYrq2t0UBkUdK2jyTnXPEK1NQ" crossorigin="anonymous">
                    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.15.2/dist/katex.min.js" integrity="sha384-VQ8d8WVFw0yHhCk5E8I86oOhv48xLpnDZx5T9GogA/Y84DcCKWXDmSDfn13bzFZY" crossorigin="anonymous"></script>
                    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.15.2/dist/contrib/auto-render.min.js" integrity="sha384-+XBljXPPiv+OzfbB3cVmLHf4hdUFHlWNZN5spNQ7rmHTXpd7WvJum6fIACpNNfIR" crossorigin="anonymous" onload="renderMathInElement(document.body);"/>
                    <script src="https://unpkg.com/asciimath2tex@1.2.1/dist/asciimath2tex.umd.js"></script>
                `
            }
        }
        if(setInFolder){
            imports += `
                <link rel="stylesheet" href="${whatfolder+"/css/primer.css"}">
                <link rel="stylesheet" href="${whatfolder+"/css/highlightjs.css"}">
                <link rel="stylesheet" href="${whatfolder+"/css/global.css"}">
                <script src="${whatfolder+"/js/highlight.min.js"}"></script>
            `
        }else {
            imports += `
                <style>${fs.readFileSync("./css/primer.css", "utf-8")}</style>
                <style>${fs.readFileSync('./css/highlightjs.css', 'utf8')};</style>
                <style>${fs.readFileSync('./css/global.css', 'utf8')}</style>
                <script src="https://unpkg.com/@highlightjs/cdn-assets@11.4.0/highlight.min.js"></script>
            `
        }
        // imports = imports.replace(/[\r\n\t]/g, '')
        // imports = imports.replace(/\s(\s)*/g, ' ')
        let base_html = `<!doctype html>
            <html lang="fr">
            <head>
                <meta charset="utf-8">
                <title>Titre de la page</title>
                <!-- Mettre tout ca dans un diossierr-->
                ${imports}
                <script>
                    function changetheme(theme){
                        if(theme.substring(0,4) === 'dark'){
                            document.documentElement.setAttribute("data-color-mode", "dark");
                            document.documentElement.setAttribute("data-dark-theme", theme);
                        } else {
                            document.documentElement.setAttribute("data-color-mode", "light");
                            document.documentElement.setAttribute("data-light-theme", theme);
                        }
                        document.cookie = "theme="+theme+"; path=/";
                        //hljs.highlightAll();
                    }
                    function load_cookie(){
                        document.cookie.split(';').forEach(function(c) {
                            var m = c.trim().match(/theme=(.*)/);
                            if(m) {
                                changetheme(m[1]);
                            }else{
                                changetheme(${process.argv.includes("--dark") ? "'dark'" : "'light'"})
                            }
                        });
                    }
                    load_cookie();
                </script>
            </head>
            <body>
                ${process.argv.includes('--choosetheme') ? `
                <div class="themechose">
                    <a onclick="changetheme('light')" class="theme-button">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                  d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"
                                  fill="currentColor"/>
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                  d="M11 0H13V4.06189C12.6724 4.02104 12.3387 4 12 4C11.6613 4 11.3276 4.02104 11 4.06189V0ZM7.0943 5.68018L4.22173 2.80761L2.80752 4.22183L5.6801 7.09441C6.09071 6.56618 6.56608 6.0908 7.0943 5.68018ZM4.06189 11H0V13H4.06189C4.02104 12.6724 4 12.3387 4 12C4 11.6613 4.02104 11.3276 4.06189 11ZM5.6801 16.9056L2.80751 19.7782L4.22173 21.1924L7.0943 18.3198C6.56608 17.9092 6.09071 17.4338 5.6801 16.9056ZM11 19.9381V24H13V19.9381C12.6724 19.979 12.3387 20 12 20C11.6613 20 11.3276 19.979 11 19.9381ZM16.9056 18.3199L19.7781 21.1924L21.1923 19.7782L18.3198 16.9057C17.9092 17.4339 17.4338 17.9093 16.9056 18.3199ZM19.9381 13H24V11H19.9381C19.979 11.3276 20 11.6613 20 12C20 12.3387 19.979 12.6724 19.9381 13ZM18.3198 7.0943L21.1923 4.22183L19.7781 2.80762L16.9056 5.6801C17.4338 6.09071 17.9092 6.56608 18.3198 7.0943Z"
                                  fill="currentColor"/>
                        </svg>
                    </a>
                    <a onclick="changetheme('dark_dimmed')" class="theme-button">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8V16Z" fill="currentColor"/>
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                  d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4V8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16V20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z"
                                  fill="currentColor"/>
                        </svg>
                    </a>
                    <a onclick="changetheme('dark')" class="theme-button">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                  d="M12.2256 2.00253C9.59172 1.94346 6.93894 2.9189 4.92893 4.92891C1.02369 8.83415 1.02369 15.1658 4.92893 19.071C8.83418 22.9763 15.1658 22.9763 19.0711 19.071C21.0811 17.061 22.0565 14.4082 21.9975 11.7743C21.9796 10.9772 21.8669 10.1818 21.6595 9.40643C21.0933 9.9488 20.5078 10.4276 19.9163 10.8425C18.5649 11.7906 17.1826 12.4053 15.9301 12.6837C14.0241 13.1072 12.7156 12.7156 12 12C11.2844 11.2844 10.8928 9.97588 11.3163 8.0699C11.5947 6.81738 12.2094 5.43511 13.1575 4.08368C13.5724 3.49221 14.0512 2.90664 14.5935 2.34046C13.8182 2.13305 13.0228 2.02041 12.2256 2.00253ZM17.6569 17.6568C18.9081 16.4056 19.6582 14.8431 19.9072 13.2186C16.3611 15.2643 12.638 15.4664 10.5858 13.4142C8.53361 11.362 8.73568 7.63895 10.7814 4.09281C9.1569 4.34184 7.59434 5.09193 6.34315 6.34313C3.21895 9.46732 3.21895 14.5326 6.34315 17.6568C9.46734 20.781 14.5327 20.781 17.6569 17.6568Z"
                                  fill="currentColor"/>
                        </svg>
                    </a>
                </div>
                ` : ''}
                <article class="markdown-body">
                    ${pagedata}
                </article>
            </body>
        </html>`
        fs.writeFileSync(output, base_html);
    });
}

main();