chrome.runtime.onMessage.addListener(gotMessage);

/* Global variable use to store PCR CPR and IV data for one whole day.
  And do not orerwrite on recursion calls 
*/
let PCR = [];
let CPR = [];
let xCord = [];
let checkedIVPut = [{ id: "dummy" }];
let checkedIVCall = [{ id: "dummy" }];
let strikePriceTrackArr = [];

/* Activator snippnet
   Activate the script
*/
function gotMessage(message, sender, sendResponse) {
  if (message.text === "go") {
    console.log("Pluto Activated");

    console.log(
      "Made by shubhamcodex - https://github.com/imshubhamcodex/Pluto---Chain-data-Analytics"
    );

    /*Today's date validation creation  */
    let dateSplitArr = Date(Date.now()).toString().split(" ");
    let todayDate =
      dateSplitArr[0] + dateSplitArr[1] + dateSplitArr[2] + dateSplitArr[3];

    if (todayDate !== localStorage.getItem("PCRSavedDate")) {
      localStorage.removeItem("PCRData");
      localStorage.removeItem("CPRData");
      localStorage.removeItem("PCRxCord");
      localStorage.removeItem("checkedIVPutData");
      localStorage.removeItem("checkedIVCallData");
      localStorage.removeItem("strikePriceTrackArr");
      localStorage.removeItem("PCRSavedDate");
      localStorage.setItem("PCRSavedDate", todayDate);
    } else {
      strikePriceTrackArr = JSON.parse(
        localStorage.getItem("strikePriceTrackArr")
      );
    }

    if (strikePriceTrackArr == null || strikePriceTrackArr.length == 0) {
      let price = Number(
        document
          .getElementById("equity_underlyingVal")
          .textContent.split(" ")[1]
          .replaceAll(",", "")
      );
      let roundStrike = price - price % 50;

      strikePriceTrackArr = [
        {
          price: roundStrike - 200,
          valueCall: [],
          valuePut: []
        },
        {
          price: roundStrike - 150,
          valueCall: [],
          valuePut: []
        },
        {
          price: roundStrike - 100,
          valueCall: [],
          valuePut: []
        },
        {
          price: roundStrike - 50,
          valueCall: [],
          valuePut: []
        },
        {
          price: roundStrike,
          valueCall: [],
          valuePut: []
        },
        {
          price: roundStrike + 50,
          valueCall: [],
          valuePut: []
        },
        {
          price: roundStrike + 100,
          valueCall: [],
          valuePut: []
        },
        {
          price: roundStrike + 150,
          valueCall: [],
          valuePut: []
        },
        {
          price: roundStrike + 200,
          valueCall: [],
          valuePut: []
        },
        {
          price: roundStrike + 250,
          valueCall: [],
          valuePut: []
        }
      ];
      localStorage.setItem(
        "strikePriceTrackArr",
        JSON.stringify(strikePriceTrackArr)
      );
    }
    runme();
  }
}

