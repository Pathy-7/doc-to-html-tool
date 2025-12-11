// ---------------------- script.js ----------------------

document.getElementById("convertBtn").addEventListener("click", function () {
    const inputEditor = document.getElementById("inputEditor");
    const outputEditor = document.getElementById("outputEditor");

    if (!inputEditor || !outputEditor) return;

    let html = inputEditor.innerHTML;

    // ---------------------- 1. 清理 Word 样式 ----------------------
    function cleanHTML(input) {
        // 移除 class="Mso*"、style、lang 等多余属性
        return input
            .replace(/ class=(")?Mso[a-zA-Z]+(")?/g, "")
            .replace(/ style=(")?[^"]*(")?/g, "")
            .replace(/ lang=(")?[^"]*(")?/g, "")
            .replace(/<o:p>\s*<\/o:p>/g, "")
            .replace(/<span[^>]*>/g, "")
            .replace(/<\/span>/g, "")
            .replace(/<!--\[if !supportLists\]-->.*?<!--\[endif\]-->/g, "");
    }

    html = cleanHTML(html);

    // ---------------------- 2. H2/H3 处理 ----------------------
    function convertH2H3(input) {
        const container = document.createElement("div");
        container.innerHTML = input;

        const h2List = container.querySelectorAll("h2");
        const toc = [];

        h2List.forEach((h2, indexH2) => {
            const partId = `part${indexH2 + 1}`;
            h2.className = "line-h2";
            h2.id = partId;

            // TOC 用
            toc.push({ id: partId, text: h2.textContent, h3: [] });

            const h3List = [];
            // 找到同一个 H2 后面的 H3 直到下一个 H2
            let next = h2.nextElementSibling;
            let h3Counter = 1;
            while (next && next.tagName !== "H2") {
                if (next.tagName === "H3") {
                    next.className = "star-title";
                    next.id = `${indexH2 + 1}.${h3Counter}`;

                    // 添加 span
                    next.innerHTML = `<span>${h3Counter}</span>${next.textContent}`;
                    h3List.push({ id: next.id, text: next.textContent });
                    h3Counter++;
                }
                next = next.nextElementSibling;
            }
            toc[indexH2].h3 = h3List;
        });

        return { html: container.innerHTML, toc: toc };
    }

    const result = convertH2H3(html);
    html = result.html;
    const tocData = result.toc;

    // ---------------------- 3. Step 段落处理 ----------------------
    function convertSteps(input) {
        const container = document.createElement("div");
        container.innerHTML = input;

        container.querySelectorAll("p").forEach((p) => {
            const text = p.textContent;
            const match = text.match(/^Step (\d+):\s*(.*)/i);
            if (match) {
                const stepNum = match[1];
                const stepText = match[2];
                p.className = "step";
                // 保留原文加粗用 <b>
                p.innerHTML = `<b><span>Step ${stepNum}.</span></b> ${stepText}`;
            }
        });

        return container.innerHTML;
    }

    html = convertSteps(html);

    // ---------------------- 4. 图片占位替换 ----------------------
    function convertImages(input) {
        const container = document.createElement("div");
        container.innerHTML = input;

        container.querySelectorAll("img").forEach((img) => {
            const newHTML = `<p class="text-center amplify-wraper">
<picture>
<source type="image/webp" srcset="https://images.famiguard.com/famiguarden/assets/article/mobile-tracker/tmobile-familywhere.webp">
<img loading="lazy" src="https://images.famiguard.com/famiguarden/assets/article/mobile-tracker/tmobile-familywhere.png" alt="${img.alt}">
</picture>
</p>`;
            const wrapper = document.createElement("div");
            wrapper.innerHTML = newHTML;
            img.replaceWith(wrapper.firstElementChild);
        });

        return container.innerHTML;
    }

    html = convertImages(html);

    // ---------------------- 5. TOC 生成 ----------------------
    function generateTOC(tocData) {
        const container = document.createElement("div");
        container.className = "collapse active";
        let tocHTML = `<h4 class="collapse-title">Table of Contents</h4><div class="collapse-content" style="display: block;">`;

        tocData.forEach((h2) => {
            tocHTML += `<p class="collapse-p"><b>${h2.text}:</b><a href="#${h2.id}"> ${h2.text}</a></p>`;
            if (h2.h3.length > 0) {
                tocHTML += `<ol class="collapse-ol list-paddingleft-2">`;
                h2.h3.forEach((h3) => {
                    tocHTML += `<li><a href="#${h3.id}">${h3.text}</a></li>`;
                });
                tocHTML += `</ol>`;
            }
        });

        tocHTML += `</div>`;
        container.innerHTML = tocHTML;
        return container.outerHTML;
    }

    const tocHTML = generateTOC(tocData);

    // ---------------------- 6. 插入 TOC ----------------------
    const container = document.createElement("div");
    container.innerHTML = html;

    const firstH2 = container.querySelector("h2");
    if (firstH2) {
        firstH2.insertAdjacentHTML("beforebegin", tocHTML);
    } else {
        container.insertAdjacentHTML("afterbegin", tocHTML);
    }

    html = container.innerHTML;

    // ---------------------- 输出 ----------------------
    outputEditor.innerHTML = html;
});
