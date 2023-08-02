chrome.runtime.onMessage.addListener(gotMessage);

/* Global variable use to store PCR CPR data for one whole day.
  And do not orerwrite on recursion calls 
*/
let PCR = [];
let CPR = [];
let xCord = [];
let strikePriceTrackArr = [];
let signalWidthArr = [];

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

    let hr = Number(Date().toString().split(" ")[4].split(":")[0]);
    let minutes = Number(Date().toString().split(" ")[4].split(":")[1]);

    if (todayDate !== localStorage.getItem("PCRSavedDate")) {
      localStorage.removeItem("PCRData");
      localStorage.removeItem("CPRData");
      localStorage.removeItem("PCRxCord");
      localStorage.removeItem("strikePriceTrackArr");
      localStorage.removeItem("PCRSavedDate");
      localStorage.removeItem("signalWidthArr");

      localStorage.setItem("PCRSavedDate", todayDate);
    } else if (
      todayDate === localStorage.getItem("PCRSavedDate") &&
      (hr < 9 || (hr == 9 && minutes < 15))
    ) {
      localStorage.removeItem("PCRData");
      localStorage.removeItem("CPRData");
      localStorage.removeItem("PCRxCord");
      localStorage.removeItem("strikePriceTrackArr");
      localStorage.removeItem("PCRSavedDate");
      localStorage.removeItem("signalWidthArr");
      console.log("Not a good Time");

      return;
    } else {
      strikePriceTrackArr = JSON.parse(
        localStorage.getItem("strikePriceTrackArr")
      );
      signalWidthArr = JSON.parse(localStorage.getItem("signalWidthArr"));
      PCR = JSON.parse(localStorage.getItem("PCRData"));
      CPR = JSON.parse(localStorage.getItem("CPRData"));
      xCord = JSON.parse(localStorage.getItem("PCRxCord"));
    }

    if (!signalWidthArr) {
      signalWidthArr = [];
    }
    if (!PCR) {
      PCR = [];
    }
    if (!CPR) {
      CPR = [];
    }
    if (!xCord) {
      xCord = [];
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
      document.getElementById("OptionChainEquityCMSNote").style.display =
        "none";
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

      /* Removing other unimportant elements from headers*/
      Array.from(header.children).forEach((e, i) => {
        if (
          i !== 1 &&
          i !== 2 &&
          i !== 3 &&
          i !== 11 &&
          i !== 21 &&
          i !== 20 &&
          i !== 19
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
              j !== 3 &&
              j !== 11 &&
              j !== 21 &&
              j !== 20 &&
              j !== 19
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
      let max1Call = -999;
      let max2Call = -998;
      let max1Put = -999;
      let max2Put = -998;
      let max1IndexCall = -1;
      let max2IndexCall = -1;
      let max1IndexPut = -1;
      let max2IndexPut = -1;

      Array.from(body.children).forEach((e, i) => {
        allStrikePrices.push(e.children[3].textContent);

        let num = Number(e.children[2].textContent.replaceAll(",", ""));
        if (num > max1Call) {
          max2Call = max1Call;
          max2IndexCall = max1IndexCall;
          max1Call = num;
          max1IndexCall = i;
        } else if (num > max2Call && num !== max1Call) {
          max2Call = num;
          max2IndexCall = i;
        }

        num = Number(e.children[4].textContent.replaceAll(",", ""));
        if (num > max1Put) {
          max2Put = max1Put;
          max2IndexPut = max1IndexPut;
          max1Put = num;
          max1IndexPut = i;
        } else if (num > max2Put && num !== max1Put) {
          max2Put = num;
          max2IndexPut = i;
        }
      });

      body.children[max1IndexCall].children[2].style.fontWeight = "bold";
      body.children[max2IndexCall].children[2].style.fontWeight = "bold";
      body.children[max1IndexPut].children[4].style.fontWeight = "bold";
      body.children[max2IndexPut].children[4].style.fontWeight = "bold";

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

      localStorage.setItem("PCRData", JSON.stringify(PCR));
      localStorage.setItem("CPRData", JSON.stringify(CPR));
      localStorage.setItem("PCRxCord", JSON.stringify(xCord));

      /* 
      Chart Plot segement 
    */
      document.getElementById("EqNoteMade").innerHTML = `
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
    <br />

    <canvas style="height:600px;"  id="atrChart"> </canvas>

    <br />
    <br />
    <br />

    <canvas style="height:600px;"  id="adxChart"> </canvas>
   
    <br />
    <br />
    <br />

    <canvas style="height:600px;"  id="signal-history"> </canvas>

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

      let tableRowEle = document.getElementsByTagName("tr");
      Array.from(tableRowEle).forEach((e, i) => {
        if (i === 0 || i == 1 || i === tableRowEle.length - 1) {
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

      //Implementing ATR

      function calculateTrueRange(high, low, previousClose) {
        return Math.max(
          high - low,
          Math.abs(high - previousClose),
          Math.abs(low - previousClose)
        );
      }

      function calculateATR(data, period = 10) {
        let atrData = [];

        // Calculate the first true range
        let firstTrueRange = calculateTrueRange(
          data[0].High,
          data[0].Low,
          data[0].Close
        );

        // Set the first ATR as the first true range
        atrData.push({ Date: data[0].Date, ATR: firstTrueRange });

        for (let i = 1; i < data.length; i++) {
          let trueRange = calculateTrueRange(
            data[i].High,
            data[i].Low,
            data[i - 1].Close
          );
          let atr = (atrData[i - 1].ATR * (period - 1) + trueRange) / period;
          atrData.push({ Date: data[i].Date, ATR: atr });
        }

        return atrData;
      }

      // Example usage:
      // Assuming you have historical price data in an array of objects named 'priceData'
      // Object structure: { Date: 'yyyy-mm-dd', Open: number, High: number, Low: number, Close: number, Volume: number }

      let priceDataCall = [];
      let priceDataPut = [];
      xCord.forEach((ele, p) => {
        if (p + 1 > strikePriceTrackArr[0].valueCall.length) return;

        let openCall = 0;
        let highCall = 0;
        let lowCall = 0;
        let closeCall = 0;

        let data = 0;

        strikePriceTrackArr.forEach(eachData => {
          data = eachData;

          let dataValueCall = [...data.valueCall.slice(0, p + 1)];
          dataValueCall = dataValueCall.filter(x => x != 0);
          if (dataValueCall.length == 0) return;
          openCall += dataValueCall[0];
          closeCall += dataValueCall[dataValueCall.length - 1];

          dataValueCall.sort((a, b) => a - b);

          lowCall += dataValueCall[0];
          highCall += dataValueCall[dataValueCall.length - 1];
        });

        let obj = {
          Date: ele,
          Open: openCall / strikePriceTrackArr.length,
          High: highCall / strikePriceTrackArr.length,
          Low: lowCall / strikePriceTrackArr.length,
          Close: closeCall / strikePriceTrackArr.length
        };

        if (obj.Open !== undefined) {
          priceDataCall.push(obj);
        } else {
          let obj = {
            Date: ele,
            Open: 0,
            High: 0,
            Low: 0,
            Close: 0
          };
          priceDataCall.push(obj);
        }
      });

      // Calculate ATR with default period (14 days)
      let atrData = calculateATR(priceDataCall);
      let dates = atrData.map(item => item.Date.toString());
      // Extract Date and ATR values for plotting

      let atrValuesCall = atrData.map(item => item.ATR.toFixed(2).toString());

      xCord.forEach((ele, p) => {
        if (p + 1 > strikePriceTrackArr[0].valueCall.length) return;

        let openPut = 0;
        let closePut = 0;
        let highPut = 0;
        let lowPut = 0;

        let data = 0;

        strikePriceTrackArr.forEach(eachData => {
          data = eachData;
          let dataValuePut = [...data.valuePut.slice(0, p + 1)];
          dataValuePut = dataValuePut.filter(x => x != 0);
          if (dataValuePut.length == 0) return;
          openPut += dataValuePut[0];
          closePut += dataValuePut[dataValuePut.length - 1];

          dataValuePut.sort((a, b) => a - b);

          lowPut += dataValuePut[0];
          highPut += dataValuePut[dataValuePut.length - 1];
        });

        let obj = {
          Date: ele,
          Open: openPut / strikePriceTrackArr.length,
          High: highPut / strikePriceTrackArr.length,
          Low: lowPut / strikePriceTrackArr.length,
          Close: closePut / strikePriceTrackArr.length
        };

        if (obj.Open !== undefined) {
          priceDataPut.push(obj);
        } else {
          let obj = {
            Date: ele,
            Open: 0,
            High: 0,
            Low: 0,
            Close: 0
          };
          priceDataPut.push(obj);
        }
      });

      atrData = calculateATR(priceDataPut);
      let atrValuesPut = atrData.map(item => item.ATR.toFixed(2).toString());
      let combinedATR = [];
      atrValuesPut.forEach((ele, i) => {
        combinedATR.push(ele - atrValuesCall[i]);
      });

      data = {
        labels: dates,
        datasets: [
          {
            label: "ATR - CALL(increases when volatility in CALL increases)",
            backgroundColor: "rgba(255,0,0,0.3)",
            data: atrValuesCall,
            borderColor: "rgba(255,0,0,0.8)",
            borderWidth: 1
          },
          {
            label: "ATR - PUT(increases when volatility in PUT increases)",
            backgroundColor: "rgba(0,255,0,0.3)",
            data: atrValuesPut,
            borderColor: "rgba(0,255,0,0.8)",
            borderWidth: 1
          },
          {
            label: "ATR - Net",
            backgroundColor: "rgba(0,0,0,0.3)",
            data: combinedATR,
            borderColor: "rgba(0,0,0,0.8)",
            borderWidth: 1
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

      new Chart(document.getElementById("atrChart"), config);

      // Function to calculate the Average Directional Index (ADX)
      function calculateADX(highPrices, lowPrices, closePrices, period = 10) {
        const trueRanges = [];
        const directionalMovementUp = [];
        const directionalMovementDown = [];

        for (let i = 1; i < highPrices.length; i++) {
          const trueHigh = highPrices[i] - lowPrices[i];
          const trueLow = Math.abs(highPrices[i] - closePrices[i - 1]);
          const trueClose = Math.abs(lowPrices[i] - closePrices[i - 1]);

          const trueRange = Math.max(trueHigh, trueLow, trueClose);
          trueRanges.push(trueRange);

          const directionUp = highPrices[i] - highPrices[i - 1];
          const directionDown = lowPrices[i - 1] - lowPrices[i];

          directionalMovementUp.push(Math.max(directionUp, 0));
          directionalMovementDown.push(Math.max(directionDown, 0));
        }

        const smoothedTrueRange = [trueRanges[0]];
        const smoothedDirectionalMovementUp = [directionalMovementUp[0]];
        const smoothedDirectionalMovementDown = [directionalMovementDown[0]];

        for (let i = 1; i < trueRanges.length; i++) {
          smoothedTrueRange.push(
            (smoothedTrueRange[i - 1] * (period - 1) + trueRanges[i]) / period
          );
          smoothedDirectionalMovementUp.push(
            (smoothedDirectionalMovementUp[i - 1] * (period - 1) +
              directionalMovementUp[i]) /
              period
          );
          smoothedDirectionalMovementDown.push(
            (smoothedDirectionalMovementDown[i - 1] * (period - 1) +
              directionalMovementDown[i]) /
              period
          );
        }

        const positiveDirectionalIndex = smoothedTrueRange.map(
          (value, i) => 100 * (smoothedDirectionalMovementUp[i] / value)
        );
        const negativeDirectionalIndex = smoothedTrueRange.map(
          (value, i) => 100 * (smoothedDirectionalMovementDown[i] / value)
        );

        const directionalMovementIndex = positiveDirectionalIndex.map(
          (value, i) =>
            100 *
            (Math.abs(value - negativeDirectionalIndex[i]) /
              (value + negativeDirectionalIndex[i]))
        );

        const adx = [];
        for (let i = period - 1; i < directionalMovementIndex.length; i++) {
          const sumDMI = directionalMovementIndex
            .slice(i - period + 1, i + 1)
            .reduce((sum, value) => sum + value, 0);
          adx.push(sumDMI / period);
        }

        return adx;
      }

      // Extract Open, High, Low, and Close prices from the priceData array
      let highPrices = priceDataCall.map(data => data.High);
      let lowPrices = priceDataCall.map(data => data.Low);
      let closePrices = priceDataCall.map(data => data.Close);

      // Calculate ADX values
      const adxValuesCall = calculateADX(highPrices, lowPrices, closePrices);

      highPrices = priceDataPut.map(data => data.High);
      lowPrices = priceDataPut.map(data => data.Low);
      closePrices = priceDataPut.map(data => data.Close);

      const adxValuesPut = calculateADX(highPrices, lowPrices, closePrices);

      let combinedADX = [];
      adxValuesPut.forEach((ele, i) => {
        combinedADX.push((ele - adxValuesCall[i]).toFixed(2));
      });

      data = {
        labels: Array.from({ length: adxValuesCall.length }, (_, i) => i + 10),
        dates,
        datasets: [
          {
            label: "ADX - Combined",
            backgroundColor: "rgba(0,0,0,0.3)",
            data: combinedADX,
            borderColor: "rgba(0,0,0,0.8)",
            borderWidth: 1
          }
        ]
      };
      config = {
        type: "line",
        data,
        options: {
          scales: {
            x: {
              title: {
                display: true,
                text: "Period"
              }
            },
            y: {
              title: {
                display: true,
                text: "ADX Value"
              }
            }
          },
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

      new Chart(document.getElementById("adxChart"), config);

      // Implementing Signal
      let adxSignal = 0;
      let putSignal = 0;
      let callSignal = 0;

      function checkSlope(anyPriceData, type) {
        let slopeChanges = 0;
        let previousSlope = 0;

        for (let i = 1; i < anyPriceData.length; i++) {
          const currentSlope = anyPriceData[i] - anyPriceData[i - 1];
          if (
            currentSlope !== 0 &&
            Math.sign(currentSlope) !== Math.sign(previousSlope)
          ) {
            slopeChanges++;
            if (currentSlope > 0) {
              if (type === "adx") adxSignal = 1;
              if (type === "put") putSignal = 1;
              if (type === "call") callSignal = 1;
              // console.log(
              //   `Slope change ${slopeChanges}: Increasing data point ${anyPriceData[
              //     i
              //   ]}`
              // );
            } else if (currentSlope < 0) {
              if (type === "adx") adxSignal = -1;
              if (type === "put") putSignal = -1;
              if (type === "call") callSignal = -1;
              // console.log(
              //   `Slope change ${slopeChanges}: Decreasing data point ${anyPriceData[
              //     i
              //   ]}`
              // );
            } else {
              if (type === "adx") adxSignal = 0;
              if (type === "put") putSignal = 0;
              if (type === "call") callSignal = 0;
              // console.log(`No Slope change data point ${anyPriceData[i]}`);
            }
          }
          previousSlope = currentSlope;
        }
      }

      const priceDataPutVal = priceDataPut.map(item => item.Close);
      const priceDataCallVal = priceDataCall.map(item => item.Close);
      checkSlope(priceDataPutVal, "put");
      checkSlope(priceDataCallVal, "call");
      checkSlope(combinedADX, "adx");

      let signalWidth = -1;

      if (
        adxSignal === 1 &&
        putSignal === 1 &&
        callSignal <= 0 &&
        normPCRCPR[normPCRCPR.length - 1] > 0
      ) {
        // console.log("100% BUY");
        signalWidth = 100;
      } else if (
        adxSignal === 1 &&
        putSignal === 1 &&
        callSignal === 1 &&
        normPCRCPR[normPCRCPR.length - 1] > 0
      ) {
        // console.log("75% BUY");
        signalWidth = 75;
      } else if (
        adxSignal === -1 &&
        putSignal <= 0 &&
        callSignal === 1 &&
        normPCRCPR[normPCRCPR.length - 1] < 0
      ) {
        // console.log("100% SELL");
        signalWidth = 0;
      } else if (
        adxSignal === -1 &&
        putSignal <= 0 &&
        callSignal === -1 &&
        normPCRCPR[normPCRCPR.length - 1] < 0
      ) {
        // console.log("75% SELL");
        signalWidth = 25;
      } else if (
        adxSignal === -1 &&
        putSignal === 1 &&
        callSignal === -1 &&
        normPCRCPR[normPCRCPR.length - 1] > 0
      ) {
        // console.log("50% SELL");
        signalWidth = 50;
      } else if (
        adxSignal === -1 &&
        putSignal === 1 &&
        callSignal <= 0 &&
        normPCRCPR[normPCRCPR.length - 1] >= 0
      ) {
        // console.log("25% SELL");
        signalWidth = 75;
      } else if (
        adxSignal === 1 &&
        putSignal <= 0 &&
        callSignal === 1 &&
        normPCRCPR[normPCRCPR.length - 1] < 0
      ) {
        // console.log("50% BUY");
        signalWidth = 50;
      } else if (
        adxSignal === 1 &&
        putSignal <= 0 &&
        callSignal === -1 &&
        normPCRCPR[normPCRCPR.length - 1] <= 0
      ) {
        // console.log("25% BUY");
        signalWidth = 25;
      } else {
        // console.log("No action required.");
        // console.log(
        //   adxSignal,
        //   putSignal,
        //   callSignal,
        //   normPCRCPR[normPCRCPR.length - 1]
        // );
        signalWidth = -1;
      }

      signalWidthArr = JSON.parse(localStorage.getItem("signalWidthArr"));
      if (signalWidthArr == null || signalWidthArr.length == 0) {
        signalWidthArr = [];
      }

      signalWidthArr.push(signalWidth);

      localStorage.setItem("signalWidthArr", JSON.stringify(signalWidthArr));

      document.getElementById("equity_optionChainTable").style.position =
        "relative";
      document.getElementById("equity_optionChainTable").innerHTML =
        `<p class="bold">Predicted Sentiment</p>
        <div style="position:absolute;top:17px; height:20px; right:0px;
      width:${signalWidth >= 0
        ? signalWidth
        : 0.1}%;background-color:rgba(0,255,0,0.6);
      z-index:9; margin-right:${0}%"><span style="float:right; font-weight:bold">BUY(${signalWidth >=
        0
          ? signalWidth
          : 0})%</span></div>
      <div style="position:absolute;top:17px; height:20px; left:0px;
      width:${100 - signalWidth > 100
        ? 0.1
        : 100 - signalWidth}%;background:rgba(255,0,0,0.6);
      z-index:9;margin-left:${0}%"><span style="float:left; font-weight:bold">SELL(${100 -
          signalWidth >
        100
          ? 0
          : 100 - signalWidth})%</span></div></div>
      <p></p>
      ` + document.getElementById("equity_optionChainTable").innerHTML;

      let yCordsignalWidthArrCall = [];
      let yCordsignalWidthArrPut = [];

      signalWidthArr.forEach(ele => {
        if (ele === -1) {
          yCordsignalWidthArrPut.push(0);
          yCordsignalWidthArrCall.push(0);
        } else {
          yCordsignalWidthArrPut.push(ele);
          yCordsignalWidthArrCall.push(-100 + ele);
        }
      });

      data = {
        labels: dates,
        datasets: [
          {
            label: "Buy Signal Strength %",
            backgroundColor: "rgba(0,255,0,0.3)",
            data: yCordsignalWidthArrPut,
            borderColor: "rgba(0,255,0,0.8)",
            borderWidth: 1
          },
          {
            label: "Call Signal Strength %",
            backgroundColor: "rgba(255,0,0,0.3)",
            data: yCordsignalWidthArrCall,
            borderColor: "rgba(255,0,0,0.8)",
            borderWidth: 1
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

      new Chart(document.getElementById("signal-history"), config);

      localStorage.setItem(
        "strikePriceTrackArr",
        JSON.stringify(strikePriceTrackArr)
      );
      /*Today's date validation creation  */
      let hr = Number(Date().toString().split(" ")[4].split(":")[0]);
      let minutes = Number(Date().toString().split(" ")[4].split(":")[1]);

      if (
        hr > 15 ||
        (hr == 15 && minutes > 30) ||
        (hr < 9 || (hr == 9 && minutes < 15))
      ) {
        console.log("Not a good Time");
        return;
      } else {
        setTimeout(runme, 1000 * 100);
      }

      /* Adding hover effect and sentiments on each strike price*/
      Array.from(tableRowEle).forEach((e, i) => {
        e.addEventListener("mouseover", function() {
          e.style.backgroundColor = "grey";

          if (i === 0 || i === tableRowEle.length - 1) {
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

      /*Catch for errors and
      Then reload whole page  */
    } catch (err) {
      console.log("err occured !!" + err);
      // reloadP();
    }
    /*Start reading all data after 6 sec of refresh clicked. */
  }, 1000 * 6);
}

window.onload = function() {
  document.getElementById(
    "optChainCont"
  ).innerHTML += `<div style="padding-left:65px" id="EqNoteMade"></div>`;
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

/* Breakout Rules
1. COI >= 2*COI
2. OI >= OI +- 20%
3. Backward/Forward 2 COI must be greater than 1.5 : 1 ratio
4. PCR < 0.8 and PCR > 0.2
*/
