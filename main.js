async function LoadData() {
    let res = await fetch("http://localhost:3000/posts")
    let posts = await res.json();
    let body = document.getElementById("body_table");
    body.innerHTML = '';
    for (const post of posts) {
        body.innerHTML += `<tr>
            <td>${post.id}</td>
            <td>${post.title}</td>
            <td>${post.views}</td>
           <td><input type="submit" value="Delete" onclick="Delete( ${post.id})"/></td>
        </tr>`
    }

}
async function Save() {
    let id = document.getElementById("id_txt").value;
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("view_txt").value;
    let getItem = await fetch('http://localhost:3000/posts/' + id)
    if (getItem.ok) {
        let res = await fetch('http://localhost:3000/posts/'+id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                views: views
            })
        });
        if (res.ok) {
            console.log("Thanh cong");
        }
    } else {
        try {
            let res = await fetch('http://localhost:3000/posts', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: id,
                    title: title,
                    views: views
                })
            });
            if (res.ok) {
                console.log("Thanh cong");
            }
        } catch (error) {
            console.log(error);
        }
    }
    LoadData();
    return false;



}
async function Delete(id) {
    let res = await fetch("http://localhost:3000/posts/" + id, {
        method: 'delete'
    })
    if (res.ok) {
        console.log("Thanh cong");
    }
    LoadData();
    return false;
}
LoadData();