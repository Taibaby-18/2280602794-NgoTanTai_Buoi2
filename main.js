function LoadData() {
    fetch("https://api.escuelajs.co/api/v1/products")
        .then(
            function (res) {
                return res.json();
            }
        ).then(
            function (products) {
                let body = document.getElementById("body_table");
                body.innerHTML = '';
                for (const product of products) {
                    body.innerHTML +=
                        `<tr>
                        <td>${product.id}</td>
                        <td>${product.title}</td>
                        <td>${product.slug}</td>
                        <td>${product.price}</td>
                        <td>${product.description}</td>
                        <td>${product.category.name}</td>
                        <td>
                         <img style="width:60px" src="${product.images[0]}"/>
                        </td>
                   </tr>`
                }
            }
        )
}
LoadData();