import {
    auth,
    db,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    collection,
    getDocs,
    doc,
    updateDoc
} from "../firebase.js";


const loginBox = document.getElementById("loginBox");
const dashboard = document.getElementById("dashboard");

const emailInput = document.getElementById("adminEmail");
const passwordInput = document.getElementById("adminPassword");

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const ordersContainer =
document.getElementById("ordersContainer");


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



// LOAD ORDERS

async function loadOrders(){

ordersContainer.innerHTML="";


const snapshot =
await getDocs(collection(db,"orders"));


snapshot.forEach((docSnap)=>{


const order = docSnap.data();


ordersContainer.innerHTML += `

<div class="order-card">

<h3>
Order: ${order.id}
</h3>


<p>
Customer:
${order.customer.name}
</p>


<p>
Phone:
${order.customer.phone}
</p>


<p>
Total:
Rs ${order.total}
</p>


<p>
Status:
<select onchange="updateStatus('${docSnap.id}',this.value)">

<option ${order.status=="Pending"?"selected":""}>
Pending
</option>

<option ${order.status=="Confirmed"?"selected":""}>
Confirmed
</option>

<option ${order.status=="Delivered"?"selected":""}>
Delivered
</option>

</select>

</p>


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
