function tableView()
{
    this.content = null;
}

tableView.prototype.createTable = function()
{
    var tbl = document.createElement("table");
    tbl.setAttribute("class", "table table-hover");

    var tblHead = document.createElement("thead");
    var headTr = document.createElement("tr");

    for(var i=0; i < this.content.data[0].fields.length; i++){
      var headTh = document.createElement("th");
      var txtNode = document.createTextNode(this.content.data[0].fields[i].description);
      headTh.appendChild(txtNode);
      headTr.appendChild(headTh);
    }

    tblHead.appendChild(headTr);
    tbl.appendChild(tblHead);
  

    var tblBody = document.createElement("tbody");

    for(var i = 0; i < this.content.data.length; i++ ){
        var bodyTR = document.createElement("tr");
        for(var f=0; f < this.content.data[i].fields.length; f++){
          
          var bodyTD = document.createElement("td");
          var bodyTxtNode = document.createTextNode(this.content.data[i].fields[f].value);
          bodyTD.appendChild(bodyTxtNode);
          bodyTR.appendChild(bodyTD);
        }
        tblBody.appendChild(bodyTR);
    }

    tbl.appendChild(tblBody);  
    return tbl;   
}

function notificationBox()
{
  this.success = true;
  this.message = "";
}

notificationBox.prototype.createNotification = function()
{
  var notifyBox = document.createElement("div");
  var buttonItem = document.createElement("button");
  var messageItem = document.createElement("strong");

  if(this.success){
    notifyBox.setAttribute("class","alert alert-success alert-dismissible fade show");
    messageItem.appendChild(document.createTextNode("Success!  "));
  }
  else{
    notifyBox.setAttribute("class","alert alert-warning alert-dismissible fade show");
    messageItem.appendChild(document.createTextNode("Warning!  "));
  }

  buttonItem.setAttribute("type","button");
  buttonItem.setAttribute("class","close");
  buttonItem.setAttribute("data-dismiss","alert");
  buttonItem.innerHTML = "&times;";
  
  notifyBox.appendChild(buttonItem);
  notifyBox.appendChild(messageItem);
  notifyBox.appendChild(document.createTextNode(this.message));
  
  return notifyBox;

}

window.addEventListener("load",function(){
    getTables();
})


var typechange = function(elm)
{  
  if(elm.value == "List")
    list.style.display = "block";
  else
    list.style.display = "none";
}


addlist.addEventListener("click",function(){
   
    var item = listItem.firstElementChild;
    var child = item.cloneNode(true);
  
    child.lastElementChild.value = "";
    listItem.appendChild(child);

})

removelist.addEventListener("click",function(){
  
  
  if(listItem.childElementCount > 1)
    listItem.removeChild(listItem.lastElementChild) 

})

menuAdd.addEventListener("click",function(){
  tableDesigner.style.display = "block";
  dynafield.style.display = "none";
})

save.addEventListener("click",function(){
    
  var table = {
    name: document.getElementById("tablename").value,
    description: document.getElementById("tbldescription").value,
    fields: []
  }
  
  var names = document.getElementsByName("fieldname");
  var description = document.getElementsByName("flddescription");
  var type = document.getElementsByName("fieldtype");
  var visible = document.getElementsByName("fieldvisible");
  var required = document.getElementsByName("fieldrequired");
  var unique = document.getElementsByName("fieldunique");

  
  for(var i=0; i < names.length; i++)
  {
      var field = {
          name: names[i].value,
          description: description[i].value,
          type: type[i].value,
          unique: unique[i].value,
          visible: visible[i].value,
          required: required[i].value,
          value: ""
      }

      table.fields.push(field);
  }

   var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 

    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {          
            tableDesigner.style.display = "none";           
            
            var obj = JSON.parse(this.responseText);
            //(obj.result);
            
            if(obj.result == "OK")            
              notify("Add Operation",true);
            else             
              notify("Add Operation failed.",false)

            getTables();
        }
      };

      xmlhttp.open("POST", "api/add");
      xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xmlhttp.send(JSON.stringify(table));

})

var notify = function(msg,success)
{
  var notifyBox = new notificationBox();
  
  notifyBox.success = success;
  notifyBox.message = msg;
  var elem = notifyBox.createNotification();
  notification_section.appendChild(elem);
  
  setTimeout(function(){notification_section.removeChild(elem);},4000);
}

