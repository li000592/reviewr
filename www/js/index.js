const app = {
  tempURL:null,
  permFolader: null,
  oldFile:null,
  permFile:null,
  data:[],
  currentPath:null,
  num:null,
  reviews: [],
  KEY: null,
  whichIsClick: null,
  deleteOjb:null,
    // imgPath:null,
  init: () => {
    setTimeout(() => {
      app.addListeners();
      //set key based on device id
      app.KEY = "device" in window ? "REVIEW" + device.uuid : "REVIEWTEMPKEY";
      //check localstorage for list of reviews
      // app.getLocalStorage();
      app.createHomePageList();  
      //add click listeners for navigation
      app.prepareRating();
      app.getPermFolder();
      
    }, 500);
  },
  getPermFolder: () => {
    let path = cordova.file.dataDirectory;
    //save the reference to the folder as a global app property
    resolveLocalFileSystemURL(
      path,
      dirEntry => {
        //create the permanent folder
        dirEntry.getDirectory(
          "images",
          { create: true },
          permDir => {
            app.permFolder = permDir;
            console.log("Created or opened", permDir.nativeURL);
            //check for an old image from last time app ran
            app.loadOldImage();
          },
          err => {
            console.warn("failed to create or open permanent image dir");
          }
        );
      },
      err => {
        console.warn("We should not be getting an error yet");
      }
    );
  },
  loadOldImage: () => {
    //check localstorage to see if there was an old file stored
    let oldFilePath = localStorage.getItem(app.KEY);
    //if there was an old file then load it into the imgFile
    if (oldFilePath) {
      resolveLocalFileSystemURL(
        oldFilePath,
        oldFileEntry => {
          app.oldFileEntry = oldFileEntry;
          // let img = document.getElementById("imgFile");
          img.src = oldFileEntry.nativeURL;
        },
        err => {
          console.warn(err);
        }
      );
    }
  },
  copyImage: ev => {
    ev.preventDefault();
    ev.stopPropagation();
    //copy the temp image to a permanent location
    let fileName = Date.now().toString() + ".png";

    resolveLocalFileSystemURL(
      app.tempURL,
      entry => {
        //we have a reference to the temp file now
        console.log(entry);
        console.log("copying", entry.name);
        console.log(
          "copy",
          entry.name,
          "to",
          app.permFolder.nativeURL + fileName
        );
        //copy the temp file to app.permFolder
        entry.copyTo(
          app.permFolder,
          fileName,
          permFile => {
            //the file has been copied
            //save file name in localstorage
            let path = permFile.nativeURL;
            let currentTime = Date.now()
            let myObj = { 
              id: currentTime,
              // createDate: currentTime.getFullYear() + "-" +currentTime.getMonth+"-"+currentTime.getDate,
              title: document.querySelector("#input").value,
              rating: document.querySelector(".stars").getAttribute("data-rating"),
              imgPath: path
            };

            app.data.push(myObj);
            localStorage.setItem(app.KEY, JSON.stringify(app.data));

            document.getElementById("addImg").src = "./img/add-nothing.svg";
            document.querySelector(".stars").setAttribute("data-rating", "4");
            document.querySelector("#input").value = "";

            app.permFile = permFile;
            console.log(permFile);
            console.log("add", permFile.nativeURL, "to the 2nd image");
            // document.getElementById("imgFile").src = permFile.nativeURL;
            //delete the old image file in the app.permFolder
            if (app.oldFile !== null) {
              app.oldFile.remove(
                () => {
                  console.log("successfully deleted old file");
                  //save the current file as the old file
                  app.oldFile = permFile;
                },
                err => {
                  console.warn("Delete failure", err);
                }
              );
            }
          },
          fileErr => {
            console.warn("Copy error", fileErr);
          }
        );
      },
      err => {
        console.error(err);
      }
    );
  },
  createHomePageList:()=>{
    let reviewList = document.querySelector(".review-list");
    reviewList.textContent= "";
    app.getLocalStorage();
    console.log(app.data);
    // if(app.data.length > 0)
    // {let reviewList = document.querySelector(".review-list");
    if(app.data.length > 0){

    document.getElementById("msg").classList.add("none");
    
    app.data.forEach(element => {   
    console.log("looping the data of card")
    let card = document.createElement("div");
    card.setAttribute("class", "card");
    card.setAttribute("data-target", "details")
    card.setAttribute("card-id", element.id);
    card.addEventListener("click", app.nav);
    let cardImg = document.createElement("img");
    cardImg.setAttribute("class", "card-img");
    cardImg.src = element.imgPath;
    cardImg.alt = "Card images";
    let cardInfo = document.createElement("div");
    cardInfo.setAttribute("class", "card-info")
    let title = document.createElement("p");
    title.textContent = element.title;
    title.setAttribute("class", "cardTitle");//useless?
    let time = document.createElement("p");
    time.setAttribute("class", "card-date");
    time.textContent = element. id;

    reviewList.appendChild(card);
    card.appendChild(cardImg);
    card.appendChild(cardInfo);
    cardInfo.appendChild(title);
    cardInfo.appendChild(time);
    });
  }else{
    document.getElementById("msg").classList.remove("none");
  }
  // }
    
  },
  nav: ev => {
    console.log("NAV")
    let btn = ev.currentTarget;
    console.log("ev target", ev.currentTarget);
    let target = btn.getAttribute("data-target");
    console.log("Navigate to", target);
    document.querySelector(".page.active").classList.remove("active");
    document.getElementById(target).classList.add("active");
    // if(target == "home"){
    //   console.log("target:home")
    //   app.copyImage(ev);
    //   setTimeout(() => {
    //     app.createList(); 
    //   }, 500);
    // if(target == "details"){
      targetTitle =btn.getAttribute("card-id");
      console.log("changing details info")
      console.log(targetTitle)
      app.data.findIndex((element, index) =>{ if(element.id == targetTitle){
        console.log(app.data[index]);
        app.whichIsClick =app.data[index];
        
        document.getElementById("imgDetails").src = app.whichIsClick.imgPath;
        document.getElementById("nameDetails").textContent = app.whichIsClick.title;
        document.getElementById("dateDetails").innerHTML = app.whichIsClick.id;
        console.log(app.whichIsClick.rating);
        document.getElementById("RatingNumDetails").innerHTML = app.whichIsClick.rating;

      }});

    
  // }
},
  getLocalStorage: () => {
    let str = localStorage.getItem(app.KEY);//getItem => get string;
    if(str){
        app.data = JSON.parse(str);
    }
    // if (localStorage.getItem(app.KEY)) {
    //   let str = localStorage.getItem(app.KEY);
    //   app.reviews = JSON.parse(str);
    // }
  },
  prepareRating:()=>{
    let stars = document.querySelectorAll(".star");
    stars.forEach(function(star){
      star.addEventListener("click", app.setRating);
    })
    let rating = parseInt(document.querySelector(".stars").getAttribute("data-rating"));
    let target = stars[rating - 1];
    target.dispatchEvent(new MouseEvent("click"));

  },
  setRating:(ev)=>{
    let span = ev.currentTarget;
    let stars = document.querySelectorAll(".star");
    let match = false;
    let num = 0;
    stars.forEach(function(star, index){
        if(match){
        star.classList.remove("rated");
    }else{
      star.classList.add("rated");
    }
    if(star == span){
      match = true;
      num = index +1;
    }
    let starValue = parseInt(star.getAttribute("date-val"));
  })
  document.querySelector(".stars").setAttribute("data-rating", num)
  },
  addListeners: () => {
    //from home to details
    document.getElementById("btnAdd").addEventListener("click", app.nav);
    //from home to add
    document.getElementById("btnDetailsBack").addEventListener("click", app.nav);
    document.getElementById("msg-btn").addEventListener("click", app.nav);
    //from add to home
    document.getElementById("btnAddBack").addEventListener("click", app.nav);
    document.getElementById("btnSave-header").addEventListener("click", app.saveReviews);
    document.getElementById("btnTakePhoto").addEventListener("click", app.takePhoto);
    document.getElementById("btnSave").addEventListener("click", app.saveReviews);
    //delete
    document.getElementById("btnDelete").addEventListener("click", app.deleteReview);
    document.querySelectorAll(".star").forEach(function(star){
      star.addEventListener("click", app.setRating);
    })
  },
  deleteReview:(ev)=>{
    console.log("function: deleteReview")
      app.data.findIndex((element, index)=>{
        if(element.id == app.whichIsClick.id){
          app.deleteOjb = index;
          console.log(app.deleteOjb);
          app.data.slice(index, 1);
          localStorage.setItem(app.KEY, JSON.stringify(app.data));
          app.createHomePageList(ev);
          app.nav(ev);
        }
      })

  },
  takePhoto:()=>{
    console.log("going take photo!!");
    let options = {
        quality: 80,
        destinationType: Camera.DestinationType.FILE_URI,
        encodingType: Camera.EncodingType.PNG,
        mediaType: Camera.MediaType.PICTURE,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: true,
        targetWidth: 375,
        targetHeight: 375
    }

    navigator.camera.getPicture(app.success, app.fail, options)
  },
  success:(imgURI)=>{
    console.log("success!");
    // document.getElementById("addImg").textContent = imgURI;
    app.tempURL = imgURI;
    document.getElementById("addImg").src = imgURI;
    document.getElementById("addImg").alt = "User's Photo";
  },
  fail:()=>{
      console.log("fail!");
      document.querySelector(".msg").textContent = imgURI;
  },
  saveReviews:(ev)=>{
    console.log("running saveReviews");
    console.log(document.querySelector("#input").value.length );
    // let Addinput = document.querySelector("#input").value;
    // let AddImg = document.getElementById("addImg");
    // console.log(Addinput.length);
    // console.log(AddImg);
    // if(Addinput.length == 0){()=>{console.log("plz, fill up ITEM NAME~")}}
    // else if(AddImg.alt == "addImg-default"){()=>{console.log("plz, take a photo first~")}}
    // else{
      app.nav(ev);
      console.log("function: saveReviews Nav")
      app.copyImage(ev);
      console.log("function: saveReviews CopyImage")
      setTimeout(() => {
        app.createHomePageList();
        console.log("function: saveReviews createHomePageList")

      }, 500);

    // }
  },
  formatted_date:()=>{
    let result="";
    let d = new Date();
    result += d.getFullYear()+"/"+(d.getMonth()+1)+"/"+d.getDate() + 
              " "+ d.getHours()+":"+d.getMinutes()
              // +":"+
              // d.getSeconds()+" "+d.getMilliseconds();
    return result;
  }
};
  const ready = "cordova" in window ? "deviceready" : "DOMContentLoaded";
  document.addEventListener(ready, app.init);