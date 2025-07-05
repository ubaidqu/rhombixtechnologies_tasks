const inputBox=document.getElementById("input-box");
const listContainer=document.getElementById("list-container");

function addtask()
{
    if(inputBox.value==='')
    {
        alert("Please enter a task");
        
    }
    else
    {
        const task = document.createElement("li");
        task.innerHTML=inputBox.value;
        listContainer.appendChild(task);
        let span=document.createElement("span")
        span.innerHTML="\u00d7";
        task.appendChild(span)
      
    }
    inputBox.value='';
    saveData();
}

listContainer.addEventListener("click",function(e)
{
    if(e.target.tagName==="LI")
    {
        e.target.classList.toggle("checked");
        saveData();
    }
    else if(e.target.tagName==="SPAN")
    {
        e.target.parentElement.remove();
        saveData();
    }
},false)


function saveData(){
    localStorage.setItem("data",listContainer.innerHTML);
}

function loadData(){
    listContainer.innerHTML=localStorage.getItem("data");
}

loadData();