/* Main entry point */
function runme() {
  /* For refresh */
  document.getElementsByClassName("refreshIcon")[0].click();
  strikePriceTrackArr = JSON.parse(localStorage.getItem("strikePriceTrackArr"));
  /* Delay to complete the document load */
  setTimeout(() => {
    try {
      /* Removing unnecassy UI elements */
      document.getElementsByClassName(
        "container top_logomenu"
      )[0].style.display =
        "none";
      document.getElementsByClassName("setting_btn")[0].style.display = "none";
      document.getElementsByClassName("feedbackIconBtn")[0].style.display =
        "none";
      document.getElementsByClassName("loginIconBtn")[0].style.display = "none";

      document.getElementsByClassName(
        "container navlinks-container posrel"
      )[0].style.display =
        "none";
      document.getElementsByClassName("nav nav-tabs")[0].style.display = "none";
      document.getElementsByClassName("notranslate")[0].style.paddingTop =
        "0px";

      /* Now Action begain to read data table*/
      let table1 = document.getElementById("optionChainTable-indices");

      let header = table1.children[0].children[1];
      table1.children[0].children[0].innerHTML = `<th class="text-center" id="calls" colspan="4">CALLS</th>
        <th class="text-center" id="puts" colspan="5">PUTS</th>`;

      /* Get todays date used to track and update localstorage data for only this whole day  */
      let dateSplitArr = Date(Date.now()).toString().split(" ");
      let todayDate =
        dateSplitArr[0] + dateSplitArr[1] + dateSplitArr[2] + dateSplitArr[3];

      /* Removing other unimportant elements from headers*/
      Array.from(header.children).forEach((e, i) => {
        if (
          i !== 1 &&
          i !== 2 &&
          i !== 4 &&
          i !== 11 &&
          i !== 21 &&
          i !== 20 &&
          i !== 18
        ) {
          header.removeChild(e);
        } else {
          if (i === 1 || i === 21) {
            e.style.width = "22%";
          } else {
            e.style.width = "12%";
          }
        }
      });

      let price = Number(
        document
          .getElementById("equity_underlyingVal")
          .textContent.split(" ")[1]
          .replaceAll(",", "")
      );
      let roundStrike = price - price % 50;

      let body = table1.children[1];
      let strikeIndex = 0;

      /* Getting latest strike price */
      Array.from(body.children).forEach((e, i) => {
        let testStrike = Number(
          e.children[11].children[0].textContent.replaceAll(",", "")
        );
        if (testStrike === roundStrike) {
          strikeIndex = i;
        }
        let index = -1;
        if (
          strikePriceTrackArr.some(function(obj, j) {
            if (obj.price == testStrike) {
              index = j;
              return true;
            }
          })
        ) {
          let coi = Number(e.children[2].textContent.replaceAll(",", ""));
          strikePriceTrackArr[index].valueCall.push(coi);
          coi = Number(e.children[20].textContent.replaceAll(",", ""));
          strikePriceTrackArr[index].valuePut.push(coi);
        }
      });

      /* Removing unimportant elements from main data table*/
      Array.from(body.children).forEach((e, i) => {
        if (i < strikeIndex - 6 || i > strikeIndex + 7) {
          body.removeChild(e);
        } else {
          Array.from(e.children).forEach((ele, j) => {
            if (
              j !== 1 &&
              j !== 2 &&
              j !== 4 &&
              j !== 11 &&
              j !== 21 &&
              j !== 20 &&
              j !== 18
            ) {
              e.removeChild(ele);
            } else {
              if (j === 1 || j === 21) {
                ele.style.width = "22%";
              } else {
                ele.style.width = "12%";
              }
            }
          });
        }
      });

      let allStrikePrices = [];
      /* Adding checkbox in IV column */
      Array.from(body.children).forEach((e, i) => {
        e.children[4].innerHTML += `<input style="float:right;" type="checkbox" id="IVP${i}"  value="${e
          .children[4].textContent}">`;
        e.children[2].innerHTML += `<input style="float:right;" type="checkbox" id="IVC${i}"  value="${e
          .children[2].textContent}">`;
        allStrikePrices.push(e.children[3].textContent);
      });

      /* Calculation change in COI percentage and adding UP DOWN marker */
      let COIArrCall = [];
      let COIArrPut = [];
      let callOIArr = [];
      let putOIArr = [];
      Array.from(body.children).forEach(e => {
        let oiCall = Number(e.children[0].textContent.replaceAll(",", ""));
        let coiCall = Number(e.children[1].textContent.replaceAll(",", ""));
        let coiPerCall = coiCall * 100 / (oiCall - coiCall);

        e.children[1].textContent += " (" + coiPerCall.toFixed(2) + "%)";
        if (coiPerCall < 0) {
          e.children[1].innerHTML += `<span style='float:right; color:red'>▼</span>`;
        } else {
          e.children[1].innerHTML += `<span style='float:right; color:green'>▲</span>`;
        }
        callOIArr.push(oiCall);
        COIArrCall.push(coiPerCall.toFixed(2));

        let oiPut = Number(e.children[6].textContent.replaceAll(",", ""));
        let coiPut = Number(e.children[5].textContent.replaceAll(",", ""));
        let coiPerPut = coiPut * 100 / (oiPut - coiPut);

        e.children[5].textContent += " (" + coiPerPut.toFixed(2) + "%)";
        if (coiPerPut < 0) {
          e.children[5].innerHTML += `<span style='float:right; color:red'>▼</span>`;
        } else {
          e.children[5].innerHTML += `<span style='float:right; color:green'>▲</span>`;
        }
        putOIArr.push(oiPut);
        COIArrPut.push(coiPerPut.toFixed(2));
      });

      /* Changing background color or OI to represent bulish and brearish sentiments */
      Array.from(body.children).forEach((e, i) => {
        callOIArr.sort(function(a, b) {
          return b - a;
        });
        putOIArr.sort(function(a, b) {
          return b - a;
        });

        let maxOI = callOIArr[0];
        let oiCall = Number(e.children[0].textContent.replaceAll(",", ""));
        let change = oiCall * 100 / maxOI;

        e.children[0].style.position = "relative";
        e.children[0].innerHTML += `<div style="position:absolute;top:2px; height:76%;
            width:${change}%;background:rgba(255,0,0,${change === 100
          ? "0.5"
          : "0.3"});z-index:999; border-top-right-radius:8px; border-bottom-right-radius:8px; ">
          &nbsp;</div>`;

        maxOI = putOIArr[0];
        oiCall = Number(e.children[6].textContent.replaceAll(",", ""));
        change = oiCall * 100 / maxOI;

        e.children[6].style.position = "relative";
        e.children[6].innerHTML += `<div style="position:absolute;top:2px; height:76%; right:0px;
          width:${change}%;background:rgba(0,255,0,${change === 100
          ? "0.5"
          : "0.3"});z-index:999; border-top-left-radius:8px; border-bottom-left-radius:8px; ">
          &nbsp;</div>`;
      });

      /* Marking top 4 best COI as bold */
      COIArrCall.sort(function(a, b) {
        return b - a;
      });
      COIArrPut.sort(function(a, b) {
        return b - a;
      });
      let totalCallCOI = 0;
      let totalPutCOI = 0;
      let top5CallCOI = 0;
      let top5PutCOI = 0;
      let allCallCOI = [];
      let allPutCOI = [];
      let allCallCOIDup = [];
      let allPutCOIDup = [];

      Array.from(body.children).forEach(ele => {
        allCallCOI.push(
          Number(ele.children[1].textContent.split(" ")[0].replaceAll(",", ""))
        );

        allPutCOI.push(
          Number(ele.children[5].textContent.split(" ")[0].replaceAll(",", ""))
        );
      });

      allCallCOIDup = [...allCallCOI];
      allPutCOIDup = [...allPutCOI];

      allCallCOI.sort(function(a, b) {
        return b - a;
      });
      allPutCOI.sort(function(a, b) {
        return b - a;
      });

      top5CallCOI =
        allCallCOI[0] +
        allCallCOI[1] +
        allCallCOI[2] +
        allCallCOI[3] +
        allCallCOI[4];
      top5PutCOI +=
        allPutCOI[0] +
        allPutCOI[1] +
        allPutCOI[2] +
        allPutCOI[3] +
        allPutCOI[4];

      Array.from(body.children).forEach((ele, i) => {
        let actual = ele.textContent.split(" ")[1].split(")")[0] + ")";
        totalCallCOI += Number(
          ele.textContent.split(" ")[0].split("\n")[1].replaceAll(",", "")
        );
        totalPutCOI += Number(
          ele.children[5].textContent.split(" ")[0].replaceAll(",", "")
        );

        if (
          actual === "(" + COIArrCall[0] + "%)" ||
          actual === "(" + COIArrCall[1] + "%)" ||
          actual === "(" + COIArrCall[2] + "%)" ||
          actual === "(" + COIArrCall[3] + "%)"
        ) {
          ele.children[1].style.fontWeight = "bold";
        }

        actual = ele.textContent.split(" ")[2].split(")")[0] + ")";

        if (
          actual === "(" + COIArrPut[0] + "%)" ||
          actual === "(" + COIArrPut[1] + "%)" ||
          actual === "(" + COIArrPut[2] + "%)" ||
          actual === "(" + COIArrPut[3] + "%)"
        ) {
          ele.children[5].style.fontWeight = "bold";
        }
      });

      /* Adding hover effect and sentiments on each strike price*/
      let element = document.getElementsByTagName("tr");
      Array.from(element).forEach((e, i) => {
        e.addEventListener("mouseover", function() {
          e.style.backgroundColor = "grey";

          if (i === 0 || i === element.length - 1) {
            return;
          }

          let oiCall = e.children[0].textContent.replaceAll(",", "");
          let coiCall = e.children[1].textContent
            .split(" ")[0]
            .replaceAll(",", "");
          let coiPerCall = e.children[1].textContent
            .split(" ")[1]
            .split(")")[0]
            .replaceAll(/[(%]/g, "");

          let oiPut = e.children[6].textContent.replaceAll(",", "");
          let coiPut = e.children[5].textContent
            .split(" ")[0]
            .replaceAll(",", "");
          let coiPerPut = e.children[5].textContent
            .split(" ")[1]
            .split(")")[0]
            .replaceAll(/[(%]/g, "");

          if (
            oiCall * 0.3 +
              coiCall * 0.6 +
              coiPerCall * 0.1 -
              (oiPut * 0.3 + coiPut * 0.6 + coiPerPut * 0.1) >=
              0 &&
            Math.abs(coiCall / coiPut) >= 1.4
          ) {
            e.style.backgroundColor = "rgba(255,0,0,0.2)";
          } else if (
            oiCall * 0.3 +
              coiCall * 0.6 +
              coiPerCall * 0.1 -
              (oiPut * 0.3 + coiPut * 0.6 + coiPerPut * 0.1) <
              0 &&
            Math.abs(coiPut / coiCall) >= 1.4
          ) {
            e.style.backgroundColor = "rgba(0,255,0,0.2)";
          } else {
            e.style.backgroundColor = "silver";
          }
        });
        e.addEventListener("mouseout", function() {
          e.style.backgroundColor = "initial";
        });
      });

      document.getElementById(
        "equityOptionChainTotalRow-PE-totVol"
      ).style.display =
        "none";
      document.getElementById(
        "equityOptionChainTotalRow-CE-totVol"
      ).style.display =
        "none";

      /* Modifing data table header on PCR and CPR value */

      table1.children[0].children[0].innerHTML = `<th class="text-center" id="calls" colspan="4"> ${totalCallCOI >
        totalPutCOI && Math.abs(top5CallCOI / top5PutCOI) >= 4
        ? "<span style='color:red; font-weight:bold;'>[CALLS Dominating ▼]</span>"
        : "CALLS Combined CPR: " +
          Math.abs(top5CallCOI / (2.5 * top5PutCOI)).toFixed(2)}</th>
      <th class="text-center" id="puts" colspan="5"> ${totalCallCOI <
        totalPutCOI && Math.abs(top5PutCOI / top5CallCOI) >= 4
        ? "<span style='color:#7fff00; font-weight:bold;'>[PUTS Dominating ▲]</span>"
        : "PUTS Combined PCR: " +
          Math.abs(top5PutCOI / (2.5 * top5CallCOI)).toFixed(2)}</th>`;

      /* Saving and fetching IV data from in localstorage  */

      if (localStorage.getItem("checkedIVPutData") !== null) {
        checkedIVPut = JSON.parse(localStorage.getItem("checkedIVPutData"));
        checkedIVCall = JSON.parse(localStorage.getItem("checkedIVCallData"));
      } else {
        checkedIVPut = [{ id: "dummy" }];
        checkedIVCall = [{ id: "dummy" }];
      }

      checkedIVPut.forEach(e => {
        if (e.id !== "dummy") {
          document.getElementById(e.id).checked = true;
          let newIV = document.getElementById(e.id).parentNode.textContent;
          e.value.push(Number(newIV));
        }
      });

      checkedIVCall.forEach(e => {
        if (e.id !== "dummy") {
          document.getElementById(e.id).checked = true;
          let newIV = document.getElementById(e.id).parentNode.textContent;
          e.value.push(Number(newIV));
        }
      });

      /* Saving and fetching PCR CPR data in from localstorage */
      if (localStorage.getItem("PCRData") !== null) {
        PCR = JSON.parse(localStorage.getItem("PCRData"));
        CPR = JSON.parse(localStorage.getItem("CPRData"));
        xCord = JSON.parse(localStorage.getItem("PCRxCord"));
      } else {
        PCR = [];
        CPR = [];
        xCord = [];
      }

      PCR.push((top5PutCOI / (2.5 * top5CallCOI)).toFixed(2));
      CPR.push((top5CallCOI / (2.5 * top5PutCOI)).toFixed(2));
      xCord.push(Date(Date.now()).toString().split(" ")[4]);

      /* Removing PCR CPR IV data if date does NOT match */
      if (todayDate !== localStorage.getItem("PCRSavedDate")) {
        PCR.push((top5PutCOI / (2.5 * top5CallCOI)).toFixed(2));
        CPR.push((top5CallCOI / (2.5 * top5PutCOI)).toFixed(2));
        xCord.push(Date(Date.now()).toString().split(" ")[4]);
      } else {
        localStorage.setItem("PCRData", JSON.stringify(PCR));
        localStorage.setItem("CPRData", JSON.stringify(CPR));
        localStorage.setItem("PCRxCord", JSON.stringify(xCord));
      }

      /* 
    
    Chart Plot segement 
    
    */
      document.getElementById("EqNote").innerHTML = `
      <canvas style="height:600px;"  id="chart-change-in-oi"> </canvas>
    <br />
    <br />
    <br />

    <canvas style="height:600px;"  id="chart-call-put-ratio-chart-both"> </canvas>

    <br />
    <br />
    <br />

          
    <canvas style="height:600px;"  id="chart-coi-call"> </canvas>
    <br />
    <br />
    <br />

    <canvas style="height:600px;"  id="chart-coi-put"> </canvas>


    <br />
    <br />
    <br />

    <canvas style="height:600px;"  id="chart-put-call"> </canvas>

    <br />
    <br />
    <br />

    <canvas style="height:600px;"  id="chart-IV"> </canvas>
    `;

      /* Threshold arr created */
      let arrThres = new Array(xCord.length);

      let yCordCallCOI = [];
      let yCordPutCOI = [];

      strikePriceTrackArr.forEach((ele, i) => {
        let colorArr = [
          "rgba(255, 99, 132, 0.8)",
          "rgba(255, 159, 64, 0.8)",
          "rgba(255, 205, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(153, 102, 255, 0.8)",
          "rgba(201, 203, 207, 1)",
          "rgba(0, 255, 0, 0.8)",
          "rgba(0, 0, 0, 0.8)",
          "rgba(0, 128, 128, 0.8)"
        ];

        if (ele.valueCall.length > xCord.length) {
          ele.valueCall = ele.valueCall.slice(xCord.length - 1);
          ele.valuePut = ele.valuePut.slice(xCord.length - 1);
        } else {
          let len = xCord.length - ele.valueCall.length;

          for (let k = 0; k < len; k++) {
            ele.valueCall.unshift(0);
            ele.valuePut.unshift(0);
          }
        }

        let objCall = {
          label: "Call Price " + ele.price,
          backgroundColor: colorArr[i],
          borderColor: colorArr[i],
          data: ele.valueCall
        };
        let objPut = {
          label: "Put Price " + ele.price,
          backgroundColor: colorArr[i],
          borderColor: colorArr[i],
          data: ele.valuePut
        };
        yCordCallCOI.push(objCall);
        yCordPutCOI.push(objPut);
      });

      let data = {
        labels: xCord,
        datasets: yCordCallCOI
      };
      let config = {
        type: "line",
        data,
        options: {
          responsive: false,
          plugins: {
            legend: {
              position: "top",
              align: "start",
              labels: {
                padding: 10
              }
            },
            title: {
              display: true,
              text: Date(Date.now()) + " CALL COI DATA ",
              align: "start"
            }
          },
          maintainAspectRatio: false
        }
      };

      new Chart(document.getElementById("chart-coi-call"), config);

      data = {
        labels: xCord,
        datasets: yCordPutCOI
      };
      config = {
        type: "line",
        data,
        options: {
          responsive: false,
          plugins: {
            legend: {
              position: "top",
              align: "start",
              labels: {
                padding: 10
              }
            },
            title: {
              display: true,
              text: Date(Date.now()) + " PUT COI DATA ",
              align: "start"
            }
          },
          maintainAspectRatio: false
        }
      };

      new Chart(document.getElementById("chart-coi-put"), config);

      data = {
        labels: allStrikePrices,
        datasets: [
          {
            label: "CALL COI",
            backgroundColor: "rgba(255,0,0,0.3)",
            data: allCallCOIDup,
            borderColor: "rgba(255,0,0,0.8)",
            borderWidth: 1
          },
          {
            label: "PUT COI",
            backgroundColor: "rgba(0,255,0,0.3)",
            data: allPutCOIDup,
            borderWidth: 1,
            borderColor: "rgba(0,255,0,0.8)"
          }
        ]
      };
      config = {
        type: "bar",
        data,
        options: {
          responsive: false,
          plugins: {
            legend: {
              position: "top",
              align: "start",
              labels: {
                padding: 10
              }
            },
            title: {
              display: true,
              text: Date(Date.now()) + " ",
              align: "start"
            }
          },
          maintainAspectRatio: false
        }
      };

      new Chart(document.getElementById("chart-change-in-oi"), config);

      arrThres = new Array(xCord.length);
      arrThres.fill(0.75);
      let arrThres2 = new Array(xCord.length);
      arrThres2.fill(0.35);

      data = {
        labels: xCord,
        datasets: [
          {
            label: "Call To Put Ratio",
            backgroundColor: "rgba(255,0,0,0.2)",
            borderColor: "rgb(255, 99, 132)",
            data: CPR,
            tension: 0.5
          },
          {
            label: "Put To Call Ratio",
            backgroundColor: "rgba(0,255,0,0.2)",
            borderColor: "rgba(0,255,0,0.4)",
            data: PCR,
            tension: 0.5
          },
          {
            label: "PUT Oversold Threshold",
            backgroundColor: "red",
            borderColor: "red",
            data: arrThres
          },
          {
            label: "PUT Undersold Threshold",
            backgroundColor: "green",
            borderColor: "green",
            data: arrThres2
          }
        ]
      };
      config = {
        type: "line",
        data,
        options: {
          responsive: false,
          plugins: {
            legend: {
              position: "top",
              align: "start",
              labels: {
                padding: 10
              }
            },
            title: {
              display: true,
              text: Date(Date.now()) + " ",
              align: "start"
            }
          },
          maintainAspectRatio: false
        }
      };

      new Chart(
        document.getElementById("chart-call-put-ratio-chart-both"),
        config
      );

      let CPRInvert = [];
      let normPCRCPR = [];

      CPR.forEach((ele, i) => {
        CPRInvert.push(-ele);

        if (PCR[i] < 0.18 && ele >= 0.85) {
          normPCRCPR.push(+1 / 2);
        } else if (PCR[i] >= 0.18 && PCR[i] < 0.35) {
          normPCRCPR.push(-0.5 / 2);
        } else if (PCR[i] <= 0.47 && PCR[i] >= 0.35 && ele >= 0.65) {
          normPCRCPR.push(-1 / 2);
        } else if (PCR[i] > 0.65 && PCR[i] < 0.77 && ele <= 0.2) {
          normPCRCPR.push(+1 / 2);
        } else if (PCR[i] >= 0.77 && PCR[i] < 0.85) {
          normPCRCPR.push(0.5 / 2);
        } else if (PCR[i] >= 0.85 && PCR[i] < 1) {
          normPCRCPR.push(-0.5 / 2);
        } else if (PCR[i] >= 1 && ele <= 0.13) {
          normPCRCPR.push(-1 / 2);
        } else {
          if (PCR[i] <= 0.47 && PCR[i] >= 0.35 && ele < 0.65) {
            normPCRCPR.push(0.5 / 2);
          } else if (PCR[i] > 0.65 && PCR[i] < 0.77 && ele > 0.2) {
            normPCRCPR.push(-0.5 / 2);
          } else {
            normPCRCPR.push(0);
          }
        }
      });

      data = {
        labels: xCord,
        datasets: [
          {
            label: "PCR",
            backgroundColor: "rgba(0,255,0,0.2)",
            borderColor: "rgba(0,255,0,0.4)",
            data: PCR,
            borderWidth: 1
          },
          {
            label: "CPR",
            backgroundColor: "rgba(255,0,0,0.2)",
            borderColor: "rgb(255, 99, 132)",
            data: CPRInvert,
            borderWidth: 1
          },
          {
            label: "Market Sentiment",
            backgroundColor: "grey",
            borderColor: "black",
            data: normPCRCPR,
            borderWidth: 1
          }
        ]
      };
      config = {
        type: "bar",
        data,
        options: {
          responsive: false,
          plugins: {
            legend: {
              position: "top",
              align: "start",
              labels: {
                padding: 10
              }
            },
            title: {
              display: true,
              text: Date(Date.now()) + " ",
              align: "start"
            }
          },
          maintainAspectRatio: false
        }
      };

      new Chart(document.getElementById("chart-put-call"), config);

      /*Removing Adds and fixing scroll */
      window.onscroll = function() {
        document.getElementById("quickLinkBand").style.opacity = "0";

        if (window.scrollY < 70) {
          window.scrollTo(0, 90);
        }

        if (window.scrollY > 250) {
          if (document.getElementsByTagName("table")[0] !== undefined)
            document.getElementsByTagName(
              "table"
            )[0].children[0].style.opacity = 0;
        } else {
          if (document.getElementsByTagName("table")[0] !== undefined)
            document.getElementsByTagName(
              "table"
            )[0].children[0].style.opacity = 1;
        }
      };

      /* Adding and Removing IV to track for the whole day */
      window.onclick = function(e) {
        if (e.target.id.match(/IVC/)) {
          if (e.target.checked) {
            if (checkedIVCall.some(iv => iv.id !== e.target.id)) {
              let obj = {
                id: e.target.id,
                value: [Number(e.target.value)]
              };
              checkedIVCall.push(obj);
              console.log("IV Added: " + e.target.id);
            }
          } else {
            if (checkedIVCall.some(iv => iv.id === e.target.id)) {
              checkedIVCall = checkedIVCall.filter(
                item => item.id !== e.target.id
              );
              console.log("IV Removed: " + e.target.id);
            }
          }
        }
        if (e.target.id.match(/IVP/)) {
          if (e.target.checked) {
            if (checkedIVPut.some(iv => iv.id !== e.target.id)) {
              let obj = {
                id: e.target.id,
                value: [Number(e.target.value)]
              };
              checkedIVPut.push(obj);
              console.log("IV Added: " + e.target.id);
            }
          } else {
            if (checkedIVPut.some(iv => iv.id === e.target.id)) {
              checkedIVPut = checkedIVPut.filter(
                item => item.id !== e.target.id
              );
              console.log("IV Removed: " + e.target.id);
            }
          }
        }
        localStorage.setItem("checkedIVPutData", JSON.stringify(checkedIVPut));
        localStorage.setItem(
          "checkedIVCallData",
          JSON.stringify(checkedIVCall)
        );
      };

      if (checkedIVPut.length > 1) {
        localStorage.setItem("checkedIVPutData", JSON.stringify(checkedIVPut));
      }
      if (checkedIVCall.length > 1) {
        localStorage.setItem(
          "checkedIVCallData",
          JSON.stringify(checkedIVCall)
        );
      }

      localStorage.setItem(
        "strikePriceTrackArr",
        JSON.stringify(strikePriceTrackArr)
      );

      /* Creating dataset for IV data */
      let IVDataset = [];
      checkedIVPut.forEach((ele, i) => {
        if (ele.id !== "dummy") {
          let strike = document.getElementById(ele.id).parentNode.parentNode
            .children[3].textContent;
          let obj = {
            label: "Put IV" + strike,
            backgroundColor: `rgba(0,255,0,${(i + 1) / checkedIVPut.length})`,
            borderColor: `rgba(0,255,0,${(i + 1) / checkedIVPut.length})`,
            data: ele.value
          };
          IVDataset.push(obj);
        }
      });

      checkedIVCall.forEach((ele, i) => {
        if (ele.id !== "dummy") {
          let strike = document.getElementById(ele.id).parentNode.parentNode
            .children[3].textContent;
          let obj = {
            label: "Call IV" + strike,
            backgroundColor: `rgba(255,0,0,${(i + 1) / checkedIVCall.length})`,
            borderColor: `rgba(255,0,0,${(i + 1) / checkedIVCall.length})`,
            data: ele.value
          };
          IVDataset.push(obj);
        }
      });

      data = {
        labels: xCord,
        datasets: IVDataset
      };
      config = {
        type: "line",
        data,
        options: {
          responsive: false,
          plugins: {
            legend: {
              position: "top",
              align: "start",
              labels: {
                padding: 10
              }
            },
            title: {
              display: true,
              text: Date(Date.now()) + " ",
              align: "start"
            }
          },
          maintainAspectRatio: false
        }
      };

      new Chart(document.getElementById("chart-IV"), config);

      /*Today's date validation creation  */
      let hr = Number(Date().toString().split(" ")[4].split(":")[0]);
      let minutes = Number(Date().toString().split(" ")[4].split(":")[1]);

      if ((hr >= 15 && minutes >= 30) || (hr <= 9 && minutes < 15)) {
        console.log("Not a good Time");
      } else {
        setTimeout(runme, 1000 * 100);
      }

      /* Rules */
      let footer = document.getElementsByClassName("nav-folderized")[0]
        .children[0].children[0];

      footer.innerHTML = ``;

      yCordCallCOI.forEach((ele, i) => {
        footer.innerHTML += `<div class="col-md-3" style="height:250px; margin-top:50px;margin-bottom:50px;"><h6 style="text-align:center;">PRICE: ${ele.label.split(
          " "
        )[2]}</h6><canvas style="float:left;height:250px;" id="donut${ele.label.split(
          " "
        )[2]}"></canvas> </div>`;
      });
      let arrHoverSentiment = [];
      Array.from(element).forEach((e, i) => {
        if (i === 0 || i == 1 || i === element.length - 1) {
          return;
        }

        let oiCall = e.children[0].textContent.replaceAll(",", "");
        let coiCall = e.children[1].textContent
          .split(" ")[0]
          .replaceAll(",", "");
        let coiPerCall = e.children[1].textContent
          .split(" ")[1]
          .split(")")[0]
          .replaceAll(/[(%]/g, "");

        let oiPut = e.children[6].textContent.replaceAll(",", "");
        let coiPut = e.children[5].textContent
          .split(" ")[0]
          .replaceAll(",", "");
        let coiPerPut = e.children[5].textContent
          .split(" ")[1]
          .split(")")[0]
          .replaceAll(/[(%]/g, "");

        if (
          oiCall * 0.3 +
            coiCall * 0.6 +
            coiPerCall * 0.1 -
            (oiPut * 0.3 + coiPut * 0.6 + coiPerPut * 0.1) >=
            0 &&
          Math.abs(coiCall / coiPut) >= 1.4
        ) {
          let obj = {
            price: e.children[3].textContent.replaceAll(",", ""),
            type: "bearish"
          };
          arrHoverSentiment.push(obj);
        } else if (
          oiCall * 0.3 +
            coiCall * 0.6 +
            coiPerCall * 0.1 -
            (oiPut * 0.3 + coiPut * 0.6 + coiPerPut * 0.1) <
            0 &&
          Math.abs(coiPut / coiCall) >= 1.4
        ) {
          let obj = {
            price: e.children[3].textContent.replaceAll(",", ""),
            type: "bulish"
          };
          arrHoverSentiment.push(obj);
        } else {
          let obj = {
            price: e.children[3].textContent.replaceAll(",", ""),
            type: "neutral"
          };
          arrHoverSentiment.push(obj);
        }
      });

      let callSentiment = [];

      yCordCallCOI.forEach(ele => {
        let arr = ele.data.slice(-5);
        let latestPrice = Number(arr[arr.length - 1]);
        let bearIncrease = false;
        let bearDecrease = false;

        if (latestPrice < 0 && Number(arr[0]) < 0) {
          latestPrice = Math.abs(latestPrice);
          arr[0] = Math.abs(arr[0]);
        }

        if (latestPrice > 1.2 * Number(arr[0])) {
          bearIncrease = true;
        }
        if (Number(arr[0]) > 1.2 * latestPrice) {
          bearDecrease = true;
        }

        if (bearIncrease && bearDecrease) {
          callSentiment.push(0);
        } else if (bearIncrease && !bearDecrease) {
          callSentiment.push(+1);
        } else if (!bearIncrease && bearDecrease) {
          callSentiment.push(-1);
        } else {
          callSentiment.push(0);
        }
      });

      let putSentiment = [];

      yCordPutCOI.forEach(ele => {
        let arr = ele.data.slice(-5);
        let latestPrice = Number(arr[arr.length - 1]);
        let bullIncrease = false;
        let bullDecrease = false;

        if (latestPrice < 0 && Number(arr[0]) < 0) {
          latestPrice = Math.abs(latestPrice);
          arr[0] = Math.abs(arr[0]);
        }

        if (latestPrice > 1.2 * Number(arr[0])) {
          bullIncrease = true;
        }
        if (Number(arr[0]) > 1.2 * latestPrice) {
          bullDecrease = true;
        }

        if (bullIncrease && bullDecrease) {
          putSentiment.push(0);
        } else if (bullIncrease && !bullDecrease) {
          putSentiment.push(+1);
        } else if (!bullIncrease && bullDecrease) {
          putSentiment.push(-1);
        } else {
          putSentiment.push(0);
        }
      });

      let hoverSentiment = [];

      yCordPutCOI.forEach(ele => {
        let index = -1;
        if (
          arrHoverSentiment.some(function(obj, j) {
            if (Number(obj.price) === Number(ele.label.split(" ")[2])) {
              index = j;
              return true;
            }
          })
        ) {
          if (arrHoverSentiment[index].type == "bulish") {
            hoverSentiment.push(+1);
          } else if (arrHoverSentiment[index].type == "bearish") {
            hoverSentiment.push(-1);
          } else {
            hoverSentiment.push(0);
          }
        }
      });

      yCordCallCOI.forEach((ele, i) => {
        let bulish = 0;
        let bearish = 0;
        let neutral = 0;

        if (hoverSentiment[i] === 1) {
          bulish += 26;
        } else if (hoverSentiment[i] === -1) {
          bearish += 26;
        } else {
          neutral += 26;
        }

        if (normPCRCPR[normPCRCPR.length - 1] > 0) {
          bulish += 30;
        } else if (normPCRCPR[normPCRCPR.length - 1] < 0) {
          bearish += 30;
        } else {
          neutral += 30;
        }

        if (callSentiment[i] === 1) {
          bearish += 22;
        } else if (callSentiment[i] === -1) {
          bulish += 22;
        } else {
          neutral += 22;
        }

        if (putSentiment[i] === 1) {
          bulish += 22;
        } else if (putSentiment[i] === -1) {
          bearish += 22;
        } else {
          neutral += 22;
        }

        let data = {
          labels: ["BULISH", "BEARISH", "NEUTRAL"],
          datasets: [
            {
              data: [bulish, bearish, neutral],
              backgroundColor: [
                "rgba(0, 255, 0,0.5)",
                "rgb(255, 99, 132)",
                "silver"
              ],
              hoverOffset: 4
            }
          ]
        };
        let config = {
          type: "doughnut",
          data: data
        };
        new Chart(
          document.getElementById("donut" + ele.label.split(" ")[2]),
          config
        );
      });

      /*Catch for errors and
      Then reload whole page  */
    } catch (err) {
      console.log("err occured !!" + err);
      reloadP();
    }

    /*Start reading all data after 6 sec of refresh clicked. */
  }, 1000 * 6);
}

window.onload = function() {
  let reloading = sessionStorage.getItem("reloading");
  if (reloading) {
    sessionStorage.removeItem("reloading");
    setTimeout(runme, 1000 * 6);
  }
};

function reloadP() {
  sessionStorage.setItem("reloading", "true");
  window.location.reload();
}
