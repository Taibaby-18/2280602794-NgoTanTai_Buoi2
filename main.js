const API_URL = "http://localhost:3000";

// Biến toàn cục để lưu trữ dữ liệu
let currentPosts = [];
let currentComments = [];

// ================= PHẦN 1: QUẢN LÝ POSTS =================

function loadPosts() {
    fetch(`${API_URL}/posts`)
        .then(res => res.json())
        .then(posts => {
            currentPosts = posts; // Lưu dữ liệu để dùng cho việc tính ID và Sửa
            const list = document.getElementById("postList");
            list.innerHTML = "";

            // Sắp xếp ID giảm dần để bài mới nhất lên đầu (tùy chọn)
            posts.sort((a, b) => Number(b.id) - Number(a.id));

            posts.forEach(post => {
                const li = document.createElement("li");
                
                // [YÊU CẦU 2]: Hiển thị post xóa mềm (có gạch ngang)
                // Nếu isDeleted = true thì thêm class .deleted (trong CSS đã có gạch ngang)
                if (post.isDeleted) {
                    li.classList.add("deleted");
                }

                // Giao diện từng dòng
                li.innerHTML = `
                    <div class="post-info">
                        <strong>${post.title}</strong> 
                        <span class="post-meta">(${post.views} views) - ID: ${post.id}</span>
                        ${post.isDeleted ? '<span style="color:red; font-size:12px"> (Đã xóa mềm)</span>' : ''}
                    </div>
                    <div class="actions">
                        ${
                            // Kiểm tra trạng thái để hiện nút bấm phù hợp
                            post.isDeleted
                            ? `
                                <button onclick="restorePost('${post.id}')">♻ Khôi phục</button>
                                <button class="btn-delete" onclick="hardDeletePost('${post.id}')">❌ Xóa vĩnh viễn</button>
                              `
                            : `
                                <button class="btn-edit" onclick="startEditPost('${post.id}')">✏ Sửa</button>
                                <button class="btn-delete" onclick="softDeletePost('${post.id}')">🗑 Xóa</button>
                              `
                        }
                    </div>
                `;
                list.appendChild(li);
            });
        })
        .catch(err => alert("Lỗi tải Posts: Bạn đã bật json-server chưa?"));
}

function addPost() {
    const title = document.getElementById("titleInput").value;
    const views = document.getElementById("viewsInput").value;

    if (!title) return alert("Vui lòng nhập tiêu đề!");

    // [YÊU CẦU 3]: Làm ID tự tăng bằng maxId + 1, lưu là chuỗi
    // Tìm số lớn nhất trong danh sách ID hiện tại
    const maxId = currentPosts.length > 0 
        ? Math.max(...currentPosts.map(p => Number(p.id))) 
        : 0;
    
    const newId = String(maxId + 1); // Chuyển thành chuỗi theo đề bài

    fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: newId,          // ID tự tăng
            title: title,
            views: Number(views) || 0,
            isDeleted: false    // Mặc định tạo mới là chưa xóa
        })
    })
    .then(() => {
        // Reset ô nhập và tải lại danh sách
        document.getElementById("titleInput").value = '';
        document.getElementById("viewsInput").value = '';
        loadPosts();
    });
}

// [YÊU CẦU 1]: Chuyển xóa cứng thành xóa mềm (isDeleted: true)
function softDeletePost(id) {
    if (!confirm("Chuyển bài viết này vào thùng rác?")) return;

    fetch(`${API_URL}/posts/${id}`, {
        method: "PATCH", // Dùng PATCH để chỉ sửa 1 trường
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: true }) // Đánh dấu là đã xóa
    }).then(() => loadPosts());
}

function restorePost(id) {
    fetch(`${API_URL}/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: false }) // Khôi phục lại
    }).then(() => loadPosts());
}

function hardDeletePost(id) {
    if (!confirm("CẢNH BÁO: Xóa vĩnh viễn không thể khôi phục!")) return;
    fetch(`${API_URL}/posts/${id}`, {
        method: "DELETE"
    }).then(() => loadPosts());
}

function startEditPost(id) {
    const post = currentPosts.find(p => String(p.id) === String(id));
    if (!post) return;

    const newTitle = prompt("Sửa tiêu đề:", post.title);
    if (newTitle === null) return;
    
    const newViews = prompt("Sửa views:", post.views);
    
    fetch(`${API_URL}/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: newTitle,
            views: Number(newViews)
        })
    }).then(() => loadPosts());
}

// ================= PHẦN 2: QUẢN LÝ COMMENTS (CRUD ĐẦY ĐỦ) =================
// [YÊU CẦU 4]: Thực hiện toàn bộ thao tác CRUD với comments

// 1. READ (Xem)
function loadComments() {
    fetch(`${API_URL}/comments`)
        .then(res => res.json())
        .then(comments => {
            currentComments = comments;
            const list = document.getElementById("commentList");
            list.innerHTML = "";

            comments.forEach(c => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <div class="post-info">
                        ${c.text} <span class="post-meta">#PostID: ${c.postId}</span>
                    </div>
                    <div class="actions">
                        <button class="btn-edit" onclick="startEditComment('${c.id}')">Sửa</button>
                        <button class="btn-delete" onclick="deleteComment('${c.id}')">Xóa</button>
                    </div>
                `;
                list.appendChild(li);
            });
        });
}

// 2. CREATE (Thêm)
function addComment() {
    const text = document.getElementById("commentText").value;
    const postId = document.getElementById("commentPostId").value;

    if (!text || !postId) return alert("Nhập nội dung và ID bài viết!");

    // Logic ID tự tăng cho comment tương tự post
    const maxId = currentComments.length > 0 
        ? Math.max(...currentComments.map(c => Number(c.id))) 
        : 0;
    const newId = String(maxId + 1);

    fetch(`${API_URL}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: newId, text, postId })
    }).then(() => {
        document.getElementById("commentText").value = '';
        document.getElementById("commentPostId").value = '';
        loadComments();
    });
}

// 3. UPDATE (Sửa)
function startEditComment(id) {
    const comment = currentComments.find(c => String(c.id) === String(id));
    if (!comment) return;

    const newText = prompt("Sửa nội dung comment:", comment.text);
    if (newText === null || newText.trim() === "") return;

    fetch(`${API_URL}/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newText })
    }).then(() => loadComments());
}

// 4. DELETE (Xóa)
function deleteComment(id) {
    if (!confirm("Xóa comment này?")) return;
    fetch(`${API_URL}/comments/${id}`, {
        method: "DELETE"
    }).then(() => loadComments());
}

// Khởi chạy ứng dụng
loadPosts();
loadComments();