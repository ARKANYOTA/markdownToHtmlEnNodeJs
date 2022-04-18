const process = require('process');
const fs = require('fs');
const katex = require('katex');
const AsciiMathParser = require('asciimath2tex');
const asciiMath = new AsciiMathParser();
const PATH = require('path');
const dirTree = require('directory-tree');
const fse = require('fs-extra');
// const hljs =


// const SuperExpressive = require('super-expressive');

// Mettre une icoone plus petite avec css
const svgiconsize = 18;
const filesvg = `<svg width="${svgiconsize}" height="${svgiconsize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 18H17V16H7V18Z" fill="currentColor" /><path d="M17 14H7V12H17V14Z" fill="currentColor" /><path d="M7 10H11V8H7V10Z" fill="currentColor" /><path fill-rule="evenodd" clip-rule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="currentColor" /></svg>`
const foldersvg = `<svg width="${svgiconsize}" height="${svgiconsize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 1.5C2.89543 1.5 2 2.39543 2 3.5V4.5C2 4.55666 2.00236 4.61278 2.00698 4.66825C0.838141 5.07811 0 6.19118 0 7.5V19.5C0 21.1569 1.34315 22.5 3 22.5H21C22.6569 22.5 24 21.1569 24 19.5V7.5C24 5.84315 22.6569 4.5 21 4.5H11.874C11.4299 2.77477 9.86384 1.5 8 1.5H4ZM9.73244 4.5C9.38663 3.9022 8.74028 3.5 8 3.5H4V4.5H9.73244ZM3 6.5C2.44772 6.5 2 6.94772 2 7.5V19.5C2 20.0523 2.44772 20.5 3 20.5H21C21.5523 20.5 22 20.0523 22 19.5V7.5C22 6.94772 21.5523 6.5 21 6.5H3Z" fill="currentColor" /></svg>`

var hljs = require('highlight.js') // https://highlightjs.org/
var MarkdownIt = require('markdown-it');
const op = require("katex");
var md = new MarkdownIt('commonmark', {
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return '<pre class="hljs"><code>' + hljs.highlight(str, {language: lang}).value + '</code></pre>';
            } catch (__) {
            }
        }

        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    }
});

// var { markdownItTable } = require('markdown-it-table');
// md.use(markdownItTable);


// --dark, --jump, --choosetheme, --setinfolder [wharfolder], //TODO --hilight --render-math
// faire un truc pour mettre les css et js dans un dossier
// mettre les images dans un dossier
// EndGame
// faire un spearator pour load que une partie (https://katex.org/docs/autorender.html)


//toc cookie
//mode imprimante/pdf


//Linker
//


function tocItemToHtml(pagetoc, currentLevel) {
    let text = "<ul>";
    let itemsindented = [];
    for (let i = 0; i < pagetoc.length; i++) {
        if (pagetoc[i].level === currentLevel) {
            text += tocItemToHtml(itemsindented, currentLevel + 1);
            text += '<li class="level-' + pagetoc[i].level + '"><a href="#' + pagetoc[i].id + '">' + pagetoc[i].title + "</a> <span class='tocIdInfo'>(" + pagetoc[i].id + ")</span></li>";
            itemsindented = [];
        } else if (pagetoc[i].level > currentLevel) {
            itemsindented.push(pagetoc[i]);
        } else {
            text += "<li><a href='#" + pagetoc[i].id + "'>" + pagetoc[i].title + "</a></li>";
        }
    }
    if (itemsindented.length > 0) {
        text += tocItemToHtml(itemsindented, currentLevel + 1);
    }

    return text + "</ul>";
}

function titleToId(s, pagetoc) {
    let id = s.toLowerCase().replace(/[^\w-]+/g, '-');
    if (pagetoc.find(item => item.id === id)) {
        id = titleToId(s + '-', pagetoc);
    }
    return id;
}

