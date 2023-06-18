chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(message, sender, sendResponse) {
  if (message.text === "go") {
    console.log("Execute Script!");
    runme();
  }
}

function runme() {
  document.getElementsByClassName("refreshIcon")[0].click();
  setTimeout(() => {
    document.getElementsByClassName("container top_logomenu")[0].style.display =
      "none";
    document.getElementsByClassName(
      "container navlinks-container posrel"
    )[0].style.display =
      "none";
    document.getElementsByClassName("nav nav-tabs")[0].style.display = "none";
    document.getElementsByClassName("notranslate")[0].style.paddingTop = "0px";

    let table1 = document.getElementById("optionChainTable-indices");

    let header = table1.children[0].children[1];
    table1.children[0].children[0].innerHTML = `<th class="text-center" id="calls" colspan="4">CALLS</th>
<th class="text-center" id="puts" colspan="5">PUTS</th>`;

    Array.from(header.children).forEach((e, i) => {
      if (
        i !== 1 &&
        i !== 2 &&
        i !== 5 &&
        i !== 11 &&
        i !== 21 &&
        i !== 20 &&
        i !== 17
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
    Array.from(body.children).forEach((e, i) => {
      let testStrike = Number(
        e.children[11].children[0].textContent.replaceAll(",", "")
      );
      if (testStrike === roundStrike) {
        strikeIndex = i;
      }
    });

    Array.from(body.children).forEach((e, i) => {
      if (i < strikeIndex - 3 || i > strikeIndex + 6) {
        body.removeChild(e);
      } else {
        Array.from(e.children).forEach((ele, j) => {
          if (
            j !== 1 &&
            j !== 2 &&
            j !== 5 &&
            j !== 11 &&
            j !== 21 &&
            j !== 20 &&
            j !== 17
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

    //
    //
    //
    // Calculating %change in IO
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

    //
    //
    //
    //
    //Changing bg color of OI
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
        ? "0.4"
        : "0.2"});z-index:999; border-top-right-radius:8px; border-bottom-right-radius:8px; ">
&nbsp;</div>`;

      maxOI = putOIArr[0];
      oiCall = Number(e.children[6].textContent.replaceAll(",", ""));
      change = oiCall * 100 / maxOI;

      e.children[6].style.position = "relative";
      e.children[6].innerHTML += `<div style="position:absolute;top:2px; height:76%; right:0px;
width:${change}%;background:rgba(0,255,0,${change === 100
        ? "0.4"
        : "0.2"});z-index:999; border-top-left-radius:8px; border-bottom-left-radius:8px; ">
&nbsp;</div>`;
    });

    //
    //
    //
    //
    //Making COI bold
    COIArrCall.sort(function(a, b) {
      return b - a;
    });
    COIArrPut.sort(function(a, b) {
      return b - a;
    });
    Array.from(body.children).forEach((ele, i) => {
      let actual = ele.textContent.split(" ")[1].split(")")[0] + ")";

      if (
        actual === "(" + COIArrCall[0] + "%)" ||
        actual === "(" + COIArrCall[1] + "%)" ||
        actual === "(" + COIArrCall[COIArrCall.length - 1] + "%)" ||
        actual === "(" + COIArrCall[COIArrCall.length - 2] + "%)"
      ) {
        ele.children[1].style.fontWeight = "bold";
      }

      actual = ele.textContent.split(" ")[2].split(")")[0] + ")";

      if (
        actual === "(" + COIArrPut[0] + "%)" ||
        actual === "(" + COIArrPut[1] + "%)" ||
        actual === "(" + COIArrPut[COIArrPut.length - 1] + "%)" ||
        actual === "(" + COIArrPut[COIArrPut.length - 2] + "%)"
      ) {
        ele.children[5].style.fontWeight = "bold";
      }
    });

    let element = document.getElementsByTagName("tr");
    Array.from(element).forEach(e => {
      e.addEventListener("mouseover", function(ele) {
        e.style.backgroundColor = "grey";
      });
      e.addEventListener("mouseout", function(ele) {
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

    window.scrollTo(0, 0);

    setTimeout(runme, 1000 * 60 * 1);
  }, 1000 * 10);
}
