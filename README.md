# Markdown To Html


## Some Rules (Bugs/Features)

Ne pas mettre des fichier avec des # en début de nom  
Not to put files with # in the beginning of the name



Ne pas mettre de nom de dossier "notes" et "exports" il sont réserves


## Dev bugs

- Enlever le .md.html et juste mettre .html 
  - pagedata += `<a href="${item.name}.html" class="linker-link">${item.name}</a><br>\n`
  - mdToHtml(filteredTree.path, output_path + "/" + filteredTree.name + ".html", options, profondeur)
 