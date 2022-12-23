const axios = require("axios");
const { JSDOM } = require("jsdom");
const fs = require("fs");

const data = {};

(async () => {
  for (let i = 2; i <= 7; i++) {
    const sourceRaw = await axios
      .get("https://elearning.dongzong.my/course/index.php?categoryid=" + i, {
        withCredentials: true,
        headers: {
          Cookie:
            "MoodleSession=fl22cv9i65s2bqcasn3dgv2jdp; MOODLEID1_=S%25B5%25CC%25C2%2584%25D5%2583",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
        },
      })
      .then((e) => e.data);
    const sourceDom = new JSDOM(sourceRaw);
    const sourceLinks = Array.from(
      sourceDom.window.document.querySelectorAll(".coursebox a")
    )
      .map((e) => [e.getAttribute("href"), e.textContent.trim()])
      .filter((e) => e[0].includes("view"));

    for (let link of sourceLinks) {
      const ID = link[0].split("=").pop();

      const raw = await axios
        .get(`https://elearning.dongzong.my/course/view.php?id=${ID}`, {
          withCredentials: true,
          headers: {
            Cookie:
              "MoodleSession=fl22cv9i65s2bqcasn3dgv2jdp; MOODLEID1_=S%25B5%25CC%25C2%2584%25D5%2583",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
          },
        })
        .then((e) => e.data);

      const dom = new JSDOM(raw);
      const links = Array.from(
        dom.window.document.querySelectorAll(".activityinstance a")
      )
        .map((e) => e.getAttribute("href"))
        .filter((e) => e.includes("book"));
      for (url of links) {
        const raw2 = await axios(url, {
          withCredentials: true,
          headers: {
            Cookie:
              "MoodleSession=fl22cv9i65s2bqcasn3dgv2jdp; MOODLEID1_=S%25B5%25CC%25C2%2584%25D5%2583",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
          },
        }).then((e) => e.data);
        const dom2 = new JSDOM(raw2);
        const l = dom2.window.document.querySelector("[role='main'] h4 a");
        if (l) {
          const links2 = l.getAttribute("href");
          let [, , , category, grade, subject, subsubject, chapter] = links2
            .split("/")
            .map((e) => e.trim());
          if (chapter.endsWith(".html")) {
            chapter = chapter.split(".")[0];
            subsubject = "";
          } else {
            if (chapter === "mobile") {
              chapter = subsubject;
              subsubject = "";
            }
          }
          console.log(grade, subject, link[1]);
          data[grade] = data[grade] || {};
          data[grade][subject] = link[1];
          break;
        }
      }
    }
    fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
  }
})();