var dynamicFields = function(fields){
  
  while(dynamic.firstElementChild){
    dynamic.removeChild(dynamic.firstElementChild)
  }

  for(var i = 0; i < fields.length; i++)
  {
    
       var item = document.createElement("div");
       var description = fields[i].description;
       item.innerHTML = 
      '<div class="form-group">'+
        '<label for="dynaname">'+ description +'</label>'+
        '<input type="text" class="form-control" name="dynaname">'+
      '</div>';   


      dynamic.appendChild(item); 
  }
}

var localdetails = null;

var showDetails = function(val)
{
    //hide 
    tableDesigner.style.display = "none";
    result.style.display = "none";

    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 

    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {   

            var details = JSON.parse(this.responseText);
            localdetails = details;
          
            dynamicFields(details.data[0].fields);
            editfields.innerHTML = details.data[0].description;
            dynafield.style.display = "block";
        }
      };

      xmlhttp.open("GET", "api/details?tablename="+val );
      xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xmlhttp.send();

}

var addmenu = function(items)
{
  
  items.table.sort(function (a, b) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
  });

  var menu = document.getElementById("menuId");

  while(menu.firstElementChild){
    menu.removeChild(menu.firstElementChild)
  }
  
  for(var i = 0; i < items.table.length; i++)
  {   
      var tbl = items.table[i];
      var item = document.createElement("a");
      var text = document.createTextNode(tbl);

      item.setAttribute("class", "dropdown-item");
      item.setAttribute("onclick", "showDetails('" + tbl +"')" )
      item.setAttribute("href","#");
      item.id = tbl;

      item.appendChild(text);      
      menu.appendChild(item);
  }        
}

var getTables = function()
{
    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 

    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            addmenu(data);
        }
      };

    xmlhttp.open("POST", "api/tables");  
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send();
}

remove.addEventListener("click",function(){
  var tblElement = document.getElementById("tbody");

  if(tblElement.childElementCount > 1)
   tblElement.removeChild(tblElement.lastChild);
})

add.addEventListener("click",function(){

  var tblElement = document.getElementById("tbody");
  var field = document.createElement("tr");
  var number = tblElement.getElementsByTagName("tr");

  number = number.length + 1 ;

  field.innerHTML = 
            '<th scope="row">'+ number +'</th>'+
            '<td><input type="text" class="form-control" name="fieldname"/></td>'+
            '<td><input type="text" class="form-control" name="flddescription"/></td>'+
            '<td>'+
              '<select class="form-control" name="fieldtype">'+
                '<option>String</option>'+
                '<option>Date</option>'+
                '<option>Number</option>'+
                '<option>List</option>'+
                '<option>Lookup</option>'+
              '</select>'+
            '</td>'+
            '<td>'+
              '<select class="form-control" name="fieldunique">'+
                '<option>No</option>'+
                '<option>Yes</option>'+                       
              '</select>'+
            '</td>'+
            '<td>'+
              '<select class="form-control" name="fieldvisible">'+
                '<option>Yes</option>'+
                '<option>No</option>'+                       
              '</select>'+
            '</td>'+
            '<td><select class="form-control" name="fieldrequired">'+
                  '<option>Yes</option>'+
                  '<option>No</option>'+                     
                '</select>'+
            '</td>';       

  tblElement.appendChild(field);

});

querydata.addEventListener("click",function(){

    var fields = document.getElementsByName("dynaname");

        for(var i = 0; i < localdetails.data[0].fields.length; i++){
            localdetails.data[0].fields[i].value = fields[i].value;
        }
    
    delete localdetails.data[0]["_id"];
    console.log(localdetails);

    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 

        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
              listResults(JSON.parse(this.responseText));
            }
          };

    xmlhttp.open("POST", "api/querydata");  
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify(localdetails.data[0]));

})

var listResults = function(obj)
{
  if(obj.data.length == 0)
  {
     result.style.display = "block";
     result.innerHTML = "<div>no match found<div>";
       return;
  }
   
    var table = new tableView();
    table.content = obj;
    result.style.display = "block";
    result.innerHTML = table.createTable().outerHTML;

}

insertdata.addEventListener("click",function()
{
      
    var fields = document.getElementsByName("dynaname");

    for(var i = 0; i < localdetails.data[0].fields.length; i++){
      localdetails.data[0].fields[i].value = fields[i].value;
    }
    

    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 

    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           
            var obj = JSON.parse(this.responseText);
            
            if(obj.result == "OK"){
            
              notify("Insert Operation complete",true)
              dynafield.style.display = "none";
            }
            else
              notify("Insert Operation failed",false)
        }
      };

    xmlhttp.open("POST", "api/insertdata");  
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    delete localdetails.data[0]["_id"];
    xmlhttp.send(JSON.stringify(localdetails.data[0]));

})

