            import {
    auth,
    db,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    addDoc
} from "../firebase.js";


const loginBox = document.getElementById("loginBox");
const dashboard = document.getElementById("dashboard");

const emailInput = document.getElementById("adminEmail");
const passwordInput = document.getElementById("adminPassword");

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const ordersContainer =
document.getElementById("ordersContainer");
const ordersSection =
document.getElementById("ordersSection");

const productsSection =
document.getElementById("productsSection");


const ordersTab =
document.getElementById("ordersTab");


const productsTab =
document.getElementById("productsTab");


const addProductBtn =
document.getElementById("addProductBtn");

// LOGIN

loginBtn.onclick = async()=>{

try{

await signInWithEmailAndPassword(
    auth,
    emailInput.value,
    passwordInput.value
);

}
catch(error){

document.getElementById("loginError").textContent =
error.message;

}

};


// CHECK LOGIN

onAuthStateChanged(auth,(user)=>{

if(user){

loginBox.style.display="none";
dashboard.style.display="block";

loadOrders();

}

else{

loginBox.style.display="block";
dashboard.style.display="none";

}

});


// LOGOUT

logoutBtn.onclick=()=>{

signOut(auth);

};

ordersTab.onclick = ()=>{

ordersSection.style.display="block";
productsSection.style.display="none";

};


productsTab.onclick = ()=>{

ordersSection.style.display="none";
productsSection.style.display="block";

loadProducts();

};

// LOAD ORDERS

async function loadOrders(){

ordersContainer.innerHTML = "Loading orders...";


const snapshot = await getDocs(collection(db,"orders"));


if(snapshot.empty){

ordersContainer.innerHTML = "<p>No orders found.</p>";
return;

}


ordersContainer.innerHTML = "";


snapshot.forEach((docSnap)=>{


const order = docSnap.data();


const orderDate = order.createdAt?.seconds
? new Date(order.createdAt.seconds * 1000).toLocaleString()
: "Date unavailable";



const products = order.items.map(item => `

<li>
${item.name} × ${item.qty} 
- Rs ${item.price * item.qty}
</li>

`).join("");



ordersContainer.innerHTML += `

<div class="order-card">


<h3>
Order ID: ${order.id}
</h3>


<p>
📅 Date:
${orderDate}
</p>


<hr>


<h4>
Customer Details
</h4>


<p>
👤 Name:
${order.customer.name}
</p>


<p>
📞 Phone:
${order.customer.phone}
</p>


<p>
🏙 City:
${order.customer.city}
</p>


<p>
📍 Address:
${order.customer.address}
</p>



<h4>
Products
</h4>


<ul>
${products}
</ul>



<h3>
Total:
Rs ${order.total}
</h3>



<p>
Status:

<select onchange="updateStatus('${docSnap.id}',this.value)">


<option value="Pending"
${order.status === "Pending" ? "selected" : ""}>
Pending
</option>


<option value="Confirmed"
${order.status === "Confirmed" ? "selected" : ""}>
Confirmed
</option>


<option value="Delivered"
${order.status === "Delivered" ? "selected" : ""}>
Delivered
</option>


</select>

</p>



<button 
onclick="deleteOrder('${docSnap.id}')"
style="background:#dc2626;">
Delete Order
</button>


</div>

`;

});


}

window.updateStatus = async(id,status)=>{


await updateDoc(
doc(db,"orders",id),
{
status:status
}
);


alert("Status Updated");

loadOrders();

};
window.deleteOrder = async(id)=>{

    try {

        const confirmDelete = confirm(
            "Delete this order?"
        );

        if(!confirmDelete) return;


        await deleteDoc(
            doc(db,"orders",id)
        );


        alert("Order deleted successfully");

        loadOrders();


    } catch(error){

        console.error("Delete failed:", error);

        alert(
            "Delete failed. Check console."
        );

    }

};
window.deleteOrder = async(id)=>{

    try {

        const confirmDelete = confirm(
            "Delete this order?"
        );

        if(!confirmDelete) return;


        await deleteDoc(
            doc(db,"orders",id)
        );


        alert("Order deleted successfully");

        loadOrders();


    } catch(error){

        console.error("Delete failed:", error);

        alert(
            "Delete failed. Check console."
        );

    }

};
addProductBtn.onclick = async()=>{


const product = {

name:
document.getElementById("productName").value.trim(),

category:
document.getElementById("productCategory").value,

brand:
document.getElementById("productBrand").value.trim(),

price:
Number(document.getElementById("productPrice").value),

stock:
Number(document.getElementById("productStock").value),

image:
document.getElementById("productImage").value.trim(),

createdAt:
new Date()

};



try{


await addDoc(
collection(db,"products"),
product
);


alert("Product Added Successfully");



document.getElementById("productName").value="";
document.getElementById("productBrand").value="";
document.getElementById("productPrice").value="";
document.getElementById("productStock").value="";
document.getElementById("productImage").value="";


loadProducts();


}

catch(error){

console.error(error);

alert("Error adding product");

}


};
// ================= ADD PRODUCT =================

if(addProductBtn){

addProductBtn.onclick = async()=>{


const product = {

name: document.getElementById("productName").value.trim(),

category: document.getElementById("productCategory").value,

brand: document.getElementById("productBrand").value.trim(),

price: Number(
document.getElementById("productPrice").value
),

stock: Number(
document.getElementById("productStock").value
),

image: document.getElementById("productImage").value.trim(),

createdAt: new Date()

};



if(!product.name || !product.price){

alert("Please enter product name and price");

return;

}



try{


await addDoc(
collection(db,"products"),
product
);


alert("Product Added Successfully ✅");


// clear form

document.getElementById("productName").value="";
document.getElementById("productBrand").value="";
document.getElementById("productPrice").value="";
document.getElementById("productStock").value="";
document.getElementById("productImage").value="";


// reload products

loadProducts();


}


catch(error){

console.error("Add Product Error:",error);

alert("Failed to add product");

}


};
}
