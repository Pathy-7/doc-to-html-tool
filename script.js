const inputText = document.getElementById("inputText");
const outputHtml = document.getElementById("outputHtml");
const convertBtn = document.getElementById("convertBtn");
const copyBtn = document.getElementById("copyBtn");

convertBtn.addEventListener("click", () => {
    const text = inputText.value;
    if(!text) return alert("Please paste Word content first!");
    
    // 将文本换行转换成 <p>，简单处理
    let htmlContent = text
        .split(/\r?\n/)
        .filter(line => line.trim() !== "")
        .map(line => `<p>${line}</p>`)
        .join("\n");

    // 创建虚拟 DOM 处理 H2/H3、TOC、图片
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    processH2H3(doc);
    replaceImages(doc);
    buildAndInsertTOC(doc);

    outputHtml.value = doc.body.innerHTML;
});

// 复制 HTML
copyBtn.addEventListener("click", () => {
    outputHtml.select();
    document.execCommand("copy");
    alert("HTML copied to clipboard!");
});

// ------------------------ H2/H3 处理 ------------------------
function processH2H3(doc){
    const h2s = doc.querySelectorAll("h2");
    h2s.forEach((h2, h2Index) => {
        h2.className = "line-h2";
        h2.id = `part${h2Index+1}`;

        let h3Index = 1;
        let next = h2.nextElementSibling;
        while(next && next.tagName.toLowerCase() !== "h2") {
            if(next.tagName.toLowerCase() === "h3") {
                next.className = "star-title";
                next.id = `${h2Index+1}.${h3Index}`;

                const span = doc.createElement("span");
                span.textContent = h3Index;
                const text = next.textContent;
                next.textContent = "";
                next.appendChild(span);
                next.appendChild(document.createTextNode(" " + text));

                h3Index++;
            }
            next = next.nextElementSibling;
        }
    });
}

// ------------------------ 图片替换 ------------------------
function replaceImages(doc){
    const imgs = doc.querySelectorAll("img");
    imgs.forEach(img => {
        const alt = img.alt || "";
        const wrapper = doc.createElement("p");
        wrapper.className = "text-center amplify-wraper";

        const picture = doc.createElement("picture");
        const source = doc.createElement("source");
        source.type = "image/webp";
        source.srcset = "PLACEHOLDER_WEBP";

        const newImg = doc.createElement("img");
        newImg.loading = "lazy";
        newImg.src = "PLACEHOLDER_PNG";
        newImg.alt = alt;

        picture.appendChild(source);
        picture.appendChild(newImg);
        wrapper.appendChild(picture);

        img.parentNode.replaceChild(wrapper, img);
    });
}

// ------------------------ 目录 TOC ------------------------
function buildAndInsertTOC(doc){
    const h2s = doc.querySelectorAll("h2");
    if(!h2s.length) return;

    const container = doc.createElement("div");
    container.className = "collapse active";

    const title = doc.createElement("h4");
    title.className = "collapse-title";
    title.textContent = "Table of Contents";
    container.appendChild(title);

    const content = doc.createElement("div");
    content.className = "collapse-content";
    content.style.display = "block";

    h2s.forEach((h2, h2Index) => {
        const p = doc.createElement("p");
        p.className = "collapse-p";
        p.innerHTML = `<b>Part ${h2Index+1}:</b><a href="#${h2.id}"> ${h2.textContent}</a>`;
        content.appendChild(p);

        const h3s = [];
        let next = h2.nextElementSibling;
        while(next && next.tagName.toLowerCase() !== "h2") {
            if(next.tagName.toLowerCase() === "h3") h3s.push(next);
            next = next.nextElementSibling;
        }

        if(h3s.length){
            const ol = doc.createElement("ol");
            ol.className = "collapse-ol list-paddingleft-2";
            h3s.forEach(h3 => {
                const li = doc.createElement("li");
                li.innerHTML = `<a href="#${h3.id}">${h3.textContent}</a>`;
                ol.appendChild(li);
            });
            content.appendChild(ol);
        }
    });

    container.appendChild(content);
    h2s[0].parentNode.insertBefore(container, h2s[0]);
}
