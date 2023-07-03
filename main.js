chrome.runtime.onMessage.addListener(gotMessage);
/* Activator snippnet
   Activate the script
*/
function gotMessage(message, sender, sendResponse) {
  if (message.text === "go") {
    console.log("Pluto Activated");
    console.log(
      "Made by shubhamcodex - https://github.com/imshubhamcodex/Pluto---Chain-data-Analytics"
    );
    runme();
  }
}

/* Global variable use to store PCR CPR and IV data for one whole day.
  And do not orerwrite on recursion calls 
*/
let PCR = [];
let CPR = [];
let xCord = [];
let checkedIVPut = [{ id: "dummy" }];
let checkedIVCall = [{ id: "dummy" }];

/* Main entry point */
function runme() {
  /* For refresh */
  document.getElementsByClassName("refreshIcon")[0].click();
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
      let todatDate =
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
            Math.abs(coiCall / coiPut) >= 1.7
          ) {
            e.style.backgroundColor = "rgba(255,0,0,0.2)";
          } else if (
            oiCall * 0.3 +
              coiCall * 0.6 +
              coiPerCall * 0.1 -
              (oiPut * 0.3 + coiPut * 0.6 + coiPerPut * 0.1) <
              0 &&
            Math.abs(coiPut / coiCall) >= 1.7
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
      if (
        todatDate !== localStorage.getItem("PCRSavedDate") &&
        localStorage.getItem("PCRSavedDate") !== null
      ) {
        localStorage.removeItem("PCRData");
        localStorage.removeItem("CPRData");
        localStorage.removeItem("PCRxCord");
        localStorage.removeItem("checkedIVPutData");
        localStorage.removeItem("checkedIVCallData");

        PCR = [];
        CPR = [];
        xCord = [];
        PCR.push((top5PutCOI / (2.5 * top5CallCOI)).toFixed(2));
        CPR.push((top5CallCOI / (2.5 * top5PutCOI)).toFixed(2));
        xCord.push(Date(Date.now()).toString().split(" ")[4]);
        localStorage.setItem(
          "PCRSavedDate",
          dateSplitArr[0] + dateSplitArr[1] + dateSplitArr[2] + dateSplitArr[3]
        );
      } else {
        localStorage.setItem("PCRData", JSON.stringify(PCR));
        localStorage.setItem("CPRData", JSON.stringify(CPR));
        localStorage.setItem("PCRxCord", JSON.stringify(xCord));
        localStorage.setItem(
          "PCRSavedDate",
          dateSplitArr[0] + dateSplitArr[1] + dateSplitArr[2] + dateSplitArr[3]
        );
      }
      /* Chart Plot segement */
      document.getElementById("EqNote").innerHTML = `
      <canvas style="height:600px;"  id="chart-change-in-oi"> </canvas>
    <br />
    <br />
    <br />
      
    <canvas style="height:600px;"  id="chart-put-call-ratio-chart"> </canvas>
    <br />
    <br />
    <br />

    <canvas style="height:600px;"  id="chart-call-put-ratio-chart"> </canvas>


    <br />
    <br />
    <br />

    <canvas style="height:600px;"  id="chart-call-put-ratio-chart-both"> </canvas>

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
      arrThres.fill(1.05);

      let data = {
        labels: xCord,
        datasets: [
          {
            label: "Put To Call Ratio",
            backgroundColor: "rgba(0,255,0,0.2)",
            borderColor: "rgba(0,255,0,0.4)",
            data: PCR,
            tension: 0.5
          },
          {
            label: "Threshold",
            backgroundColor: "grey",
            borderColor: "grey",
            data: arrThres
          }
        ]
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
              text: Date(Date.now()) + " ",
              align: "start"
            }
          },
          maintainAspectRatio: false
        }
      };

      new Chart(document.getElementById("chart-put-call-ratio-chart"), config);

      data = {
        labels: allStrikePrices,
        datasets: [
          {
            label: "CALL COI",
            backgroundColor: "rgba(255,0,0,0.4)",
            data: allCallCOIDup
          },
          {
            label: "PUT COI",
            backgroundColor: "rgba(0,255,0,0.4)",
            data: allPutCOIDup
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
      arrThres.fill(0.8);
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
            label: "Threshold",
            backgroundColor: "grey",
            borderColor: "grey",
            data: arrThres
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

      new Chart(document.getElementById("chart-call-put-ratio-chart"), config);

      let arrMedian = [];
      PCR.forEach((ele, i) => {
        arrMedian.push((Number(Number(ele) + Number(CPR[i])) / 2).toFixed(2));
      });

      arrThres = new Array(xCord.length);
      arrThres.fill(0.65);

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
            label: "Median",
            backgroundColor: "teal",
            borderColor: "teal",
            data: arrMedian,
            tension: 0.5
          },
          {
            label: "Median Threshold",
            backgroundColor: "grey",
            borderColor: "grey",
            data: arrThres
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

        if (ele < 0.3) {
          normPCRCPR.push(PCR[i] - 2 * ele - 0.15);
        } else if (PCR[i] < 0.5) {
          normPCRCPR.push(1.4 * PCR[i] - ele - 0.15);
        } else {
          normPCRCPR.push(PCR[i] - ele - 0.15);
        }
      });

      data = {
        labels: xCord,
        datasets: [
          {
            label: "PCR",
            backgroundColor: "rgba(0,255,0,0.2)",
            borderColor: "rgba(0,255,0,0.4)",
            data: PCR
          },
          {
            label: "CPR",
            backgroundColor: "rgba(255,0,0,0.2)",
            borderColor: "rgb(255, 99, 132)",
            data: CPRInvert
          },
          {
            label: "Market Sentiment",
            backgroundColor: "grey",
            borderColor: "black",
            data: normPCRCPR
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

      localStorage.setItem("checkedIVPutData", JSON.stringify(checkedIVPut));
      localStorage.setItem("checkedIVCallData", JSON.stringify(checkedIVCall));

      /* Creating dataset for IV data */
      let IVDataset = [];
      checkedIVPut.forEach((ele, i) => {
        if (ele.id !== "dummy") {
          let strike = document.getElementById(ele.id).parentNode.parentNode
            .children[3].textContent;
          let obj = {
            label: "Put IV" + strike,
            backgroundColor: `rgba(0,255,0,${(i + 1) / checkedIVPut.length})`,
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

      let hr = Number(Date().toString().split(" ")[4].split(":")[0]);
      let minutes = Number(Date().toString().split(" ")[4].split(":")[1]);

      if ((hr >= 15 && minutes >= 30) || (hr <= 9 && minutes <= 10)) {
        console.log("Not a good Time");
      } else {
        setTimeout(runme, 1000 * 90);
      }
    } catch (err) {
      console.log("err occured !!" + err);
    }
  }, 1000 * 6);
}
