let singletonTags = ["meta", "img", "br", "input", "link"];
let tagIdCounter = 0
tagclose = /<\/([A-Z]*)>/gi;


function addEventHandlerToFormat(){
    let formatButton = document.querySelector("#submit")


    formatButton.addEventListener("click", initFormat)
}
function getText() {
    let text = document.querySelector("#source").value


    return text
}
function initFormat(event){
    let text = getText();
    let invalidTag = invalidTagsChecker(text);
    let orphanedTag = checkValidNesting(text);
    if (invalidTag) {
        let errorMessage = `<h3 class="error">Not valid HTML! Unknown tag: < ${invalidTag} ></h3>`
        showText(errorMessage)
    } else if(orphanedTag){
        let errorMessage = `<h3 class='error'>Not valid HTML! No pair for < ${orphanedTag[0]} > !</h3>`
        showText(errorMessage)
    } else {
        text = separateTags(text);
        text = indentText(text);
        text = colorTags(text);
        text = colorAttributes(text);
        showText(text);
        initHover();
        addIDToTags();
    }
}
function showText(text) {
    let target = document.querySelector("#target");

    target.innerHTML = `${text}`

}
function colorTags(text) {
    text = text.replace(/</gi, "front<");
    text = text.replace(/>/gi, ">back");
    text = text.replace(/front</gi, "<xmp class='tag single'><");
    text = text.replace(/>back/gi, "></xmp>");
    return text


}
function colorAttributes(text) {
    text = text.replace(/ [^>]*="[^>]*"/gi, (x) => {
        let separated = x.split(/=| /);
        separated.shift();
        let colored = "</xmp>";
        for (let index = -2; index < separated.length; index++) {
            if (separated[0] != undefined){
                colored += `<xmp class="attribute"> ${separated[0]}=</xmp>`
            } if (separated[1] != undefined) {
                colored += `<xmp class="value">${separated[1]}</xmp>`
            }
            separated = separated.slice(2)
        }
        colored += "<xmp class=\"tag\">"
        return colored
    })
    return text



}
function separateTags(text) {
    text = text.replace(/></g, ">\n<");
    let textArray = text.split("\n");
    textArray = textArray.filter((elem) => {
        return elem != ""
    });
    return textArray.join("\n")


}
function indentText(text) {
    let textArray = text.split("\n");
    let indentCount = 0;
    let tab = "    ";
    let tags = [];
    let tagClosers = [];
    let foundTagClosers = text.matchAll(tagclose);
    for (let elem of foundTagClosers) {
        tagClosers.push(elem[1])
    }
    for (let index = 0; index < textArray.length; index++) {
        let row = textArray[index];
        let tagOpen = row.match(/<([A-Z]*)[^>]*>/i);
        let tagClose = row.match(/<\/([A-Z]*)>/i);
        if (tagOpen) {
            tagOpen = tagOpen[1];
            if (tagClosers.includes(tagOpen)){
                tags.push(tagOpen);
                indentCount++;
            } else {
            }
        }
        let tabulators = tab.repeat(indentCount);
        textArray[index] = tabulators.toString() + row;
        if (tagClose) {
            tagClose = tagClose[0];
            indentCount--;
            tags.pop()
        }
    }
    return textArray.join("\n")


}
function invalidTagsChecker(text) {
    let allowedTags = ['html', 'head', 'meta', 'title', 'script', 'link', 'body', 'div', 'p', 'p1', 'h1', 'h2', 'h3', 'h4',
        'h5', 'h6', 'ul', 'ol', 'li', 'a', 'br', 'strong', 'em', 'span', 'code', 'table', 'tr', 'td', 'form', 'button', 'input', 'option', 'select', 'textarea'];
    let tags = text.matchAll(/<([A-Z]*[0-9]*)[^>]*>/gi);
    for (let elem of tags) {
        if (elem[1] !== "") {
            if(!allowedTags.includes(elem[1])){
                return elem[1]
            }
        }
    }
    return false

}
function checkValidNesting(text) {
    let tagOpens = [];
    let tagClosers = [];
    let allTags = [];
    for (let tag of text.matchAll(/<([A-Z]*[0-9]*)[^>]*>/gi)){
        if (tag[1] !== "" && !singletonTags.includes(tag[1])) {
            tagOpens.push(tag[1])
            allTags.push("<" + tag[1] + ">")
        } else if(tag[0].charAt(1) == "/") {
            allTags.push(tag[0])
        }
    }
    for (let tag of text.matchAll(/<\/([A-Z]*[0-9]*)[^>]*>/gi)) {
        tagClosers.push(tag[1])
    }
    let remainingOpen = tagOpens.filter( n => !tagClosers.includes(n));
    let remainingClose = tagClosers.filter( n => !tagOpens.includes(n));
    if (remainingOpen.length !== 0) {
        return [remainingOpen[0]]
    } else if(remainingClose.length !== 0) {
        return [remainingClose[0]]
    }
    for (let index = 0; index < allTags.length - 1; index++) {
        let tag = allTags[index];
        let nextTag = allTags[index + 1];
        if (tag.charAt(1) !== "/" && nextTag.charAt(1) === "/") {
            let strippedNextTag = removeCharacter(nextTag, 1);
            if (tag !== strippedNextTag) {
                let tagName = removeCharacter(tag, 0);
                tagName = removeCharacter(tagName, tagName.length-1);
                console.log(tagName)
                return [tagName]
            } else {
                allTags.splice(index, 2);
                index -= 2;
            }
        }
    }

    return false
}


function initHover() {
    let tags = document.querySelectorAll(".tag");
    for (let tag of tags) {
        tag.addEventListener("mouseover", mouseOverHandler);
        tag.addEventListener("mouseout", mouseOutHandler)
    }
}


function addIDToTags() {
    let tags = document.querySelectorAll(".tag.single");
    let removed = 0;
    let lastElem = "";
    let lastElemTagName = "";
    for (let tag of tags) {
        let end = tag.innerText.length;
        if (tag.innerText.charAt(end - 1) === ">") {
            end--
        }
        let tagName = tag.innerText.slice(1, end);
        if (singletonTags.includes(tagName)) {
            tag.classList.remove("single");
            tag.classList.add("singleton");
            removed++
        } else if (lastElemTagName === tagName.slice(1)) {
            let tagId = `id${tagIdCounter}`
            lastElem.classList.remove("single");
            lastElem.classList.add(tagId);
            tag.classList.remove("single");
            tag.classList.add(tagId);
            tagIdCounter++;
            removed++;
            break
        } else {
            lastElem = tag;
            lastElemTagName =  tagName
        }
    }
    if (removed !== 0) {
        addIDToTags()
    }
}

function mouseOverHandler(event) {
    let target = event.target
    let classList = event.target.classList;
    if (classList[1] !== "singleton") {
        let tags = document.querySelectorAll(`.tag.${classList[1]}`)
        for (let tag of tags) {
            tag.classList.add("highlighted")
        }
    } else {
        target.classList.add("highlighted")
    }
}


function mouseOutHandler(event) {
    let targets = document.querySelectorAll(".highlighted");
    for (let target of targets) {
        target.classList.remove("highlighted")
    }
}


function removeCharacter(str, pos) {
    let firstPart = str.substring(0, pos);
    let secondPart = str.substring(pos + 1)
    return firstPart + secondPart
}

function initScript() {
    addEventHandlerToFormat()
}

initScript()