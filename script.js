/* 页面布局 */
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
}

.container {
    display: flex;
    height: 80vh; /* 页面高度固定，左侧/右侧可滚动 */
}

.editor {
    flex: 1;
    border: 1px solid #ccc;
    margin: 10px;
    padding: 10px;
    overflow-y: auto; /* 左右编辑器都可滚动 */
}

.left-editor {
    background-color: #f9f9f9;
}

.right-editor {
    background-color: #fff;
}

.buttons {
    text-align: center;
    margin: 10px 0;
}

/* H2/H3 样式 */
.line-h2 {
    font-size: 1.5em;
    margin-top: 20px;
    margin-bottom: 10px;
}

.star-title {
    font-size: 1.2em;
    margin-left: 20px;
}

/* Step 段落样式 */
.step {
    background-color: #f0f0f0;
    padding: 5px;
    margin: 10px 0;
}

/* 列表样式 */
.no_disc.has_disc {
    list-style-type: disc;
    margin-left: 20px;
}

.buttons button {
    margin: 0 10px;
    padding: 8px 16px;
    cursor: pointer;
}