function mdToHtml(input, output, options, profondeur) {
    let setInFolder;
    let whatfolder;
    let imports = "";
    let profondeur_text = profondeur ? "../".repeat(profondeur) : "";
    // if (options.includes('--toc')) {
    //     md.use(require("markdown-it-anchor").default)
    //     md.use(require("markdown-it-table-of-contents"));

    // }

    fs.readFile(input, 'utf8', (err, data) => {
        if (err) throw err;
        let pagedata = data;
        let pagehasmath = false;
        let pagetoc = [];
        let pagesplited = pagedata.split('\n');
        pagedata = "\n" + pagedata

        // pagedata = "\n" + pagedata.replace(/\n/g, '\n\n');
        pagedata = pagedata.replace(/\n(#{1,6})\s(.+)\n/g, (match, p1, p2) => {
            let id = titleToId(p2, pagetoc);
            pagetoc.push({level: p1.length, id: id, title: p2});
            return "\n" + p1 + " " + p2 + "<a id='" + id + "'></a>\n";
        });

        /*for (let i = 0; i < pagesplited.length; i++) {
            pagesplited[i].replace(/^(#{1,6})\s(.+)$/g, (match, p1, p2) => {
                pagetoc.push({level: p1.length, id: String(p2).trim().toLowerCase().replace(/\s+/g, '-').replace('"', '%22'), title: p2});
                return '';
            });
        }*/
        let tmptocitem = tocItemToHtml(pagetoc, 0, pagetoc.length, 1);

        // TODO: let title = tmptocitem[0].title;
        if (!pagedata.includes('[[TOC]]')) {
            pagedata = "<div id='TocItem'>"+tmptocitem +"</div>"+ '\n' + pagedata
        }

        // md.use(require("markdown-it-table-of-contents"));
        //detecter un tableau

        if (options.isMathRender) {
            pagedata = pagedata.replace(/\$\$([^$]*)\$\$/g, (match, p1) => {
                pagehasmath = true;
                return katex.renderToString(p1, {
                    throwOnError: false
                });
            });
            pagedata = pagedata.replace(/&([^$&\r\n]*)&/g, (match, p1) => {
                pagehasmath = true;
                return katex.renderToString(asciiMath.parse(p1), {
                    throwOnError: false
                });
            });
            pagedata = pagedata.replace(/\$([^$&\n\r]*)\$/g, (match, p1) => {
                pagehasmath = true;
                return katex.renderToString(p1, {
                    throwOnError: false
                });
            });
        }
        pagedata = md.render(pagedata);

        /*if (options.includes('--jump')) {
            pagedata = pagedata.replace(/\n/g, '<br>');
        }*/  // pose un ptoblemen dans le render de pagedata replace assci math

        //<!--<link href="https://unpkg.com/@primer/css@^16.0.0/dist/primer.css" rel="stylesheet" />-->
        //<!--<link rel="stylesheet" href="https://unpkg.com/@highlightjs/cdn-assets@11.4.0/styles/default.min.css">-->
        if (options.isMathRender) {
            if (options.setinfolder) {
                imports = `
                    <link rel="stylesheet" href="${profondeur_text+options.setinfolder + "/css/katex.min.css"}" crossorigin="anonymous">
                    <script defer src="${profondeur_text+options.setinfolder + "/js/katex.min.js"}" integrity="sha384-VQ8d8WVFw0yHhCk5E8I86oOhv48xLpnDZx5T9GogA/Y84DcCKWXDmSDfn13bzFZY" crossorigin="anonymous"></script>
                    <script defer src="${profondeur_text+options.setinfolder + "/js/auto-render.min.js"}" integrity="sha384-+XBljXPPiv+OzfbB3cVmLHf4hdUFHlWNZN5spNQ7rmHTXpd7WvJum6fIACpNNfIR" crossorigin="anonymous" />
                    <script defer src="${profondeur_text+options.setinfolder + "/js/asciimath2tex.umd.js"}"</script>

                `
            } else {
                imports = `
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.15.2/dist/katex.min.css" integrity="sha384-MlJdn/WNKDGXveldHDdyRP1R4CTHr3FeuDNfhsLPYrq2t0UBkUdK2jyTnXPEK1NQ" crossorigin="anonymous">
                    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.15.2/dist/katex.min.js" integrity="sha384-VQ8d8WVFw0yHhCk5E8I86oOhv48xLpnDZx5T9GogA/Y84DcCKWXDmSDfn13bzFZY" crossorigin="anonymous"></script>
                    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.15.2/dist/contrib/auto-render.min.js" integrity="sha384-+XBljXPPiv+OzfbB3cVmLHf4hdUFHlWNZN5spNQ7rmHTXpd7WvJum6fIACpNNfIR" crossorigin="anonymous"/>
                    <script defer src="https://unpkg.com/asciimath2tex@1.2.1/dist/asciimath2tex.umd.js"></script>
                `
            }
        }
        if (options.setinfolder) {
            imports += `
                <link rel="stylesheet" href="${profondeur_text+options.setinfolder + "/css/primer.css"}">
                <link rel="stylesheet" href="${profondeur_text+options.setinfolder + "/css/highlightjs.css"}">
                <link rel="stylesheet" href="${profondeur_text+options.setinfolder + "/css/global.css"}">
                <script src="${profondeur_text+options.setinfolder + "/js/highlight.min.js"}"></script>
            `
        } else {
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
                    function changetheme(theme, nochangecookie){
                        if(theme.substring(0,4) === 'dark'){
                            document.documentElement.setAttribute("data-color-mode", "dark");
                            document.documentElement.setAttribute("data-dark-theme", theme);
                        } else {
                            document.documentElement.setAttribute("data-color-mode", "light");
                            document.documentElement.setAttribute("data-light-theme", theme);
                        }
                        if(nochangecookie){
                            return;
                        }
                        document.cookie = "theme="+theme+"; path=/";
                        // hljs.highlightAll();
                        
                    }
                    function load_cookie(){
                        document.cookie.split(';').forEach(function(c) {
                            var m = c.trim().match(/theme=(.*)/);
                            if(m) {
                                changetheme(m[1]);
                            }else{
                                changetheme(${options.isDark ? "'dark'" : "'light'"})
                            }
                        });
                   }
                    load_cookie();
                    document.onkeyup = function(e) {
                      if (e.key === "d") {
                          changetheme("dark");
                      }
                      if (e.key === "l") {
                          changetheme("light");
                      }
                      if (e.key === "D") {
                          changetheme("dark_dimmed");
                      }
                      if(e.key === "p"){
                          if(document.getElementById("header").style.display === "none"){
                              document.getElementById("header").style.display = "block";
                              document.getElementById("TocItem").style.display = "block";
                              load_cookie()
                          }else{
                              document.getElementById("header").style.display = "none";
                              document.getElementById("TocItem").style.display = "none";
                              changetheme("light", true);
                          }
                          
                      }
                    };
                    
                    // TO KNOW: Si la page se reload en boucle, c'est probablement a cause de ceci
                    // TOKNOW: If the page keeps reloading, it's probably because of this
                    let currLocation = window.location.href.split('#')[1];
                    if(currLocation){ 
                        setTimeout(function(){
                            window.location.href="#"+currLocation;
                        }, 1000);
                    }
                </script>
            </head>
            <body>
            <header id="header">
                <a href="index.html">BACK</a>
                ${options.isChooseTheme ? `
                <div class="themechose unselectable">
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
                
                <div class="tocAddOrRemoveLevel unselectable">
                    <p>
                        <a onclick="addTocLevel(false)" class="theme-button">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12C4 11.4477 4.44772 11 5 11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H5C4.44772 13 4 12.5523 4 12Z" fill="currentColor" /></svg>                        </a>
                        <span id="numberTocLevel">.</span>
                        <a onclick="addTocLevel(true)" class="theme-button">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11H13V5C13 4.44772 12.5523 4 12 4Z" fill="currentColor" />
                            </svg>
                        </a>
                    </p>
                </div>
                </header>
                <article class="markdown-body">
                    ${pagedata}
                </article>
                <script>
                    let currentTocLevel = 6;
                    function nodisplayTocEltLevel(level){
                        for(let i = level; i <= 6; i++){
                            Array.from(document.getElementsByClassName("level-"+i)).map(item => {
                                item.style.display = "none"
                            })
                        }
                        for(let i = level; i >= 1; i--){
                            Array.from(document.getElementsByClassName("level-"+i)).map(item => {
                                item.style.display = ""
                            })
                        }
                    }
                    function addTocLevel(isAdd){
                        if(isAdd){
                            currentTocLevel = Math.min(currentTocLevel+1, 6)
                        }
                        else{
                            currentTocLevel = Math.max(currentTocLevel-1, 1)
                        }
                        nodisplayTocEltLevel(currentTocLevel)
                        document.getElementById("numberTocLevel").innerHTML = currentTocLevel
                    }
                   addTocLevel(true);
                    function getQuery(q) {
                       return (window.location.search.match(new RegExp('[?&]' + q + '=([^&]+)')) || [, null])[1];
                    }
                    console.log(getQuery("isprintermode"));
                    if(getQuery("isprintermode") === "true"){
                          document.getElementById("header").style.display = "none";
                          document.getElementById("TocItem").style.display = "none";
                          changetheme("light", true);
                    }
                </script>
            </body>
            <footer id="end"></footerid>
        </html>`
        fs.writeFileSync(output, base_html);
    });
}

function create_dir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function copy_js_css_img(dest) {
    let src = process.argv[1].replace("index.js", "");
    for(let dir of ["css", "js"]) {
        console.log(`copy ${src+dir} to ${dest+dir}`);
        create_dir(dest+dir);
        fse.copy(src+dir, dest+dir, { overwrite: true }, function (err) {
            if (err) {                // ^
                console.error(err);     // |___ // add if you want to replace existing folder or file with same name
            } else {
                console.log("\033[33msuccess!\033[0m");
            }
        });
    }
}

function create_linker_page(path, name, filteredTree, options,profondeur, extention) {

    let imports = "";
    let profondeur_text = "../".repeat(profondeur)
    if (options.setinfolder) {
        imports += `
                <link rel="stylesheet" href="${profondeur_text+options.setinfolder + "/css/primer.css"}">
                <link rel="stylesheet" href="${profondeur_text+options.setinfolder + "/css/highlightjs.css"}">
                <link rel="stylesheet" href="${profondeur_text+options.setinfolder + "/css/global.css"}">
                <script src="${profondeur_text+options.setinfolder + "/js/highlight.min.js"}"></script>
            `
    } else {
        imports += `
                <style>${fs.readFileSync("./css/primer.css", "utf-8")}</style>
                <style>${fs.readFileSync('./css/highlightjs.css', 'utf8')};</style>
                <style>${fs.readFileSync('./css/global.css', 'utf8')}</style>
                <script src="https://unpkg.com/@highlightjs/cdn-assets@11.4.0/highlight.min.js"></script>
            `
    }
    let pagedata = `<!doctype html>
            <html lang="fr">
            <head>
                <meta charset="utf-8">
                <title>${name}</title>
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
                    }
                    function load_cookie(){
                        document.cookie.split(';').forEach(function(c) {
                            var m = c.trim().match(/theme=(.*)/);
                            if(m) {
                                changetheme(m[1]);
                            }else{
                                changetheme(${options.isDark ? "'dark'" : "'light'"})
                            }
                        });
                   }
                    load_cookie();
                    document.onkeyup = function(e) {
                      if (e.key === "m") {
                          changetheme("dark");
                      }
                    };
                </script>
            </head>
            <body>
                ${profondeur!==0 ? '<a href="../index.html">BACK</a>' : ''}
                ${options.isChooseTheme ? `
                <div class="themechose unselectable">
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
                <!--<a href="index.html">BACK</a>-->
                </br></br>
    `
    for(let i = 0; i < filteredTree.length; i++){
        let item = filteredTree[i]
        if(item.type === "directory") {
            pagedata += `<a href="${item.name}/index.html" class="linker-link">${foldersvg} ${item.name}</a><br>\n`
        }else{
            if(item.extension) {
                switch (item.extension) {
                    case ".md":
                    case ".py":
                        pagedata += `<a href="${item.name}.html" class="linker-link">${filesvg} ${item.name}</a><br>\n`
                        break;
                    case ".html": // inutile for now
                    case ".pdf":
                    case ".png":// inutile for now
                    case ".jpg":// inutile for now
                        pagedata += `<a href="${item.name}" class="linker-link">${filesvg} ${item.name}</a><br>\n`
                        break;
                    default:
                        console.log("connais pas")
                }
            }
        }
    }


    pagedata += `
        <footer id="end"></footerid>
    </body>
</html>`
    create_dir(path)
    fs.writeFileSync(path+"/index.html", pagedata);
}

function py_to_html(path, dest, options,profondeur){
    let imports = "";
    let profondeur_text = "../".repeat(profondeur)
    if (options.setinfolder) {
        imports += `
            <link rel="stylesheet" href="${profondeur_text+options.setinfolder + "/css/primer.css"}">
            <link rel="stylesheet" href="${profondeur_text+options.setinfolder + "/css/highlightjs.css"}"> <!--// onload="hljs.highlightAll()">-->
            <link rel="stylesheet" href="${profondeur_text+options.setinfolder + "/css/global.css"}">
            <script src="${profondeur_text+options.setinfolder + "/js/highlight.min.js"}" onload="hljs.highlightAll()"></script>
        `
    } else {
        imports += `
            <!-- TODO: TOFIX: Ne marche plus-->
            <style>${fs.readFileSync("./css/primer.css", "utf-8")}</style>
            <style>${fs.readFileSync('./css/highlightjs.css', 'utf8')};</style>
            <style>${fs.readFileSync('./css/global.css', 'utf8')}</style>
            <script src="https://unpkg.com/@highlightjs/cdn-assets@11.4.0/highlight.min.js"></script>
        `
    }
    let pagedata = `<!doctype html>
        <html lang="fr">
        <head>
            <meta charset="utf-8">
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
                }
                function load_cookie(){
                    document.cookie.split(';').forEach(function(c) {
                        var m = c.trim().match(/theme=(.*)/);
                        if(m) {
                            changetheme(m[1]);
                        }else{
                            changetheme(${options.isDark ? "'dark'" : "'light'"})
                        }
                    });
               }
                load_cookie();
                document.onkeyup = function(e) {
                  if (e.key === "m") {
                      changetheme("dark");
                  }
                };
            </script>
        </head>
        <body>
        
            ${profondeur!==0 ? '<a href="../index.html">BACK</a>' : ''}
            ${options.isChooseTheme ? `
            <div class="themechose unselectable">
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
            </br></br>`
    pagedata += "<pre><code class=\"python\">"
    pagedata += fs.readFileSync(path, "utf-8")
    pagedata += "</code></pre>\n"
    pagedata += `
            <footer id="end"></footerid>
        </body>
    </html>`
    create_dir(path)
    fs.writeFileSync(dest, pagedata);
}

function copyFile(src, dest){
    fs.copyFile(src, dest, (err) => {
        if (err) throw err;
        console.log(src,'was copied to', dest);
    });
}

function recursive_create_linker(filteredTree, output_path, options, profondeur){
    //profondeur = profondeur c'est le nombre de ../ pour remonter a la source

    if(filteredTree.type === "file"){
        if(filteredTree.extension) {
            switch (filteredTree.extension) {
                case ".md":
                    mdToHtml(filteredTree.path, output_path + "/" + filteredTree.name + ".html", options, profondeur)
                    console.log("rendered " + filteredTree.name)
                    break;
                case ".html": // inutile for now
                case ".pdf":
                    copyFile(filteredTree.path, output_path + "/" + filteredTree.name)
                    break;
                case ".png":// inutile for now
                case ".jpg":// inutile for now
                    break;
                case ".py":
                    // copyFile(filteredTree.path, output_path + "/" + filteredTree.name)
                    py_to_html(filteredTree.path, output_path + "/" + filteredTree.name+".html", options, profondeur)
                    break;
                default:
                    console.log("connais pas")
            }
        }
    }
    else{
        if(filteredTree.name === "notes") {
            create_linker_page(output_path, filteredTree.name, filteredTree.children, options, profondeur + 0)
            filteredTree.children.map(item => {
                recursive_create_linker(item, output_path, options, profondeur + 0)
            })
        }else if(filteredTree.name === "exports"){
            0;
        }else {
            create_linker_page(output_path + "/" + filteredTree.name, filteredTree.name, filteredTree.children, options, profondeur + 1)
            filteredTree.children.map(item => {
                recursive_create_linker(item, output_path + "/" + filteredTree.name, options, profondeur + 1)
                //path = output_path+"/"+item.name
                //recursive_create_linker(item, output_path)
            })
        }
    }
}
function linker(folder, folder_output, options) {
    const filteredTree = dirTree(folder, {
        attributes: ["size", "type", "extension"],
        // Mettre     ↓ options.extension / "/\.(md|js|html|java|py|rb)$/"
        extensions: /\.(md|pdf|py)$/
    });
    // fs.writeFileSync("/tmp/index.json", JSON.stringify(filteredTree))
    if(filteredTree.type === "file"){
        mdToHtml(filteredTree.path, folder_output+"/"+filteredTree.name+".html", options, 0)
    }
    else{
        recursive_create_linker(filteredTree, folder_output, options, 0);
    }
    copy_js_css_img(folder_output+"/"+options.setinfolder+"/")
}

function optsCreator(optionsPure, elt, isIt2Elt) {
    if (optionsPure.includes(elt)) {
        if (isIt2Elt) {
            let element = optionsPure[optionsPure.indexOf(elt) + 1]
            let afterSplice = optionsPure.splice(optionsPure.indexOf(elt) + 1);
            afterSplice.shift()
            let beforeSplice = optionsPure.splice(0, optionsPure.indexOf(elt));
            optionsPure.splice(0, 0, ...beforeSplice, ...afterSplice)
            optionsPure.pop()
            return element;
        } else {
            let afterSplice = optionsPure.splice(optionsPure.indexOf(elt) + 1);
            let beforeSplice = optionsPure.splice(0, optionsPure.indexOf(elt));
            optionsPure.splice(0, 0, ...beforeSplice, ...afterSplice)
            optionsPure.pop()
            return true;
        }
    }
    return false;
}

function main() {
    let optionsPure = process.argv.slice(2);
    let options = {};
    if (optsCreator(optionsPure, "--help", false)) {
        console.log('Usage: node index.js inputfile [outputfile|0] [--help] [--version]');
        return;
    } else if (optsCreator(optionsPure, "--version", false)) {
        console.log('1.0.1');
        return;
    }
    // Verifier les fichier si il exsiste et si on peut le mettre a l'interieur (exsist/perms)
    options.input       = optsCreator(optionsPure, "-i",            true);
    options.output      = optsCreator(optionsPure, "-o",            true);
    options.setinfolder = optsCreator(optionsPure, "--setinfolder", true);
    if (!(options.input && options.output)) {
        console.log("Usage: node index.js -i <input> -o <output> [options]")
        return 0;
    }
    if (options.setinfolder === undefined) {
        console.log("Set in folder Usage: node index.js -i <input> -o <output> \033[33m--setinfolder [folder]\033[0m [options]")
        return 0;
    }
    options.isDark        = optsCreator(optionsPure, "--dark",        false);
    options.isChooseTheme = optsCreator(optionsPure, "--choosetheme", false);
    options.isToc         = optsCreator(optionsPure, "--toc",         false);
    options.isMathRender  = optsCreator(optionsPure, "--render-math", false);
    options.extensions    = /\.md$/;

    if(optsCreator(optionsPure, "--linker", false)){
        console.log("linker", options.input, options.output, options);
        linker(options.input, options.output, options);
    }else{
        mdToHtml(options.input, options.output, options);
    }
    if(optionsPure.length !== 0){
        console.log("Options pas Utilisées: \033[31m"+optionsPure+"\033[0m")
    }
}


main();
// vim