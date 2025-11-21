// ------------------------ 获取元素 ------------------------
const inputEditor = document.getElementById("inputEditor"); // 左侧富文本 div
const outputHtml = document.getElementById("outputHtml");   // 右侧 textarea
const convertBtn = document.getElementById("convertBtn");   // 转换按钮
const copyBtn = document.getElementById("copyBtn");         // 复制按钮

// ------------------------ 点击 Convert ------------------------
convertBtn.addEventListener("click", () => {
    const htmlContent = inputEditor.innerHTML;
    if (!htmlContent.trim()) return alert("Please paste Word content first!");

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    // ---------- 1. 彻底清理 Word HTML ----------
    cleanWordHTML(doc);

    // ---------- 2. H2/H3 自动编号和样式 ----------
    processH2H3(doc);

    // ---------- 3. 图片占位符替换 ----------
    replaceImages(doc);

    // ---------- 4. 生成目录 TOC ----------
    buildAndInsertTOC(doc);

    // 输出最终干净 HTML
    outputHtml.value = doc.body.innerHTML;
});

// ------------------------ 点击 Copy ------------------------
copyBtn.addEventListener("click", () => {
    outputHtml.select();
    document.execCommand("copy");
    alert("HTML copied to clipboard!");
});

// ------------------------ 彻底清理 Word HTML ------------------------
function cleanWordHTML(doc) {
    const whitelist = ["p","h2","h3","img"]; // 允许保留的标签

    function recursiveClean(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const tag = node.tagName.toLowerCase();

            if (whitelist.includes(tag)) {
                // 保留标签，但清空所有属性
                for (let attr of Array.from(node.attributes)) {
                    node.removeAttribute(attr.name);
                }
                // 递归处理子节点
                Array.from(node.childNodes).forEach(child => recursiveClean(child));
            } else if (tag === "br") {
                // 保留换行
                return;
            } else {
                // 非白名单 → 替换为文本节点
                const text = node.textContent;
                const textNode = doc.createTextNode(text);
                node.parentNode.replaceChild(textNode, node);
            }
        }
    }

    Array.from(doc.body.childNodes).forEach(child => recursiveClean(child));
}

// ------------------------ H2/H3 处理 ------------------------
function processH2H3(doc) {
    const h2s = doc.querySelectorAll("h2");
    h2s.forEach((h2, h2Index) => {
        h2.className = "line-h2";
        h2.id = `part${h2Index + 1}`;

        let h3Index = 1;
        let next = h2.nextElementSibling;
        while (next && next.tagName.toLowerCase() !== "h2") {
            if (next.tagName.toLowerCase() === "h3") {
                next.className = "star-title";
                next.id = `${h2Index + 1}.${h3Index}`;

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
function replaceImages(doc) {
    const imgs = doc.querySelectorAll("img");
    imgs.forEach(img => {
        const alt = img.alt || "";
        const wrapper = doc.createElement("p");
        wrapper.className = "text-center amplify-wraper";

        const picture = doc.createElement("picture");
        const source = doc.createElement("source");
        source.type = "image/webp";
        source.srcset = "PLACEHOLDER_WEBP"; // 可手动替换

        const newImg = doc.createElement("img");
        newImg.loading = "lazy";
        newImg.src = "PLACEHOLDER_PNG";    // 可手动替换
        newImg.alt = alt;

        picture.appendChild(source);
        picture.appendChild(newImg);
        wrapper.appendChild(picture);

        img.parentNode.replaceChild(wrapper, img);
    });
}

// ------------------------ 目录 TOC ------------------------
function buildAndInsertTOC(doc) {
    const h2s = doc.querySelectorAll("h2");
    if (!h2s.length) return;

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
        p.innerHTML = `<b>Part ${h2Index + 1}:</b><a href="#${h2.id}"> ${h2.textContent}</a>`;
        content.appendChild(p);

        const h3s = [];
        let next = h2.nextElementSibling;
        while (next && next.tagName.toLowerCase() !== "h2") {
            if (next.tagName.toLowerCase() === "h3") h3s.push(next);
            next = next.nextElementSibling;
        }

        if (h3s.length) {
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
